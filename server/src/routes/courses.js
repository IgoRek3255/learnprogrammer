import { Router } from 'express';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourse);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), createCourse);
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), updateCourse);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCourse);

export default router;
