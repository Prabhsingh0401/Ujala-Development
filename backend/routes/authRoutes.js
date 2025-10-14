import express from 'express';
import { login, createDefaultUsers, getFactoryUsers, requestPasswordReset, getPasswordResetRequests, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/create-default-users', createDefaultUsers);
router.get('/factory-users', getFactoryUsers);
router.post('/request-password-reset', requestPasswordReset);
router.get('/password-reset-requests', getPasswordResetRequests);
router.post('/reset-password', resetPassword);

export default router;