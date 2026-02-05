import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../services/bookingsService';

const STATUS_COLORS = {
  CONFIRMED: 'badge-success',
  PENDING: 'badge-warning',
  CANCELLED: 'badge-ghost',
};

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('getMyBookings error:', err);
      setError(err.response?.data?.error || 'Nie udało się pobrać zajęć');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const todaysSessions = useMemo(() => {
    if (!Array.isArray(bookings) || bookings.length === 0) return [];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todays = bookings.filter((b) => {
      const start = new Date(b.startAt);
      return (
        start >= startOfDay &&
        start <= endOfDay &&
        b.status !== 'CANCELLED'
      );
    });

    const sessions = groupBookingsIntoSessions(todays);

    sessions.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

    return sessions;
  }, [bookings]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Centrum korepetytora</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
   
              {/* Moi uczniowie */}
        <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045]
                        bg-[#FCFCFC] dark:bg-[#1A232B]
                        shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                        transition-shadow">
          <div className="card-body p-5 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
              Moi uczniowie
            </h2>
            <p className="text-sm text-[#5D737E]">
              Lista uczniów, notatki oraz przypisane fiszki.
            </p>
            <div className="pt-2 mt-auto">
              <button
                onClick={() => navigate('/tutor/students')}
                className="btn h-10 w-full md:w-auto rounded-md px-4
                          bg-[#58B09C] hover:bg-[#4FA893]
                          text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              >
                Otwórz listę
              </button>
            </div>
          </div>
        </div>

        {/* Kalendarz */}
        <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045]
                        bg-[#FCFCFC] dark:bg-[#1A232B]
                        shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                        transition-shadow">
          <div className="card-body p-5 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
              Kalendarz
            </h2>
            <p className="text-sm text-[#5D737E]">
              Zarządzaj dostępnością i zaplanowanymi zajęciami.
            </p>
            <div className="pt-2 mt-auto">
              <button
                onClick={() => navigate('/tutor/calendar')}
                className="btn h-10 w-full md:w-auto rounded-md px-4
                          bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                          text-[#02111B] dark:text-[#F2F6FA]
                          hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                          focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              >
                Przejdź do kalendarza
              </button>
            </div>
          </div>
        </div>

        {/* Fiszki */}
        <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045]
                        bg-[#FCFCFC] dark:bg-[#1A232B]
                        shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                        transition-shadow">
          <div className="card-body p-5 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
              Fiszki
            </h2>
            <p className="text-sm text-[#5D737E]">
              Twórz zestawy fiszek i przypisuj je uczniom.
            </p>
            <div className="pt-2 mt-auto">
              <button
                onClick={() => navigate('/tutor/flashcards')}
                className="btn h-10 w-full md:w-auto rounded-md px-4
                          bg-[#5D737E] hover:bg-[#4C5E68]
                          text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              >
                Otwórz fiszki
              </button>
            </div>
          </div>
        </div>

    
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm h-full flex flex-col">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title text-lg">Dzisiejsze zajęcia</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs h-9 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C] "
                  onClick={loadBookings}
                >
                  Odśwież
                </button>
              </div>

              {error && (
                <div className="alert alert-error text-xs mb-2">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="space-y-2">
                  <SkeletonLessonRow />
                  <SkeletonLessonRow />
                </div>
              ) : todaysSessions.length === 0 ? (
                <p className="text-sm opacity-70">
                  Nie masz dzisiaj żadnych zajęć.
                </p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {todaysSessions.map((session) => (
                    <LessonRow key={session.id} session={session} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function groupBookingsIntoSessions(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) return [];

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.startAt) - new Date(b.startAt)
  );

  const sessions = [];
  let currentGroup = [];

  const areConsecutiveAndSameLesson = (prev, next) => {
    if (!prev || !next) return false;

    const prevEnd = new Date(prev.endAt).getTime();
    const nextStart = new Date(next.startAt).getTime();

    const isConsecutive = prevEnd === nextStart;

    const sameTutor = prev.tutorId === next.tutorId;
    const sameSubject = prev.subjectId === next.subjectId;
    const sameMode = prev.mode === next.mode;
    const sameStatus = prev.status === next.status;

    return isConsecutive && sameTutor && sameSubject && sameMode && sameStatus;
  };

  for (const b of sorted) {
    if (currentGroup.length === 0) {
      currentGroup.push(b);
      continue;
    }

    const last = currentGroup[currentGroup.length - 1];

    if (areConsecutiveAndSameLesson(last, b)) {
      currentGroup.push(b);
    } else {
      sessions.push(buildSessionFromGroup(currentGroup));
      currentGroup = [b];
    }
  }

  if (currentGroup.length > 0) {
    sessions.push(buildSessionFromGroup(currentGroup));
  }

  return sessions;
}

function buildSessionFromGroup(group) {
  const first = group[0];
  const last = group[group.length - 1];

  return {
    id: group.map((g) => g.id).join(','), 
    bookings: group,
    tutor: first.tutor,
    student: first.student,
    subject: first.subject,
    tutorId: first.tutorId,
    studentId: first.studentId,
    subjectId: first.subjectId,
    mode: first.mode,
    status: first.status,
    startAt: first.startAt,
    endAt: last.endAt,
    address: first.address || null,
  };
}


function LessonRow({ session }) {
  const start = new Date(session.startAt);
  const end = new Date(session.endAt);

  const timeRange = `${start.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })} – ${end.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const dateLabel = start.toLocaleDateString('pl-PL');

  const studentName = session.student
    ? `${session.student.firstName} ${session.student.lastName}`
    : 'Uczeń';

  const grade = session.student?.grade ? ` • kl. ${session.student.grade}` : '';

  const subjectName =
    session.subject?.name ||
    session.subject?.label ||
    session.subject ||
    'Przedmiot';

  const modeLabel =
    session.mode === 'ONLINE'
      ? 'Online'
      : session.mode === 'OFFLINE'
      ? 'Offline'
      : session.mode;

  const statusClass = STATUS_COLORS[session.status] || 'badge-neutral';

  return (
    <div className="border rounded-lg px-3 py-2 text-sm space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold truncate">{studentName}</div>
        <span className={`badge badge-xs ${statusClass}`}>
          {session.status === 'CONFIRMED'
            ? 'Potwierdzone'
            : session.status === 'PENDING'
            ? 'Oczekujące'
            : 'Anulowane'}
        </span>
      </div>

      <div className="text-xs opacity-80">
        {dateLabel} • {timeRange}
      </div>

      <div className="text-xs">
        <span className="font-medium">{subjectName}</span>
        <span className="opacity-80">{grade}</span>
      </div>

      <div className="text-xs opacity-80">
        Tryb: {modeLabel}
        {session.address && (
          <>
            {' '}
            •{' '}
            <span className="break-all">
              {session.address}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonLessonRow() {
  return (
    <div className="border rounded-lg px-3 py-2 space-y-2 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-base-300 rounded" />
        <div className="h-3 w-10 bg-base-300 rounded" />
      </div>
      <div className="h-3 w-32 bg-base-300 rounded" />
      <div className="h-3 w-40 bg-base-300 rounded" />
    </div>
  );
}