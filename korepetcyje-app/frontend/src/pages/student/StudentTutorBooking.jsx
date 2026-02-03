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
      console.log('Wybrane sloty:', selectedSlots);
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
        'Zarezerwowano zajęcia'
        // `Zarezerwowano ${selectedSlots.length} slot(ów) po ${LESSON_MINUTES} min.`
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
  <div className="max-w-6xl mx-auto px-4 py-6">
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-[#02111B] mb-1">
        Rezerwacja zajęć – {tutor.firstName} {tutor.lastName}
      </h1>
      <p className="text-sm text-[#5D737E]">
        Wybierz dostępne zielone sloty w kalendarzu.
   
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
   
      <div className="lg:col-span-2">
        <div className="card bg-[#FCFCFC] shadow-sm border border-[#E5E5E5] rounded-lg">
          <div className="card-body p-4">

            {slotsError && (
              <div className="border border-[#E15B64] bg-[#E15B6420] text-[#E15B64] text-sm rounded-md px-3 py-2 mb-3">
                {slotsError}
              </div>
            )}

            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                              initialView={window.innerWidth < 640 ? 'timeGridDay' : 'timeGridWeek'}
              headerToolbar={{
                left: window.innerWidth < 640 ? 'prev,next today' : 'prev,next today',
                center: 'title',
                right: window.innerWidth < 640 ? 'timeGridDay' : 'timeGridWeek,timeGridDay',
              }}
              
              buttonText={{
                today: 'Dziś',
                week: 'Tydzień',
                day: 'Dzień',
              }}
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
                selectLongPressDelay={50}
                datesSet={(arg) => setCalendarRange({ start: arg.start, end: arg.end })}
                select={handleSelect}
                unselect={handleUnselect}
              />
            </div>

            {slotsLoading && (
              <div className="flex justify-center py-3">
                <span className="loading loading-spinner text-[#58B09C]" />
              </div>
            )}
          </div>
        </div>
      </div>

   
      <div>
        <div className="card bg-[#FCFCFC] shadow-sm border border-[#E5E5E5] rounded-lg">
          <div className="card-body p-4">
            <h2 className="text-lg font-semibold text-[#02111B] mb-3">
              Szczegóły rezerwacji
            </h2>

            {bookingError && (
              <div className="border border-[#E15B64] bg-[#E15B6420] text-[#E15B64] text-sm rounded-md px-3 py-2 mb-3">
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="border border-[#58B09C] bg-[#58B09C20] text-[#58B09C] text-sm rounded-md px-3 py-2 mb-3">
                {bookingSuccess}
              </div>
            )}

       
            <div className="mb-4">
              <div className="text-sm font-semibold text-[#02111B] mb-1">Wybrany zakres:</div>
              {selectionInfo ? (
                <div className="text-sm font-mono text-[#3F4045]">
                  {selectionInfo.start.toLocaleString()} – {selectionInfo.end.toLocaleString()} (
                  {selectedSlots.length * LESSON_MINUTES} min)
                </div>
              ) : (
                <div className="text-sm text-[#5D737E] opacity-70">
                  Zaznacz w kalendarzu zakres zajęć.
                </div>
              )}
            </div>

            <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">

       
              <div className="form-control">
                <label className="label pb-1">
                  <span className="text-sm text-[#02111B]">Przedmiot</span>
                </label>
                <select
                  className="select w-full border border-[#E5E5E5] bg-[#FCFCFC] text-[#02111B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
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

          
              <div className="form-control">
                <label className="label pb-1">
                  <span className="text-sm text-[#02111B]">Tryb zajęć</span>
                </label>

                <div className="join">
                  <button
                    type="button"
                    onClick={() => setMode('ONLINE')}
                    disabled={!availableModes.includes('ONLINE')}
                    className={`btn join-item rounded-md border border-[#E5E5E5] ${
                      mode === 'ONLINE'
                        ? 'bg-[#58B09C] text-white'
                        : 'bg-[#FCFCFC] text-[#02111B]'
                    } hover:bg-[#58B09C30] focus:ring-2 focus:ring-[#58B09C]`}
                  >
                    Online
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('OFFLINE')}
                    disabled={!availableModes.includes('OFFLINE')}
                    className={`btn join-item rounded-md border border-[#E5E5E5] ${
                      mode === 'OFFLINE'
                        ? 'bg-[#58B09C] text-white'
                        : 'bg-[#FCFCFC] text-[#02111B]'
                    } hover:bg-[#58B09C30] focus:ring-2 focus:ring-[#58B09C]`}
                  >
                    Offline
                  </button>
                </div>

                {!availableModes.length && (
                  <p className="text-xs text-[#E15B64] mt-1">
                    Korepetytor nie ma ustawionego trybu zajęć.
                  </p>
                )}
              </div>

      
              {mode === 'OFFLINE' && (
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="text-sm text-[#02111B]">Miejsce zajęć</span>
                  </label>

                  <div className="join">
                    <button
                      type="button"
                      onClick={() => setAddressOption('student')}
                      className={`btn join-item rounded-md border border-[#E5E5E5] ${
                        addressOption === 'student'
                          ? 'bg-[#58B09C] text-white'
                          : 'bg-[#FCFCFC] text-[#02111B]'
                      } hover:bg-[#58B09C30] focus:ring-2 focus:ring-[#58B09C]`}
                    >
                      U ucznia
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddressOption('tutor')}
                      className={`btn join-item rounded-md border border-[#E5E5E5] ${
                        addressOption === 'tutor'
                          ? 'bg-[#58B09C] text-white'
                          : 'bg-[#FCFCFC] text-[#02111B]'
                      } hover:bg-[#58B09C30] focus:ring-2 focus:ring-[#58B09C]`}
                    >
                      U korepetytora
                    </button>
                  </div>

                  <p className="text-xs text-[#5D737E] opacity-70 mt-1">
                    Adres zostanie pobrany z profilu ucznia / korepetytora.
                  </p>
                </div>
              )}

     
              <button
                type="submit"
                disabled={
                  bookingLoading ||
                  !selectionInfo ||
                  !subjectId ||
                  !mode ||
                  (mode === 'OFFLINE' && !addressOption)
                }
                className="btn w-full rounded-md bg-[#58B09C] text-white hover:bg-[#58B09C90] focus:ring-2 focus:ring-[#58B09C] disabled:opacity-50"
              >
                {bookingLoading ? 'Rezerwowanie...' : 'Zarezerwuj zajęcia'}
              </button>
            </form>
          </div>
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
