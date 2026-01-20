
import { Router } from 'express';
import { addAvailability, getAvailabilities } from './calendar.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

// Dodaj dostępność (tylko TUTOR)
router.post('/availability', authMiddleware, checkRole(['TUTOR']), addAvailability);

// Pobierz dostępności korepetytora (tylko TUTOR)
router.get('/availability', authMiddleware, checkRole(['TUTOR']), getAvailabilities);

export default router;
``
