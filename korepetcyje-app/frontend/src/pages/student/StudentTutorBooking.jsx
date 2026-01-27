
// src/pages/student/StudentTutorBooking.jsx
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { getTutorById } from '../../services/tutorsService';
import { getTutorSlots } from '../../services/calendarService';
import { createBooking } from '../../services/bookingsService';

const LESSON_MINUTES = 30;

export default function StudentTutorBooking() {
  const { id } = useParams(); // tutorId (TutorProfile.id)

  const [tutor, setTutor] = useState(null);
  const [tutorLoading, setTutorLoading] = useState(true);
  const [tutorError, setTutorError] = useState(null);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  const [calendarRange, setCalendarRange] = useState(null);

  // Wybrane sloty (lista startAt ISO)
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectionInfo, setSelectionInfo] = useState(null); // { start, end }

  // Formularz rezerwacji
  const [subjectId, setSubjectId] = useState('');
  const [mode, setMode] = useState('');
  const [addressOption, setAddressOption] = useState('student'); // 'student' | 'tutor'
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // 1. Pobierz dane korepetytora
  useEffect(() => {
    const fetchTutor = async () => {
      setTutorLoading(true);
      setTutorError(null);

      try {
        const res = await getTutorById(id);
        setTutor(res.data);

        // domyślny tryb (jeśli dostępny)
        const availableModes = getAvailableModes(res.data.mode);
        if (availableModes.length === 1) {
          setMode(availableModes[0]);
        }
      } catch (err) {
        setTutorError(
          err.response?.data?.error || 'Nie udało się pobrać profilu korepetytora'
        );
      } finally {
        setTutorLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  // 2. Pobierz wolne sloty dla zakresu widoku
  const loadSlots = async (range) => {
    if (!range) return;
    setSlotsLoading(true);
    setSlotsError(null);

    try {
      const from = range.start.toISOString();
      const to = range.end.toISOString();
      const res = await getTutorSlots(Number(id), from, to);
      setSlots(res.data || []);
    } catch (err) {
      setSlotsError(
        err.response?.data?.error || 'Nie udało się pobrać wolnych terminów'
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (calendarRange) {
      loadSlots(calendarRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarRange, id]);

  // 3. Eventy do FullCalendar na podstawie slots
  const slotEvents = useMemo(
    () =>
      slots.map((s, idx) => ({
        id: `slot-${idx}`,
        start: s.start,
        end: s.end,
        display: 'background',
        color: '#bbf7d0', // zielone tło
      })),
    [slots]
  );

  // Pomocniczo: set dostępnych startów slotów
  const slotStartSet = useMemo(
    () => new Set(slots.map((s) => s.start)),
    [slots]
  );

  // 4. Obsługa zaznaczenia zakresu w kalendarzu
  const handleSelect = (info) => {
    setBookingError(null);
    setBookingSuccess(null);

    const start = info.start;
    const end = info.end;

    // podziel zaznaczenie na 30-min sloty
    const segments = [];
    const cursor = new Date(start);

    while (cursor < end) {
      const segStart = new Date(cursor);
      const segEnd = new Date(cursor);
      segEnd.setMinutes(segEnd.getMinutes() + LESSON_MINUTES);

      segments.push({ start: segStart, end: segEnd });

      cursor.setMinutes(cursor.getMinutes() + LESSON_MINUTES);
    }

    const segmentStartsIso = segments.map((seg) => seg.start.toISOString());

    // sprawdź, czy KAŻDY segment startuje w jednym z wolnych slotów
    const allValid = segmentStartsIso.every((iso) => slotStartSet.has(iso));

    if (!allValid) {
      setSelectedSlots([]);
      setSelectionInfo(null);
      setBookingError(
        'Wybrany zakres nie jest w pełni dostępny. Zaznacz tylko zielone pola.'
      );
      info.view.calendar.unselect();
      return;
    }

    setSelectedSlots(segmentStartsIso);
    setSelectionInfo({
      start,
      end,
    });
  };

  const handleUnselect = () => {
    setSelectedSlots([]);
    setSelectionInfo(null);
    setBookingError(null);
    setBookingSuccess(null);
  };

  // 5. Tworzenie rezerwacji
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    if (!subjectId) {
      setBookingError('Wybierz przedmiot');
      return;
    }
    if (!mode) {
      setBookingError('Wybierz tryb zajęć');
      return;
    }
    if (mode === 'OFFLINE' && !addressOption) {
      setBookingError('Wybierz miejsce zajęć (u kogo)');
      return;
    }
    if (selectedSlots.length === 0) {
      setBookingError('Zaznacz w kalendarzu zakres zajęć');
      return;
    }

    setBookingLoading(true);

    try {
      for (const startAt of selectedSlots) {
        await createBooking({
          tutorId: Number(id),
          startAt,
          subjectId: Number(subjectId),
          mode,
          addressOption: mode === 'OFFLINE' ? addressOption : undefined,
        });
      }

      setBookingSuccess(
        `Zarezerwowano ${selectedSlots.length} slot(ów) po ${LESSON_MINUTES} min.`
      );
      setSelectedSlots([]);
      setSelectionInfo(null);

      // odśwież sloty
      if (calendarRange) {
        await loadSlots(calendarRange);
      }
    } catch (err) {
      setBookingError(
        err.response?.data?.error ||
          'Nie udało się utworzyć rezerwacji (slot mógł zostać zajęty).'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Dostępne tryby na podstawie tutor.mode
  const availableModes = useMemo(
    () => getAvailableModes(tutor?.mode),
    [tutor]
  );

  if (tutorLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (tutorError || !tutor) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="alert alert-error text-sm">
          {tutorError || 'Nie znaleziono korepetytora'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">
        Rezerwacja zajęć – {tutor.firstName} {tutor.lastName}
      </h1>
      <p className="mb-4 text-sm opacity-80">
        Zaznacz w kalendarzu zielone sloty, aby zarezerwować zajęcia.
        Jednostka zajęć to {LESSON_MINUTES} minut.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KALENDARZ */}
        <div className="lg:col-span-2 card bg-base-100 shadow-sm">
          <div className="card-body">
            {slotsError && (
              <div className="alert alert-error mb-2 text-sm">
                {slotsError}
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                selectable
                selectMirror
                editable={false}
                events={slotEvents}
                height="auto"
                locale="pl"
                firstDay={1}
                unselectAuto={false}
                datesSet={(arg) => {
                  setCalendarRange({ start: arg.start, end: arg.end });
                }}
                select={handleSelect}
                unselect={handleUnselect}
              />
            </div>

            {slotsLoading && (
              <div className="flex justify-center py-2">
                <span className="loading loading-spinner" />
              </div>
            )}
          </div>
        </div>

        {/* FORMULARZ REZERWACJI */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2">Szczegóły rezerwacji</h2>

            {bookingError && (
              <div className="alert alert-error mb-2 text-sm">
                {bookingError}
              </div>
            )}
            {bookingSuccess && (
              <div className="alert alert-success mb-2 text-sm">
                {bookingSuccess}
              </div>
            )}

            {/* Wybrany zakres */}
            <div className="mb-3 text-sm">
              <div className="font-semibold mb-1">Wybrany zakres:</div>
              {selectionInfo ? (
                <div className="font-mono">
                  {selectionInfo.start.toLocaleString()} –{' '}
                  {selectionInfo.end.toLocaleString()} (
                  {selectedSlots.length * LESSON_MINUTES} min)
                </div>
              ) : (
                <span className="opacity-70">
                  Zaznacz w kalendarzu zakres zajęć.
                </span>
              )}
            </div>

            <form onSubmit={handleCreateBooking} className="flex flex-col gap-3">
              {/* Przedmiot */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Przedmiot</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  <option value="">Wybierz przedmiot</option>
                  {Array.isArray(tutor.subjects) &&
                    tutor.subjects.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.subject?.name || 'Przedmiot'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Tryb zajęć */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tryb zajęć</span>
                </label>
                <div className="join">
                  <button
                    type="button"
                    className={`btn join-item ${
                      mode === 'ONLINE' ? 'btn-primary' : 'btn-outline'
                    }`}
                    disabled={!availableModes.includes('ONLINE')}
                    onClick={() => setMode('ONLINE')}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    className={`btn join-item ${
                      mode === 'OFFLINE' ? 'btn-primary' : 'btn-outline'
                    }`}
                    disabled={!availableModes.includes('OFFLINE')}
                    onClick={() => setMode('OFFLINE')}
                  >
                    Offline
                  </button>
                </div>
                {!availableModes.length && (
                  <p className="text-xs text-error mt-1">
                    Korepetytor nie ma ustawionego trybu zajęć.
                  </p>
                )}
              </div>

              {/* Miejsce zajęć (dla OFFLINE) */}
              {mode === 'OFFLINE' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Miejsce zajęć</span>
                  </label>
                  <div className="join">
                    <button
                      type="button"
                      className={`btn join-item ${
                        addressOption === 'student'
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                      onClick={() => setAddressOption('student')}
                    >
                      U ucznia
                    </button>
                    <button
                      type="button"
                      className={`btn join-item ${
                        addressOption === 'tutor'
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                      onClick={() => setAddressOption('tutor')}
                    >
                      U korepetytora
                    </button>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    Adres zostanie pobrany z profilu ucznia / korepetytora.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={
                  bookingLoading ||
                  !selectionInfo ||
                  !subjectId ||
                  !mode ||
                  (mode === 'OFFLINE' && !addressOption)
                }
              >
                {bookingLoading ? 'Rezerwowanie...' : 'Zarezerwuj zajęcia'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wyliczenie dostępnych trybów na podstawie tutor.mode
function getAvailableModes(tutorMode) {
  if (!tutorMode) return [];
  const m = tutorMode.toUpperCase();
  const res = [];
  if (m === 'ONLINE' || m === 'BOTH') res.push('ONLINE');
  if (m === 'OFFLINE' || m === 'BOTH') res.push('OFFLINE');
  return res;
}
