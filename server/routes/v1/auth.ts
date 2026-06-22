import express from 'express';
import { authenticate } from '../../middleware/auth';
import { container } from '../../shared/container';
import { AuthController } from '../../modules/users/controllers/AuthController';

const router = express.Router();
const authController = new AuthController(container.authUseCase);

router.post('/api/v1/auth/register', authController.register);
router.post('/api/v1/auth/login', authController.login);
router.post('/api/v1/auth/logout', authenticate, authController.logout);
router.get('/api/v1/auth/me', authenticate, authController.me);
router.get('/api/v1/auth/me_stats', authenticate, authController.meStats);
router.post('/api/v1/auth/update_profile', authenticate, authController.updateProfile);
router.post('/api/v1/auth/update_pix', authenticate, authController.updatePix);
router.post('/api/v1/auth/update_password', authenticate, authController.updatePassword);

export default router;
