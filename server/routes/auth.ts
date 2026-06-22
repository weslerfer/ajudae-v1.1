import express from 'express';
import { authenticate } from '../middleware/auth';
import { container } from '../shared/container';
import { AuthController } from '../modules/users/controllers/AuthController';

const router = express.Router();
const authController = new AuthController(container.authUseCase);

router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/logout', authenticate, authController.logout);
router.get('/api/auth/me', authenticate, authController.me);
router.get('/api/auth/me_stats', authenticate, authController.meStats);
router.post('/api/auth/update_profile', authenticate, authController.updateProfile);
router.post('/api/auth/update_pix', authenticate, authController.updatePix);
router.post('/api/auth/update_password', authenticate, authController.updatePassword);

export default router;
