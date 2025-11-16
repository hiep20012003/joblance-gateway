import { Router } from 'express';
import { seedAllServices, deleteAllSeededData } from '../controllers/seed.controller';

const router = Router();

router.post('/all', seedAllServices);
router.delete('/all', deleteAllSeededData);

export default router;
