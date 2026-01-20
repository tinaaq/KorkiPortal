
import { Router } from 'express';
import { registerUser, loginUser } from './auth.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Test: tylko TUTOR może wejść
router.get('/tutor-only', authMiddleware, checkRole(['TUTOR']), (req, res) => {
  res.json({ message: 'Witaj korepetytorze!' });
});

export default router;
