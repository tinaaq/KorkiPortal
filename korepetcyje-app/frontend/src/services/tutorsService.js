
// src/services/tutorsService.js
import api from './api';

// params: { name?, subject?, city?, mode?, sortBy?, order?, page?, limit? }
export const searchTutors = (params = {}) => {
  return api.get('/tutors/search', { params });
};


// Szczegóły korepetytora po ID (TutorProfile.id)
// GET /api/tutors/:id
export const getTutorById = (id) => {
  return api.get(`/tutors/${id}`);
};

