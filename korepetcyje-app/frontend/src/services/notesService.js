import api from './api';

// GET /api/notes/student/:studentId
export const getNotesByStudent = (studentId) => {
  return api.get(`/notes/student/${studentId}`);
};

// POST /api/notes
export const createNote = (data) => {
  return api.post('/notes', data);
};

// PATCH /api/notes/:id
export const updateNote = (id, data) => {
  return api.patch(`/notes/${id}`, data);
};

// DELETE /api/notes/:id
export const deleteNote = (id) => {
  return api.delete(`/notes/${id}`);
};