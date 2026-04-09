import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.get('/login', (req, res) => res.render('login', { error: null }));
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Registration routes
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// OTP Verification routes
router.get('/verify-otp', authController.getVerifyOTP);
router.post('/verify-otp', authController.postVerifyOTP);

export default router;

