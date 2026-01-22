import { Router } from 'express';
import {
  createNote,
  getNotesByStudent,
  updateNote,
  deleteNote,
} from './notes.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

// tylko TUTOR
router.post(
  '/',
  authMiddleware,
  checkRole(['TUTOR']),
  createNote
);

router.get(
  '/student/:studentId',
  authMiddleware,
  checkRole(['TUTOR']),
  getNotesByStudent
);

router.patch(
  '/:id',
  authMiddleware,
  checkRole(['TUTOR']),
  updateNote
);

router.delete(
  '/:id',
  authMiddleware,
  checkRole(['TUTOR']),
  deleteNote
);

export default router;
