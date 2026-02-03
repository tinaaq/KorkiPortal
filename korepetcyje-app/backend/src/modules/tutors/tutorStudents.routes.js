import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';
import { getTutorStudents } from './tutorStudents.controller.js';

const router = Router();

router.get(
  '/students',
  authMiddleware,
  checkRole(['TUTOR']),
  getTutorStudents
);

export default router;