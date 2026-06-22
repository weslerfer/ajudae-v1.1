import { WalletRepository } from '../repositories/WalletRepository';
import { UserProfile } from '../../../../src/types';

export class WalletUseCase {
  constructor(private walletRepository: WalletRepository) {}

  async getInfo(userId: string) {
    const wallet = await this.walletRepository.getOrCreateWallet(userId);
    const transactions = await this.walletRepository.getUserTransactions(userId);
    return { wallet, transactions };
  }

  async withdraw(user: UserProfile, valor: number) {
    if (isNaN(valor) || valor < 25.0) {
      throw new Error('O valor mínimo para solicitação de saque é R$ 25,00.');
    }
    if (!user.chave_pix) {
      throw new Error('Você precisa configurar sua Chave Pix nas Configurações antes de realizar saques.');
    }

    await this.walletRepository.getOrCreateWallet(user.id);
    const result = await this.walletRepository.processWithdrawalRequest(user, valor);
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao processar saque');
    }
    return result;
  }
}
