import { Router } from 'express';
import { getUserProgress, getCourseAnalytics, getDashboardStats } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN', 'TEACHER'), getDashboardStats);
router.get('/progress', authenticate, getUserProgress);
router.get('/progress/:userId', authenticate, getUserProgress);
router.get('/course/:courseId', authenticate, authorize('ADMIN', 'TEACHER'), getCourseAnalytics);

export default router;
