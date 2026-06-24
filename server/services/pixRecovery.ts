import { container } from '../shared/container';

export function startPixRecoveryCron() {
  console.log('[Pix Recovery] Scheduled job started');
  
  // Run immediately on boot to recover offline payloads, then every 30 minutes
  setTimeout(recoverPendingPayments, 10000); // short delay after boot
  setInterval(recoverPendingPayments, 30 * 60 * 1000); 
}

let isRecovering = false;
export async function recoverPendingPayments() {
  if (isRecovering) return;
  isRecovering = true;
  
  try {
    const payments = await container.paymentRepository.getPaymentsPix();
    const pendings = payments.filter((p: any) => p.status === 'pendente');
    if (pendings.length > 0) {
      console.log(`[Pix Recovery] Found ${pendings.length} pending payments. Checking with Provider...`);
      let recovered = 0;
      for (const payment of pendings) {
        try {
          const isPaid = await container.paymentProvider.checkPixStatus(payment.txid);
          if (isPaid) {
            await container.queueService.enqueue('payment-queue', 'process-payment-success', { payment });
            recovered++;
          }
        } catch (err) {
          console.error(`[Pix Recovery] Error recovering txid ${payment.txid}:`, err);
        }
      }
      if (recovered > 0) {
        console.log(`[Pix Recovery] Successfully recovered ${recovered} payments that missed the webhook.`);
      }
    }
  } catch (err) {
    console.error('[Pix Recovery] Cron job failed:', err);
  } finally {
    isRecovering = false;
  }
}
