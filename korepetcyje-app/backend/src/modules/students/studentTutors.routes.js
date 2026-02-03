import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';
import { getStudentTutors } from './studentTutors.controller.js';

const router = Router();

router.get(
  '/tutorslist',
  authMiddleware,
  checkRole(['STUDENT']),
  getStudentTutors
);

export default router;