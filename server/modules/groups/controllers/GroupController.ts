import { Request, Response } from 'express';
import { GroupUseCase } from '../useCases/GroupUseCase';
import { UserProfile } from '../../../../src/types';

export class GroupController {
  constructor(private groupUseCase: GroupUseCase) {}

  getAdminGroups = async (req: Request, res: Response) => {
    const groups = await this.groupUseCase.getAdminGroups();
    res.json({ groups });
  };

  getActiveGroups = async (req: Request, res: Response) => {
    const user = (req as any).user as UserProfile;
    const groups = await this.groupUseCase.getActiveGroups(user);
    res.json({ groups });
  };

  getInvitedGroups = async (req: Request, res: Response) => {
    const user = (req as any).user as UserProfile;
    const invitedGroups = await this.groupUseCase.getInvitedGroups(user);
    res.json({ invitedGroups });
  };

  getGroupDetails = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserProfile;
      const details = await this.groupUseCase.getGroupDetails(req.params.id, user);
      res.json(details);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  inviteClick = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserProfile;
      const result = await this.groupUseCase.processInviteClick(req.body.code, user);
      res.json({ success: true, ...result });
    } catch (err: any) {
      if (err.message.includes('não encontrado')) {
         return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  };

  deleteInvitedGroup = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserProfile;
      await this.groupUseCase.deleteInvitedGroup(req.body.id, user);
      res.json({ success: true, message: 'Convite removido com sucesso.' });
    } catch (err: any) {
      if (err.message === 'Registro não encontrado.') {
         return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  };

  activateInvitedGroup = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user as UserProfile;
      const result = await this.groupUseCase.activateInvitedGroup(req.body.id, user);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Registro não encontrado.' || err.message === 'Grupo ativo não encontrado.') {
         return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  };
}
