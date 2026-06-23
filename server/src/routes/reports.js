import { Router } from 'express';
import { getStudentReport, exportReport } from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/students/:userId', authenticate, authorize('ADMIN', 'TEACHER'), getStudentReport);
router.get('/export/:userId', authenticate, authorize('ADMIN', 'TEACHER'), exportReport);

export default router;
