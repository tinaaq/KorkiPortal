import api from './api';

export const getStudentTutors = () => {
  return api.get('/student/tutorslist');
};