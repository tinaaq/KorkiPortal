
// src/services/calendarService.js
import api from './api';

// ====== DOSTĘPNOŚCI TUTORA ======

// GET /api/calendar/availability
export const getMyAvailabilities = () => {
  return api.get('/calendar/availability');
};

// POST /api/calendar/availability
// body: { dayOfWeek, startTime, endTime }
export const addAvailability = (data) => {
  return api.post('/calendar/availability', data);
};

// DELETE /api/calendar/availability/:id
export const deleteAvailability = (id) => {
  return api.delete(`/calendar/availability/${id}`);
};

// GET /api/calendar/availability/events
// zwraca events dla FullCalendar (daysOfWeek, startTime, endTime, display: 'background')
export const getAvailabilityEvents = () => {
  return api.get('/calendar/availability/events');
};

// ====== NIEOBECNOŚCI TUTORA ======

// POST /api/calendar/unavailability
// body: { startAt, endAt, reason? }
export const addUnavailability = (data) => {
  return api.post('/calendar/unavailability', data);
};

// GET /api/calendar/unavailability
export const getUnavailabilities = () => {
  return api.get('/calendar/unavailability');
};

// DELETE /api/calendar/unavailability/:id
export const deleteUnavailability = (id) => {
  return api.delete(`/calendar/unavailability/${id}`);
};


// TUTOR — pobranie swoich lekcji do kalendarza
export const getTutorBookings = () => {
  return api.get('/bookings/me'); // backend sam sprawdzi rolę
};

// ====== SLOTY TUTORA (dla STUDENTA – na później) ======

// GET /api/calendar/tutor/:tutorId/slots?from=...&to=...
export const getTutorSlots = (tutorId, from, to) => {
  return api.get(`/calendar/tutor/${tutorId}/slots`, {
    params: { from, to },
  });
};



