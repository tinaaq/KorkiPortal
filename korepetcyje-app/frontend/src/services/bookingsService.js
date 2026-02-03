
import api from './api';

// STUDENT — tworzenie rezerwacji
// body: { tutorId, startAt, subjectId, mode, addressOption? }
export const createBooking = (data) => {
  return api.post('/bookings', data);
};

// STUDENT / TUTOR — moje rezerwacje
export const getMyBookings = () => {
  return api.get('/bookings/me');
};

// STUDENT / TUTOR — anulowanie
export const cancelBooking = (id) => {
  return api.patch(`/bookings/${id}/cancel`);
};

export const cancelManyBookings = (ids) => {
  return api.patch('/bookings/cancel-many', { ids });
};