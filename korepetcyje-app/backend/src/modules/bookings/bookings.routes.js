import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  cancelManyBookings,
} from './bookings.controller.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

// STUDENT — rezerwacja
router.post(
  '/',
  authMiddleware,
  checkRole(['STUDENT']),
  createBooking
);

// STUDENT / TUTOR — moje rezerwacje
router.get(
  '/me',
  authMiddleware,
  getMyBookings
);

// STUDENT / TUTOR — anulowanie
router.patch(
  '/:id/cancel',
  authMiddleware,
  cancelBooking
);

router.patch(
  '/cancel-many',
  authMiddleware,
  cancelManyBookings
);

export default router;
