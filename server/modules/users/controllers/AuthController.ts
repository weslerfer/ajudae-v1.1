import { Request, Response } from 'express';
import { AuthUseCase } from '../useCases/AuthUseCase';

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.authUseCase.register(req.body);
      if (result) {
        res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(201).json(result);
      }
    } catch (err: any) {
      if (err.message === 'Sistema Supabase não configurado.') {
        return res.status(500).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authUseCase.login(req.body.email, req.body.senha);
      if (result) {
        res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.json(result);
      }
    } catch (err: any) {
      if (err.message.includes('Supabase não está configurado')) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ success: true });
  };

  me = async (req: Request, res: Response) => {
    const { sanitizeUser } = await import('../../../middleware/auth');
    res.json({ user: sanitizeUser((req as any).user) });
  };

  meStats = async (req: Request, res: Response) => {
    try {
       const stats = await this.authUseCase.getMeStats((req as any).user.id);
       res.json(stats);
    } catch (e: any) {
       res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const user = await this.authUseCase.updateProfile((req as any).user.id, req.body);
      const { sanitizeUser } = await import('../../../middleware/auth');
      res.json({ success: true, user: sanitizeUser(user) });
    } catch (err: any) {
      if (err.message === 'Usuário não encontrado.') {
         return res.status(404).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  };

  updatePix = async (req: Request, res: Response) => {
    try {
      const user = await this.authUseCase.updatePix((req as any).user.id, req.body.chave_pix, req.body.banco_pix);
      const { sanitizeUser } = await import('../../../middleware/auth');
      res.json({ success: true, user: sanitizeUser(user) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  updatePassword = async (req: Request, res: Response) => {
    try {
      await this.authUseCase.updatePassword((req as any).user, req.body.senha_atual, req.body.nova_senha);
      res.json({ success: true, message: 'Senha alterada com sucesso.' });
    } catch (err: any) {
      if (err.message === 'Supabase não configurado. Impossível alterar a senha.') {
         return res.status(500).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  };
}
