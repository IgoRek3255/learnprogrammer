import { Router } from 'express';
import { askAssistant, getHint, analyzeCode, getAiStatus } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/status', authenticate, getAiStatus);
router.post('/ask', authenticate, askAssistant);
router.get('/hints/:exerciseId', authenticate, getHint);
router.post('/analyze', authenticate, analyzeCode);

export default router;
