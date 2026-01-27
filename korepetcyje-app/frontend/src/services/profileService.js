
// src/services/profileService.js
import api from './api';

export const getTutorProfile = () => {
  return api.get('/tutors/me');
};

export const updateTutorProfile = (data) => {
  return api.put('/tutors/me', data);
};

export const getStudentProfile = () => {
  return api.get('/students/me');
};

export const updateStudentProfile = (data) => {
  return api.put('/students/me', data);
};

// TUTOR: wymagany tryb + co najmniej 1 przedmiot
export const isTutorProfileComplete = (profile) => {
  if (!profile) return false;

  const hasMode = !!profile.mode;
  const hasSubjects =
    Array.isArray(profile.subjects) && profile.subjects.length > 0;

  return hasMode && hasSubjects;
};

export const isStudentProfileComplete = (profile) => {
  if (!profile) return false;

  const hasCity = !!profile.city;
  const hasGrade = !!profile.grade;

  return hasCity && hasGrade;
};
