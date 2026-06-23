import { Router } from 'express';
import { getExercises, getExercise, createExercise, updateExercise, deleteExercise, submitSolution } from '../controllers/exerciseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/topic/:topicId', authenticate, getExercises);
router.get('/:id', authenticate, getExercise);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), createExercise);
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), updateExercise);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteExercise);
router.post('/:id/submit', authenticate, submitSolution);

export default router;
