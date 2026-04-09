import { Router } from 'express';
import * as apiController from '../controllers/apiController';

const router = Router();

router.get('/projects/:id', apiController.getProjectById);
router.get('/all', apiController.getAllData);
router.get('/:fileName', apiController.getDataFile);

export default router;
