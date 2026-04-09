import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.get('/login', (req, res) => res.render('login', { error: null }));
router.post('/login', authController.login);
router.get('/logout', authController.logout);

export default router;
