import api from './api';

export const getTutorStudents = () => {
  return api.get('/tutor/students');
};