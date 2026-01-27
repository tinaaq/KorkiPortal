
// src/services/tutorSubjectsService.js
import api from './api';

// WAŻNE: tu musi być '/tutors/subjects', bo w app.js jest:
// app.use('/api/tutors/subjects', tutorSubjectsRoutes);

// GET /api/tutors/subjects
export const getTutorSubjects = () => {
  return api.get('/tutors/subjects');
};

// POST /api/tutors/subjects
// body: { subjectName, priceInfo }
export const addTutorSubject = (data) => {
  return api.post('/tutors/subjects', data);
};

// PUT /api/tutors/subjects/:subjectId
// body: { priceInfo }
export const updateTutorSubject = (subjectId, data) => {
  return api.put(`/tutors/subjects/${subjectId}`, data);
};

// DELETE /api/tutors/subjects/:subjectId
export const deleteTutorSubject = (subjectId) => {
  return api.delete(`/tutors/subjects/${subjectId}`);
};
