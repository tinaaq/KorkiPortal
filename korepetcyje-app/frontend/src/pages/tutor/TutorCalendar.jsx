
// src/pages/tutor/TutorCalendar.jsx
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import {
  getMyAvailabilities,
  addAvailability,
  deleteAvailability,
  getAvailabilityEvents,
  addUnavailability,
  getUnavailabilities,
  deleteUnavailability,
  getTutorBookings,
} from '../../services/calendarService';

const DAY_OPTIONS = [
  { value: 1, label: 'Poniedziałek' },
  { value: 2, label: 'Wtorek' },
  { value: 3, label: 'Środa' },
  { value: 4, label: 'Czwartek' },
  { value: 5, label: 'Piątek' },
  { value: 6, label: 'Sobota' },
  { value: 0, label: 'Niedziela' },
];

const dayLabel = (dayOfWeek) =>
  DAY_OPTIONS.find((d) => d.value === dayOfWeek)?.label || `Dzień ${dayOfWeek}`;

export default function TutorCalendar() {

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);


  // Dostępności
  const [availabilities, setAvailabilities] = useState([]);
  const [availabilityEvents, setAvailabilityEvents] = useState([]);
  const [availLoading, setAvailLoading] = useState(true);
  const [availError, setAvailError] = useState(null);

  const [calendarEvents, setCalendarEvents] = useState([]);

  // Formularz nowej dostępności
  const [newDayOfWeek, setNewDayOfWeek] = useState(1);
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [addingAvailability, setAddingAvailability] = useState(false);

  // Nieobecności
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [unavailLoading, setUnavailLoading] = useState(true);
  const [unavailError, setUnavailError] = useState(null);

  // Formularz nieobecności
  const [unavailStart, setUnavailStart] = useState('');
  const [unavailEnd, setUnavailEnd] = useState('');
  const [unavailReason, setUnavailReason] = useState('');
  const [addingUnavailability, setAddingUnavailability] = useState(false);
  const [unavailInfo, setUnavailInfo] = useState(null);

  

// Grupowanie bookingów w ciągłe bloki per uczeń + przedmiot + tryb + adres
function buildGroupedBookingEvents(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) return [];

  // sort: tutorId, studentId, subjectId, startAt
  const sorted = [...bookings].sort((a, b) => {
    if (a.tutorId !== b.tutorId) return a.tutorId - b.tutorId;
    if (a.studentId !== b.studentId) return a.studentId - b.studentId;
    if (a.subjectId !== b.subjectId) return a.subjectId - b.subjectId;
    return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
  });

  const groups = [];
  let currentGroup = null;

  for (const b of sorted) {
    const start = new Date(b.startAt);
    const end = new Date(b.endAt);

    if (!currentGroup) {
      currentGroup = {
        tutorId: b.tutorId,
        studentId: b.studentId,
        student: b.student,
        subjectId: b.subjectId,
        mode: b.mode,
        address: b.address,
        startAt: start,
        endAt: end,
        count: 1,
      };
      continue;
    }

    const lastEnd = currentGroup.endAt;

    const sameTutor = currentGroup.tutorId === b.tutorId;
    const sameStudent = currentGroup.studentId === b.studentId;
    const sameSubject = currentGroup.subjectId === b.subjectId;
    const sameMode = currentGroup.mode === b.mode;
    const sameAddress = currentGroup.address === b.address;
    const continuous = lastEnd.getTime() === start.getTime();

    if (
      sameTutor &&
      sameStudent &&
      sameSubject &&
      sameMode &&
      sameAddress &&
      continuous
    ) {
      // przedłuż istniejący blok
      currentGroup.endAt = end;
      currentGroup.count += 1;
    } else {
      // zamknij poprzedni blok
      groups.push(currentGroup);
      // zacznij nowy
      currentGroup = {
        tutorId: b.tutorId,
        studentId: b.studentId,
        student: b.student,
        subjectId: b.subjectId,
        mode: b.mode,
        address: b.address,
        startAt: start,
        endAt: end,
        count: 1,
      };
    }
  }

  if (currentGroup) groups.push(currentGroup);

  // Zamień grupy na eventy FullCalendar + tooltip
  return groups.map((g, index) => {
    const studentName = 
g.student?.user
    ? `${g.student.firstName} ${g.student.lastName}`
    : `${g.student?.firstName ?? 'Uczeń'} ${g.student?.lastName ?? ''}`.trim();

    const modeLabel =
      g.mode === 'ONLINE' ? 'Online' : g.mode === 'OFFLINE' ? 'Offline' : g.mode;

    const timeRange = `${g.startAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} – ${g.endAt.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const tooltipLines = [
      `Uczeń: ${studentName}`,
      `Przedmiot ID: ${g.subjectId}`,
      `Tryb: ${modeLabel}`,
      g.address ? `Adres / link: ${g.address}` : null,
      `Godzina: ${timeRange}`,
      g.count > 1 ? `Sloty: ${g.count} x 30 min` : null,
    ].filter(Boolean);

    return {
      id: `booking-group-${index}`,
      title: `${studentName} (${g.count * 30} min)`,
      start: g.startAt.toISOString(),
      end: g.endAt.toISOString(),
      color: '#60a5fa',
      textColor: '#1e3a8a',
      extendedProps: {
        tooltip: tooltipLines.join('\n'),
      },
    };
  });
}





  // === LOAD DATA ===
  const loadAvailabilities = async () => {
    setAvailLoading(true);
    setAvailError(null);
    try {
      const [availRes, eventsRes] = await Promise.all([
        getMyAvailabilities(),
        getAvailabilityEvents(),
      ]);
      setAvailabilities(availRes.data || []);
      setAvailabilityEvents(eventsRes.data || []);
    } catch (err) {
      setAvailError(
        err.response?.data?.error || 'Nie udało się pobrać dostępności'
      );
    } finally {
      setAvailLoading(false);
    }
  };

  const loadUnavailabilities = async () => {
    setUnavailLoading(true);
    setUnavailError(null);
    try {
      const res = await getUnavailabilities();
      setUnavailabilities(res.data || []);
    } catch (err) {
      setUnavailError(
        err.response?.data?.error || 'Nie udało się pobrać nieobecności'
      );
    } finally {
      setUnavailLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);

    try {
      const res = await getTutorBookings();
      setBookings(res.data || []);
    } catch (err) {
      setBookingsError(
        err.response?.data?.error || 'Nie udało się pobrać zajęć'
      );
    } finally {
      setBookingsLoading(false);
    }
  };


  useEffect(() => {
    loadAvailabilities();
    loadUnavailabilities();
    loadBookings();
  }, []);


  useEffect(() => {
    // eventy z nieobecności
    const unavailEvents = unavailabilities.map((u) => ({
      id: `unavail-${u.id}`,
      start: u.startAt,
      end: u.endAt,
      title: `Nieobecność${u.reason ? ' – ' + u.reason : ''}`,
      color: '#f87171',      // czerwone tło
      textColor: '#7f1d1d',  // ciemniejszy tekst
    }));

      const bookingEvents = buildGroupedBookingEvents(bookings);


    // availabilityEvents już są w formacie dla FullCalendar
    setCalendarEvents([
      ...availabilityEvents,
      ...unavailEvents,
      ...bookingEvents, 
    ]);
  }, [availabilityEvents, unavailabilities, bookings]);


  // === HANDLERY DOSTĘPNOŚCI ===
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setAvailError(null);
    setAddingAvailability(true);

    if (!newStartTime || !newEndTime) {
      setAvailError('Podaj godziny rozpoczęcia i zakończenia');
      setAddingAvailability(false);
      return;
    }

    try {
      await addAvailability({
        dayOfWeek: Number(newDayOfWeek),
        startTime: newStartTime,
        endTime: newEndTime,
      });

      await loadAvailabilities();
    } catch (err) {
      setAvailError(
        err.response?.data?.error || 'Nie udało się dodać dostępności'
      );
    } finally {
      setAddingAvailability(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    const ok = window.confirm('Na pewno chcesz usunąć tę dostępność?');
    if (!ok) return;

    setAvailError(null);

    try {
      await deleteAvailability(id);
      await loadAvailabilities();
    } catch (err) {
      setAvailError(
        err.response?.data?.error || 'Nie udało się usunąć dostępności'
      );
    }
  };

  // === HANDLERY NIEOBECNOŚCI ===
  const handleAddUnavailability = async (e) => {
    e.preventDefault();
    setUnavailError(null);
    setUnavailInfo(null);
    setAddingUnavailability(true);

    if (!unavailStart || !unavailEnd) {
      setUnavailError('Podaj datę początkową i końcową');
      setAddingUnavailability(false);
      return;
    }

    try {
      const res = await addUnavailability({
        startAt: unavailStart,
        endAt: unavailEnd,
        reason: unavailReason || undefined,
      });

      setUnavailInfo(
        `Dodano nieobecność. Anulowano zajęcia: ${res.data.cancelledBookings}`
      );

      setUnavailStart('');
      setUnavailEnd('');
      setUnavailReason('');

      await loadUnavailabilities();
    } catch (err) {
      setUnavailError(
        err.response?.data?.error || 'Nie udało się dodać nieobecności'
      );
    } finally {
      setAddingUnavailability(false);
    }
  };

  const handleDeleteUnavailability = async (id) => {
    const ok = window.confirm('Na pewno chcesz usunąć tę nieobecność?');
    if (!ok) return;

    setUnavailError(null);

    try {
      await deleteUnavailability(id);
      await loadUnavailabilities();
    } catch (err) {
      setUnavailError(
        err.response?.data?.error || 'Nie udało się usunąć nieobecności'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Kalendarz i dostępności
      </h1>

      {/* GÓRNY GRID: KALENDARZ + DOSTĘPNOŚCI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* KALENDARZ */}
        <div className="lg:col-span-2 card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2">Twoje cykliczne dostępności</h2>

            {availError && (
              <div className="alert alert-error mb-2 text-sm">
                {availError}
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                editable={false}
                selectable={false}
                events={calendarEvents}
                height="auto" 
                locale="pl"
                firstDay={1}               
                eventDidMount={(info) => {
                    // tooltip tylko dla rezerwacji (booking-*), ale możesz usunąć ten warunek,
                    // jeśli chcesz mieć tooltipy też na nieobecnościach
                    if (info.event.id.startsWith('booking-group-')) {
                      const tooltip = info.event.extendedProps.tooltip;
                      if (tooltip) {
                        info.el.setAttribute('title', tooltip);
                      }
                    }
                  }}

              />
            </div>
          </div>
        </div>

        {/* FORMULARZ DOSTĘPNOŚCI + LISTA */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2">Dodaj dostępność</h2>

            <form
              onSubmit={handleAddAvailability}
              className="flex flex-col gap-3 mb-4"
            >
              {/* Dzień tygodnia */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Dzień tygodnia</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newDayOfWeek}
                  onChange={(e) => setNewDayOfWeek(Number(e.target.value))}
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Godziny */}
              <div className="flex gap-2">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Od</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Do</span>
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={addingAvailability}
              >
                {addingAvailability ? 'Dodawanie...' : 'Dodaj dostępność'}
              </button>
            </form>

            <h3 className="font-semibold mb-1 text-sm">
              Twoje dostępności
            </h3>

            {availLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner" />
              </div>
            ) : availabilities.length === 0 ? (
              <p className="text-xs opacity-70">
                Nie dodałeś jeszcze żadnych dostępności.
              </p>
            ) : (
              <ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
                {availabilities.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      {dayLabel(a.dayOfWeek)}:{' '}
                      <span className="font-mono">
                        {a.startTime} – {a.endTime}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline btn-error"
                      onClick={() => handleDeleteAvailability(a.id)}
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* NIEOBECNOŚCI */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-2">Nieobecności</h2>

          {unavailError && (
            <div className="alert alert-error mb-2 text-sm">
              {unavailError}
            </div>
          )}

          {unavailInfo && (
            <div className="alert alert-info mb-2 text-sm">
              {unavailInfo}
            </div>
          )}

          {/* Formularz nieobecności */}
          <form
            onSubmit={handleAddUnavailability}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Od</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={unavailStart}
                onChange={(e) => setUnavailStart(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Do</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={unavailEnd}
                onChange={(e) => setUnavailEnd(e.target.value)}
                required
              />
            </div>

            <div className="form-control md:col-span-1">
              <label className="label">
                <span className="label-text">Powód (opcjonalnie)</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={unavailReason}
                onChange={(e) => setUnavailReason(e.target.value)}
                placeholder="np. urlop, choroba"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={addingUnavailability}
              >
                {addingUnavailability
                  ? 'Dodawanie...'
                  : 'Dodaj nieobecność i anuluj zajęcia'}
              </button>
            </div>
          </form>

          {/* Lista nieobecności */}
          <h3 className="font-semibold mb-1 text-sm">
            Twoje nieobecności
          </h3>

          {unavailLoading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner" />
            </div>
          ) : unavailabilities.length === 0 ? (
            <p className="text-xs opacity-70">
              Brak zdefiniowanych nieobecności.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {unavailabilities.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-mono">
                      {new Date(u.startAt).toLocaleString()} –{' '}
                      {new Date(u.endAt).toLocaleString()}
                    </span>
                    {u.reason && (
                      <span className="ml-2 opacity-70">
                        ({u.reason})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => handleDeleteUnavailability(u.id)}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
``
