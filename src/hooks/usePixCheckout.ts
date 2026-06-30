/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export type PixStatus = 'aguardando' | 'recebido' | 'processando' | 'confirmado' | 'expirado' | 'cancelado';

export interface PixPaymentData {
  id: string;
  qrcode: string;
  copia_cola: string;
  valor: number;
}

export function usePixCheckout(paymentInitData: PixPaymentData | null, onSuccess?: () => void) {
  const [status, setStatus] = useState<PixStatus>('aguardando');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes default expiry

  useEffect(() => {
    if (paymentInitData) {
      setStatus('aguardando');
      setTimeLeft(15 * 60);
    }
  }, [paymentInitData]);

  // Polling logic encapsulated
  useEffect(() => {
    let intervalId: any;

    const checkStatus = async () => {
      if (!paymentInitData) return;
      
      try {
        const res = await api.getPaymentStatus(paymentInitData.id);
        const remoteStatus = res.payment?.status;

        // Map remote status to standardized local status
        if (remoteStatus === 'pago') {
          setStatus('confirmado');
          if (onSuccess) onSuccess();
        } else if (remoteStatus === 'processando') {
          setStatus('processando');
        } else if (remoteStatus === 'cancelado') {
          setStatus('cancelado');
        } else if (remoteStatus === 'erro') {
          setStatus('cancelado');
        } else if (remoteStatus === 'expirado') {
          setStatus('expirado');
        }
      } catch (e) {
        console.error('Error polling pix status:', e);
      }
    };

    if (paymentInitData && (status === 'aguardando' || status === 'processando')) {
      intervalId = setInterval(checkStatus, 4000); // Poll every 4 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [paymentInitData, status, onSuccess]);

  // Countdown timer logic
  useEffect(() => {
    let timerId: any;
    if (paymentInitData && status === 'aguardando' && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStatus('expirado');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [paymentInitData, status, timeLeft]);

  return {
    status,
    timeLeft,
  };
}
