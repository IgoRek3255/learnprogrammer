import { Router } from 'express';
import { getTopics, getTopic, createTopic, updateTopic, deleteTopic } from '../controllers/topicController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/course/:courseId', authenticate, getTopics);
router.get('/:id', authenticate, getTopic);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), createTopic);
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), updateTopic);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTopic);

export default router;
