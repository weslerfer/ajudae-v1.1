import { Request, Response } from 'express';
import { sanitizeUser } from '../../../middleware/auth';
import { AdminUseCase } from '../useCases/AdminUseCase';

export class AdminController {
  constructor(private adminUseCase: AdminUseCase) {}

  configWebhook = async (req: Request, res: Response) => {
    try {
      await this.adminUseCase.configWebhook(req.body.webhookUrl);
      res.json({ success: true, message: 'Webhook configurado na Efí com sucesso!' });
    } catch (err: any) {
      if (err.message === 'webhookUrl é obrigatório') {
         return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  };

  getStats = async (req: Request, res: Response) => {
    const stats = await this.adminUseCase.getStats();
    res.json(stats);
  };

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.adminUseCase.getUsers();
      res.json({ users });
    } catch (error: any) {
      console.error('[Admin Users Endpoint Error]', error);
      res.status(500).json({ error: 'Erro ao listar usuários administradores: ' + (error.message || String(error)) });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const user = await this.adminUseCase.updateUser(req.body);
      res.json({ success: true, user: sanitizeUser(user) });
    } catch (err: any) {
      if (err.message === 'ID do usuário é requirido.') {
         return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  };

  updateInviteLimit = async (req: Request, res: Response) => {
    try {
      const invite = await this.adminUseCase.updateInviteLimit(req.body.invite_code, req.body.max_uses);
      res.json({ success: true, invite });
    } catch (err: any) {
      if (err.message === 'Link de convite não encontrado.') {
         return res.status(404).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  };

  getWithdrawals = async (req: Request, res: Response) => {
    const withdrawals = await this.adminUseCase.getWithdrawals();
    res.json({ withdrawals });
  };

  actionWithdrawal = async (req: Request, res: Response) => {
    try {
      const result = await this.adminUseCase.actionWithdrawal(req.params.id, req.body.action, req.body.motivo);
      res.json({ success: true, ...result });
    } catch (err: any) {
      if (err.message === 'Solicitação de saque não encontrada.') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  };

  createGroup = async (req: Request, res: Response) => {
    try {
      const group = await this.adminUseCase.createGroup(req.body);
      res.status(201).json({ success: true, group });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  editGroup = async (req: Request, res: Response) => {
    try {
      await this.adminUseCase.editGroup(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      if (err.message === 'Grupo não encontrado.') {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  };

  deleteGroup = async (req: Request, res: Response) => {
    await this.adminUseCase.deleteGroup(req.params.id);
    res.json({ success: true });
  };

  getWallets = async (req: Request, res: Response) => {
    const result = await this.adminUseCase.getWallets();
    res.json(result);
  };

  adjustWallet = async (req: Request, res: Response) => {
    try {
      await this.adminUseCase.adjustWallet(req.body.user_id, Number(req.body.amount), req.body.description);
      res.json({ success: true, message: 'Saldo ajustado com sucesso.' });
    } catch (err: any) {
      if (err.message === 'Usuário não encontrado.') {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  };

  getMessages = async (req: Request, res: Response) => {
    const messages = await this.adminUseCase.getMessages();
    res.json({ messages });
  };

  createMessage = async (req: Request, res: Response) => {
    try {
       const message = await this.adminUseCase.createMessage(req.body.titulo, req.body.mensagem, req.body.tipo);
       res.json({ message });
    } catch (err: any) {
       res.status(400).json({ error: err.message });
    }
  };

  updateMessage = async (req: Request, res: Response) => {
    try {
       const message = await this.adminUseCase.updateMessage(req.params.id, req.body.titulo, req.body.mensagem);
       res.json({ message });
    } catch (err: any) {
       res.status(400).json({ error: err.message });
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    await this.adminUseCase.deleteMessage(req.params.id);
    res.json({ success: true });
  };
}
