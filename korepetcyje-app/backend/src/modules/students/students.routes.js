
import { Router } from 'express';
import { getStudentProfile, updateStudentProfile } from './students.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

// Pobierz profil ucznia
router.get('/me', authMiddleware, checkRole(['STUDENT']), getStudentProfile);

// Edytuj profil ucznia
router.put('/me', authMiddleware, checkRole(['STUDENT']), updateStudentProfile);

export default router;
