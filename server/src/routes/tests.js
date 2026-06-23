import { Router } from 'express';
import {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  startAttempt,
  submitAnswer,
  completeAttempt,
  getMyAttempts,
  getAttemptsForTest,
} from '../controllers/testController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getTests);
router.get('/attempts', authenticate, getMyAttempts);
router.get('/:id', authenticate, getTest);
router.get('/:id/attempts', authenticate, authorize('ADMIN', 'TEACHER'), getAttemptsForTest);

router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), createTest);
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), updateTest);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTest);

router.post('/:id/questions', authenticate, authorize('ADMIN', 'TEACHER'), addQuestion);
router.put('/:id/questions/:questionId', authenticate, authorize('ADMIN', 'TEACHER'), updateQuestion);
router.delete('/:id/questions/:questionId', authenticate, authorize('ADMIN', 'TEACHER'), deleteQuestion);

router.post('/:id/start', authenticate, startAttempt);
router.post('/attempts/:attemptId/answer', authenticate, submitAnswer);
router.post('/attempts/:attemptId/complete', authenticate, completeAttempt);

export default router;