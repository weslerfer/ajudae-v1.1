import express from 'express';
import { authenticate } from '../../middleware/auth';
import { container } from '../../shared/container';
import { GroupController } from '../../modules/groups/controllers/GroupController';

const router = express.Router();
const groupController = new GroupController(container.groupUseCase);

router.get('/api/v1/groups/admin_groups', authenticate, groupController.getAdminGroups);
router.get('/api/v1/groups/active_groups', authenticate, groupController.getActiveGroups);
router.get('/api/v1/groups/invited_groups', authenticate, groupController.getInvitedGroups);
router.get('/api/v1/groups/details/:id', authenticate, groupController.getGroupDetails);
router.post('/api/v1/groups/invite_click', authenticate, groupController.inviteClick);
router.post('/api/v1/groups/invited_groups/delete', authenticate, groupController.deleteInvitedGroup);
router.post('/api/v1/groups/invited_groups/activate', authenticate, groupController.activateInvitedGroup);

export default router;
