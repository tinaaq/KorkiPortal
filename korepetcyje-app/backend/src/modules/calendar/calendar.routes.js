import { Router } from 'express';
import {
  addAvailability,
  getMyAvailabilities,
  getTutorSlots,
} from './calendar.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';
import { deleteAvailability } from './calendar.controller.js';
import { getAvailabilityEvents } from './calendar.controller.js';


const router = Router();

// TUTOR — dodaje dostępność (dzień tygodnia + godziny)
router.post(
  '/availability',
  authMiddleware,
  checkRole(['TUTOR']),
  addAvailability
);


router.delete(
  '/availability/:id',
  authMiddleware,
  checkRole(['TUTOR']),
  deleteAvailability
);

router.get(
  '/availability/events',
  authMiddleware,
  checkRole(['TUTOR']),
  getAvailabilityEvents
);

// TUTOR — widzi swoje dostępności
router.get(
  '/availability',
  authMiddleware,
  checkRole(['TUTOR']),
  getMyAvailabilities
);

// STUDENT + PUBLIC — wolne sloty tutora
router.get('/tutor/:tutorId/slots', authMiddleware, getTutorSlots);

export default router;
