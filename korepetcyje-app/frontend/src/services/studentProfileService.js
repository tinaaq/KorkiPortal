import api from './api';

// GET /api/students/me
export const getStudentProfile = () => {
  return api.get('/students/me');
};

// PUT /api/students/me
export const updateStudentProfile = (data) => {
  return api.put('/students/me', data);
};

// Student profil wymaga minimum:
export const isStudentProfileComplete = (profile) => {
  if (!profile) return false;

  return (
    !!profile.firstName &&
    !!profile.lastName //&&
    // !!profile.city &&
    // !!profile.grade
  );
};
