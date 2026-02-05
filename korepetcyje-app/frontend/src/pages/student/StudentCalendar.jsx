import { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import {
  getMyBookings,
  cancelBooking as cancelBookingApi,
  cancelManyBookings,
} from '../../services/bookingsService';

const STATUS_COLORS = {
  CONFIRMED: '#22c55e',
  PENDING: '#eab308',
  CANCELLED: '#9ca3af',
};

function formatSessionTitle(session) {
  const tutorName = session.tutor
    ? `${session.tutor.firstName} ${session.tutor.lastName}`
    : 'Korepetytor';

  const subjectName = session.subject?.name || 'Przedmiot';

  return `${tutorName} – ${subjectName}`;
}

export default function StudentCalendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('getMyBookings error:', err);
      setError(
        err.response?.data?.error || 'Nie udało się pobrać Twoich zajęć'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const sessions = useMemo(() => groupBookingsIntoSessions(bookings), [bookings]);

  const events = useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        start: session.startAt,
        end: session.endAt,
        title: formatSessionTitle(session),
        color: STATUS_COLORS[session.status] || '#3b82f6',
        extendedProps: { session },
      })),
    [sessions]
  );

  const handleEventClick = (info) => {
    setSelectedSession(info.event.extendedProps.session);
  };

  return (
  <div className="max-w-6xl mx-auto relative px-2">
    <h1 className="text-2xl font-semibold mb-2">Moje zajęcia</h1>

    <p className="mb-4 text-sm sm:text-base opacity-80">
      Kalendarz Twoich zarezerwowanych zajęć.
    </p>

    {error && (
      <div className="alert alert-error mb-3 text-sm">
        {error}
      </div>
    )}

    <div className="card bg-base-100 shadow-sm mb-4 w-full">
      <div className="card-body sm:card-body p-0 sm:p-4">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}

              initialView={window.innerWidth < 640 ? 'timeGridDay' : 'timeGridWeek'}
              headerToolbar={{
                left: window.innerWidth < 640 ? 'prev,next' : '',
                center: '',
                right: window.innerWidth < 640 ? 'today timeGridDay' : '',
              }}

                footerToolbar={{
                left: '',
                center: 'title',
                right: '',
              }}

              buttonText={{
                today: 'Dziś',
                week: 'Tydzień',
                day: 'Dzień',
              }}

              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              height="auto"
              locale="pl"
              firstDay={1}
              selectable={false}
              editable={false}
              events={events}
              eventClick={handleEventClick}
            />
            </div>
          </>
        )}
      </div>
    </div>

    <SessionDetailsModal
      session={selectedSession}
      onClose={() => setSelectedSession(null)}
      onCancelled={loadBookings}
    />
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
    subject: first.subject,
    tutorId: first.tutorId,
    subjectId: first.subjectId,
    mode: first.mode,
    status: first.status,
    startAt: first.startAt,
    endAt: last.endAt,
    address: first.address || null,
  };
}

function SessionDetailsModal({ session, onClose, onCancelled }) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  if (!session) return null;

  const start = new Date(session.startAt);
  const end = new Date(session.endAt);
  const now = new Date();

  const isPast = end.getTime() <= now.getTime();
  const isCancelled = session.status === 'CANCELLED';

  const tutorName = session.tutor
    ? `${session.tutor.firstName} ${session.tutor.lastName}`
    : 'Korepetytor';

  const subjectName = session.subject?.name || 'Przedmiot';

  const statusLabel = {
    CONFIRMED: 'Potwierdzone',
    PENDING: 'Oczekujące',
    CANCELLED: 'Anulowane',
  }[session.status] || session.status;

  const durationMinutes = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60)
  );

  const modeLabel =
    session.mode === 'ONLINE'
      ? 'Online'
      : session.mode === 'OFFLINE'
      ? 'Offline'
      : session.mode;

  const addressLabel =
    session.mode === 'ONLINE'
      ? 'Link do zajęć'
      : 'Adres zajęć';

  const isOnlineLink =
    session.mode === 'ONLINE' &&
    typeof session.address === 'string' &&
    (session.address.startsWith('http://') ||
      session.address.startsWith('https://'));

  const handleBackdropClick = () => {
    onClose?.();
  };

  const handleBoxClick = (e) => {
    e.stopPropagation();
  };

  const handleCancelClick = async () => {
    if (!session?.bookings?.length) return;

    if (isPast) return;

    const ok = window.confirm(
      'Na pewno chcesz anulować te zajęcia?'
    );
    if (!ok) return;

    setCancelError(null);
    setCancelLoading(true);

    try {
      const ids = session.bookings.map((b) => b.id);

      await cancelManyBookings(ids);

      if (onCancelled) {
        await onCancelled();
      }

      onClose?.();
    } catch (err) {
      console.error('Cancel booking error:', err);
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
          <DetailRow label="Korepetytor" value={tutorName} />
          <DetailRow label="Przedmiot" value={subjectName} />

          <DetailRow
            label="Data i godzina"
            value={`${start.toLocaleString()} – ${end.toLocaleTimeString()}`}
          />

          <DetailRow label="Czas trwania" value={`${durationMinutes} min`} />

          <DetailRow label="Tryb" value={modeLabel} />

          {session.address && (
            <div>
              <div className="text-xs uppercase opacity-60 mb-0.5">
                {addressLabel}
              </div>
              {isOnlineLink ? (
                <a
                  href={session.address}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary break-words"
                >
                  {session.address}
                </a>
              ) : (
                <div className="font-medium break-words">
                  {session.address}
                </div>
              )}
            </div>
          )}

          <DetailRow label="Status" value={statusLabel} />

          {/* <DetailRow
            label="Liczba slotów"
            value={`${session.bookings.length} × 30 min`}
          /> */}

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