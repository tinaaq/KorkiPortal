import api from './api';

const flashcardsService = {

  getMySets: async () => {
    const res = await api.get('/flashcards/sets/mine');
    return res.data; // [ { id, name, createdAt, flashcards: [...] }, ... ]
  },

  createSet: async (name) => {
    const res = await api.post('/flashcards/sets', { name });
    return res.data; // { id, name, tutorId, createdAt }
  },

  getSetStudents: async (setId) => {
    const res = await api.get(`/flashcards/sets/${setId}/students`);
    return res.data; // [ { assignmentId, studentId, firstName, lastName, ... }, ... ]
  },

  assignSetToStudent: async (setId, studentId) => {
    const res = await api.post(`/flashcards/sets/${setId}/assign`, {
      studentId,
    });
    return res.data; // assignment
  },

  unassignSetFromStudent: async (setId, studentId) => {
    const res = await api.delete(
      `/flashcards/sets/${setId}/assign/${studentId}`
    );
    return res.data; // { success: true }
  },

  createFlashcard: async (setId, front, back) => {
    const res = await api.post('/flashcards', {
      setId,
      front,
      back,
    });
    return res.data; // { id, setId, front, back, ... }
  },

  getMyFlashcards: async () => {
    const res = await api.get('/flashcards/mine');
    return res.data; // [ { id, setId, front, back, ... }, ... ]
  },

  updateFlashcard: async (id, front, back) => {
    const res = await api.patch(`/flashcards/${id}`, {
      front,
      back,
    });
    return res.data;
  },

  deleteFlashcard: async (id) => {
    const res = await api.delete(`/flashcards/${id}`);
    return res.data;
  },

  getStudentFlashcardSets: async () => {
    const res = await api.get('/flashcards/assigned');
    return res.data; // [ { id, name, createdAt, flashcards: [...] }, ... ]
  },

  
  deleteSet: async (setId) => {
    const res = await api.delete(`/flashcards/sets/${setId}`);
    return res.data; // { success: true }
  },


  updateSet: async (setId, name) => {
    const res = await api.patch(`/flashcards/sets/${setId}`, { name });
    return res.data; // zaktualizowany set
  },


};



export default flashcardsService;