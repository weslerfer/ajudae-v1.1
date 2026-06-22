import express from 'express';
import { authenticate } from '../middleware/auth';
import { container } from '../shared/container';
import { GroupController } from '../modules/groups/controllers/GroupController';

const router = express.Router();
const groupController = new GroupController(container.groupUseCase);

router.get('/api/groups/admin_groups', authenticate, groupController.getAdminGroups);
router.get('/api/groups/active_groups', authenticate, groupController.getActiveGroups);
router.get('/api/groups/invited_groups', authenticate, groupController.getInvitedGroups);
router.get('/api/groups/details/:id', authenticate, groupController.getGroupDetails);
router.post('/api/groups/invite_click', authenticate, groupController.inviteClick);
router.post('/api/groups/invited_groups/delete', authenticate, groupController.deleteInvitedGroup);
router.post('/api/groups/invited_groups/activate', authenticate, groupController.activateInvitedGroup);

export default router;
