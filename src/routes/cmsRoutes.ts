import { Router } from 'express';
import * as cmsController from '../controllers/cmsController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/dashboard', authenticate, cmsController.getDashboard);
router.get('/edit/:fileName', authenticate, cmsController.getEditFile);
router.post('/edit/:fileName', authenticate, cmsController.updateFile);

export default router;
