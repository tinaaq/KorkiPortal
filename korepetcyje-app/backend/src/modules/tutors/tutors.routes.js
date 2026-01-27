
import { Router } from 'express';
import { getTutorProfile, updateTutorProfile, searchTutors, getTutorPublicProfile } from './tutors.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

// Pobierz profil korepetytora
router.get('/me', authMiddleware, checkRole(['TUTOR']), getTutorProfile);

// Edytuj profil korepetytora
router.put('/me', authMiddleware, checkRole(['TUTOR']), updateTutorProfile);

// Wyszukiwanie korepetytorów (publiczne)
router.get('/search', searchTutors);

// Publiczny profil korepetytora po ID
router.get('/:id', getTutorPublicProfile);


export default router;
