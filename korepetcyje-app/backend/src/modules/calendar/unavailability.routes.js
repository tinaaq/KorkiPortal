
import { Router } from 'express';
import {
  addUnavailability,
  getUnavailabilities,
  deleteUnavailability,
} from './unavailability.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  checkRole(['TUTOR']),
  addUnavailability
);

router.get(
  '/',
  authMiddleware,
  checkRole(['TUTOR']),
  getUnavailabilities
);

router.delete(
  '/:id',
  authMiddleware,
  checkRole(['TUTOR']),
  deleteUnavailability
);

export default router;
