import { Router } from 'express';
import {
  createFlashcard,
  getMyFlashcards,
  updateFlashcard,
  deleteFlashcard,
  assignFlashcard,
  getStudentFlashcards,
  createSet,
  getMySets,
  assignSetToStudent,
} from './flashcards.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

/* ===== TUTOR ===== */

router.post(
  '/',
  authMiddleware,
  checkRole(['TUTOR']),
  createFlashcard
);

router.get(
  '/mine',
  authMiddleware,
  checkRole(['TUTOR']),
  getMyFlashcards
);

router.patch(
  '/:id',
  authMiddleware,
  checkRole(['TUTOR']),
  updateFlashcard
);

router.delete(
  '/:id',
  authMiddleware,
  checkRole(['TUTOR']),
  deleteFlashcard
);

router.post(
  '/:id/assign',
  authMiddleware,
  checkRole(['TUTOR']),
  assignFlashcard
);

/* ===== STUDENT ===== */

router.get(
  '/assigned',
  authMiddleware,
  checkRole(['STUDENT']),
  getStudentFlashcards
);
router.post(
  '/sets',
  authMiddleware,
  checkRole(['TUTOR']),
  createSet
);

router.get(
  '/sets/mine',
  authMiddleware,
  checkRole(['TUTOR']),
  getMySets
);

router.post(
  '/sets/:id/assign',
  authMiddleware,
  checkRole(['TUTOR']),
  assignSetToStudent
);

export default router;
