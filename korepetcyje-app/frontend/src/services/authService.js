
import api from './api';

export const loginRequest = (data) => {
  return api.post('/auth/login', data);
};

export const registerRequest = (data) => {
  return api.post('/auth/register', data);
};
