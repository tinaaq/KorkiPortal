
import { Router } from 'express';
import {
  getTutorSubjects,
  addTutorSubject,
  updateTutorSubject,
  deleteTutorSubject
} from './tutorSubjects.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, checkRole(['TUTOR']), getTutorSubjects);
router.post('/', authMiddleware, checkRole(['TUTOR']), addTutorSubject);
router.put('/:subjectId', authMiddleware, checkRole(['TUTOR']), updateTutorSubject);
router.delete('/:subjectId', authMiddleware, checkRole(['TUTOR']), deleteTutorSubject);

export default router;
