import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', validate({
  email: [{ required: true }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }],
  password: [{ required: true }, { minLength: 6 }],
  name: [{ required: true }, { minLength: 2 }],
}), register);

router.post('/login', validate({
  email: [{ required: true }],
  password: [{ required: true }],
}), login);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
