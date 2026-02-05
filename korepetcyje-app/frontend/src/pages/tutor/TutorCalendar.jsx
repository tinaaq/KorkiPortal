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
import { cancelManyBookings } from '../../services/bookingsService';

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

const BOOKING_STATUS_COLORS = {
  CONFIRMED: '#22c55e', // zielone
  CANCELLED: '#9ca3af', // szare
  PENDING: '#eab308',   // żółte
};

// Grupowanie bookingów w ciągłe bloki per uczeń + przedmiot + tryb + adres
function buildGroupedBookingEvents(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) return [];

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
        subject: b.subject,
        mode: b.mode,
        address: b.address,
        startAt: start,
        endAt: end,
        count: 1,
        allIds: [b.id],
        statuses: [b.status],
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
      currentGroup.endAt = end;
      currentGroup.count += 1;
      currentGroup.allIds.push(b.id);
      currentGroup.statuses.push(b.status);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        tutorId: b.tutorId,
        studentId: b.studentId,
        student: b.student,
        subjectId: b.subjectId,
        subject: b.subject,
        mode: b.mode,
        address: b.address,
        startAt: start,
        endAt: end,
        count: 1,
        allIds: [b.id],
        statuses: [b.status],
      };
    }
  }

  if (currentGroup) groups.push(currentGroup);

 
  return groups.map((g, index) => {
    const allCancelled = g.statuses.every((s) => s === 'CANCELLED');
    const anyConfirmed = g.statuses.some((s) => s === 'CONFIRMED');

    let groupStatus = 'PENDING';
    if (allCancelled) groupStatus = 'CANCELLED';
    else if (anyConfirmed) groupStatus = 'CONFIRMED';

    const studentName =
      g.student?.user
        ? `${g.student.firstName} ${g.student.lastName}`
        : `${g.student?.firstName ?? 'Uczeń'} ${g.student?.lastName ?? ''}`.trim();

    const session = {
      student: g.student,
      studentName,
      subjectId: g.subjectId,
      subjectName: g.subject?.name || 'Przedmiot',
      mode: g.mode,
      address: g.address,
      startAt: g.startAt.toISOString(),
      endAt: g.endAt.toISOString(),
      count: g.count,
      bookingIds: g.allIds,
      status: groupStatus,
    };

    return {
      id: `booking-group-${index}`,
      title: `${studentName} (${g.count * 30} min)`,
      start: g.startAt.toISOString(),
      end: g.endAt.toISOString(),
      color: BOOKING_STATUS_COLORS[groupStatus] || '#60a5fa',
      textColor: '#1e3a8a',
      extendedProps: {
        session,
      },
    };
  });
}

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

  // Wybrana sesja (do modala)
  const [selectedSession, setSelectedSession] = useState(null);

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
      color: '#f87171',
      textColor: '#7f1d1d',
    }));

    const bookingEvents = buildGroupedBookingEvents(bookings);

    setCalendarEvents([
      ...availabilityEvents,
      ...unavailEvents,
      ...bookingEvents,
    ]);
  }, [availabilityEvents, unavailabilities, bookings]);


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
        'Dodano nieobecność.'
        // `Dodano nieobecność. Anulowano zajęcia: ${res.data.cancelledBookings}`
      );

      setUnavailStart('');
      setUnavailEnd('');
      setUnavailReason('');

      await loadUnavailabilities();
      await loadBookings(); // po anulowaniu zajęć odśwież rezerwacje
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
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
        Kalendarz i dostępności
      </h1>
      <p className="text-sm text-[#5D737E]">
        Zarządzaj swoimi cyklicznymi dostępnościami, nieobecnościami i zajęciami.
      </p>
    </div>


    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    
      <div className="lg:col-span-2 card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="card-body p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
              Twoje cykliczne dostępności i zajęcia
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadBookings}
                className="btn h-9 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              >
                Odśwież zajęcia
              </button>
            </div>
          </div>

     
          {availError && (
            <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-2 text-sm text-[#E15B64]">
              {availError}
            </div>
          )}
          {bookingsError && (
            <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-2 text-sm text-[#E15B64]">
              {bookingsError}
            </div>
          )}

    
          <div className="-mx-5 sm:mx-0 rounded-none sm:rounded-lg border-t border-b sm:border border-[#E5E5E5] dark:border-[#3F4045] overflow-hidden">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}

              initialView={window.innerWidth < 640 ? 'timeGridDay' : 'timeGridWeek'}
              headerToolbar={{
                left: window.innerWidth < 640 ? 'prev,next ' : 'prev,next today',
                center: 'title',
                right: window.innerWidth < 640 ? 'today' : 'timeGridWeek,timeGridDay',
              }}

              buttonText={{
                today: 'Dziś',
                week: 'Tydzień',
                day: 'Dzień',
              }}
              locale="pl"
              firstDay={1}
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              height="auto"
              expandRows={true}
  contentHeight="auto"
  handleWindowResize={true}
  stickyHeaderDates={false}
  // dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }} // np. "pon, 29"
  // slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}

              editable={false}
              selectable={false}
              events={calendarEvents}
              eventClick={(info) => {
                const session = info.event.extendedProps.session;
                if (session) setSelectedSession(session);
              }}
            />
          </div>
        </div>
      </div>

   
      <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="card-body p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Dodaj dostępność</h2>

          <form onSubmit={handleAddAvailability} className="flex flex-col gap-3">
    
            <div className="form-control">
              <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">Dzień tygodnia</label>
              <select
                className="select w-full h-11 mt-1 px-2 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
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

       
            <div className="flex flex-col gap-2">
          
                  <div className="form-control flex-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">Od</label>
                    <div className="mt-1 flex gap-2">
                  
                      <select
                        className="select w-24 h-11 px-2 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                        value={newStartTime.split(':')[0] || '16'}
                        onChange={(e) => {
                          const hh = e.target.value.padStart(2,'0');
                          const mm = (newStartTime.split(':')[1] || '00').padStart(2,'0');
                          setNewStartTime(`${hh}:${mm}`);
                        }}
                      >
                        {Array.from({ length: 24 }, (_, h) => String(h).padStart(2,'0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>

                   
                      <select
                        className="select w-24 h-11 px-2 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                        value={(newStartTime.split(':')[1] || '00').padStart(2,'0')}
                        onChange={(e) => {
                          const hh = (newStartTime.split(':')[0] || '16').padStart(2,'0');
                          const mm = e.target.value.padStart(2,'0');
                          setNewStartTime(`${hh}:${mm}`);
                        }}
                      >
                        {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

               
                  <div className="form-control flex-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">Do</label>
                    <div className="mt-1 flex gap-2">
                      <select
                        className="select w-24 h-11 px-2 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                        value={newEndTime.split(':')[0] || '18'}
                        onChange={(e) => {
                          const hh = e.target.value.padStart(2,'0');
                          const mm = (newEndTime.split(':')[1] || '00').padStart(2,'0');
                          setNewEndTime(`${hh}:${mm}`);
                        }}
                      >
                        {Array.from({ length: 24 }, (_, h) => String(h).padStart(2,'0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>

                      <select
                        className="select w-24 h-11 px-2 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                        value={(newEndTime.split(':')[1] || '00').padStart(2,'0')}
                        onChange={(e) => {
                          const hh = (newEndTime.split(':')[0] || '18').padStart(2,'0');
                          const mm = e.target.value.padStart(2,'0');
                          setNewEndTime(`${hh}:${mm}`);
                        }}
                      >
                        {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={addingAvailability}
                className="btn h-10 rounded-md px-4 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
              >
                {addingAvailability ? 'Dodawanie...' : 'Dodaj dostępność'}
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-semibold text-[#02111B] dark:text-[#F2F6FA] mb-2">Twoje dostępności</h3>

            {availLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner" />
              </div>
            ) : availabilities.length === 0 ? (
              <p className="text-xs text-[#5D737E]">Nie dodałeś jeszcze żadnych dostępności.</p>
            ) : (
              <ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
                {availabilities.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span className="text-[#02111B] dark:text-[#F2F6FA]">
                      {dayLabel(a.dayOfWeek)}:{' '}
                      <span className="font-mono">{a.startTime} – {a.endTime}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAvailability(a.id)}
                      className="btn btn-xs h-8 rounded-md px-3 bg-transparent border border-[#E15B64] text-[#E15B64] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#E15B64]"
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
    </div>

  
    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Nieobecności</h2>

        {unavailError && (
          <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-2 text-sm text-[#E15B64]">
            {unavailError}
          </div>
        )}
        {unavailInfo && (
          <div className="rounded-md border border-[#58B09C] bg-[#F2F2F2] dark:bg-[#161D24] p-2 text-sm text-[#58B09C]">
            {unavailInfo}
          </div>
        )}

       
        <form onSubmit={handleAddUnavailability} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="form-control">
            <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">Od</label>
            <input
              type="datetime-local"
              step={900} 
              value={unavailStart}
              onChange={(e) => setUnavailStart(e.target.value)}
              required
              className="input w-full h-11 mt-1 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>
          <div className="form-control">
            <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">Do</label>
            <input
              type="datetime-local"
                step={900} 
              value={unavailEnd}
              onChange={(e) => setUnavailEnd(e.target.value)}
              required
              className="input w-full h-11 mt-1 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>
          <div className="form-control">
            <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">Powód (opcjonalnie)</label>
            <input
              type="text"
              value={unavailReason}
              onChange={(e) => setUnavailReason(e.target.value)}
              placeholder="np. urlop, choroba"
              className="input w-full h-11 mt-1 px-2 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>

     
          <div className="md:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              disabled={addingUnavailability}
              className="btn h-10 rounded-md px-4 bg-[#5D737E] hover:bg-[#4C5E68] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
            >
              {addingUnavailability ? 'Dodawanie...' : 'Dodaj nieobecność i anuluj zajęcia'}
            </button>
          </div>
        </form>

   
        <div>
          <h3 className="text-sm font-semibold text-[#02111B] dark:text-[#F2F6FA] mb-2">Twoje nieobecności</h3>

          {unavailLoading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner" />
            </div>
          ) : unavailabilities.length === 0 ? (
            <p className="text-xs text-[#5D737E]">Brak zdefiniowanych nieobecności.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {unavailabilities.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2">
                  <div className="text-[#02111B] dark:text-[#F2F6FA]">
                    <span className="font-mono">
                      {new Date(u.startAt).toLocaleString()} – {new Date(u.endAt).toLocaleString()}
                    </span>
                    {u.reason && <span className="ml-2 text-[#5D737E]">({u.reason})</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnavailability(u.id)}
                    className="btn btn-xs h-8 rounded-md px-3 bg-transparent border border-[#E15B64] text-[#E15B64] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#E15B64]"
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


    <TutorSessionDetailsModal
      session={selectedSession}
      onClose={() => setSelectedSession(null)}
      onCancelled={loadBookings}
    />
  </div>
);
}

function TutorSessionDetailsModal({ session, onClose, onCancelled }) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  if (!session) return null;

  const start = new Date(session.startAt);
  const end = new Date(session.endAt);
  const now = new Date();

  const isPast = end.getTime() <= now.getTime();
  const isCancelled = session.status === 'CANCELLED';

  const statusLabel = {
    CONFIRMED: 'Potwierdzone',
    PENDING: 'Oczekujące',
    CANCELLED: 'Anulowane',
  }[session.status] || session.status;

  const handleBackdropClick = () => {
    onClose?.();
  };

  const handleBoxClick = (e) => {
    e.stopPropagation();
  };

  const handleCancelClick = async () => {
    if (!session.bookingIds?.length || isPast || isCancelled) return;

    const ok = window.confirm(
      'Na pewno chcesz anulować te zajęcia?'
    );
    if (!ok) return;

    setCancelError(null);
    setCancelLoading(true);

    try {
      await cancelManyBookings(session.bookingIds);

      if (onCancelled) {
        await onCancelled();
      }

      onClose?.();
    } catch (err) {
      console.error('cancelManyBookings error:', err);
      setCancelError(
        err.response?.data?.error || 'Nie udało się anulować zajęć'
      );
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="modal modal-open" onClick={handleBackdropClick}>
      <div
        className="modal-box max-w-md w-full"
        onClick={handleBoxClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Szczegóły zajęć</h3>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <DetailRow
            label="Uczeń"
            value={session.studentName || 'Uczeń'}
          />

          <DetailRow
            label="Przedmiot"
            value={session.subjectName || 'Przedmiot'}
          />

          <DetailRow
            label="Data i godzina"
            value={`${start.toLocaleString()} – ${end.toLocaleTimeString()}`}
          />

          <DetailRow
            label="Czas trwania"
            value={`${session.count * 30} min`}
          />

          <DetailRow
            label="Tryb"
            value={
              session.mode === 'ONLINE'
                ? 'Online'
                : session.mode === 'OFFLINE'
                ? 'Offline'
                : session.mode
            }
          />

          {session.address && (
            <DetailRow
              label={
                session.mode === 'ONLINE'
                  ? 'Link do zajęć'
                  : 'Adres zajęć'
              }
              value={session.address}
            />
          )}

          <DetailRow
            label="Status"
            value={statusLabel}
          />

          {cancelError && (
            <div className="alert alert-error mt-2 text-xs">
              {cancelError}
            </div>
          )}

          {isCancelled && (
            <p className="text-xs text-success mt-1">
              Te zajęcia zostały anulowane.
            </p>
          )}

          {isPast && !isCancelled && (
            <p className="text-xs text-error mt-1">
              Nie można anulować zajęć, które już się zakończyły.
            </p>
          )}
        </div>

        <div className="modal-action flex justify-between items-center">
          {/* <button type="button" className="btn" onClick={onClose}>
            Zamknij
          </button> */}

          {!isCancelled && !isPast && (
            <button
              type="button"
              className="btn btn-error px-3"
              onClick={handleCancelClick}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Anulowanie...' : 'Anuluj te zajęcia'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase opacity-60 mb-0.5">{label}</div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}