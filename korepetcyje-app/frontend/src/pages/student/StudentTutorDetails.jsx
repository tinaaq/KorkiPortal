import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTutorById } from '../../services/tutorsService';

const renderModeBadge = (mode) => {
  if (mode === 'ONLINE') return <span className="badge badge-info">Online</span>;
  if (mode === 'OFFLINE') return <span className="badge badge-warning">Offline</span>;
  if (mode === 'BOTH') return <span className="badge badge-success">Online + Offline</span>;
  return null;
};

export default function StudentTutorDetails() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  
  const handleBookClick = () => {
    navigate(`/student/tutors/${id}/book`);
  };

  useEffect(() => {
    const fetchTutor = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getTutorById(id);
        setTutor(res.data);
      } catch (err) {
        setError(
          err.response?.data?.error || 'Nie udało się pobrać profilu korepetytora'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-sm opacity-70">
          Nie znaleziono korepetytora.
        </p>
      </div>
    );
  }

return (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
   
    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 flex flex-col md:flex-row gap-5">
     
        <div className="flex justify-center md:block">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring ring-[#58B09C] ring-offset-2 ring-offset-[#FCFCFC] dark:ring-offset-[#1A232B] overflow-hidden bg-[#F2F2F2] dark:bg-[#161D24] text-[#02111B] dark:text-[#F2F6FA] flex items-center justify-center text-2xl font-semibold">
              {tutor.photoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                // <img src={tutor.photoUrl} />
                <img src={(tutor.photoUrl ? `${API_URL}${tutor.photoUrl}` : '')} />
              ) : (
                <>
                  {tutor.firstName?.[0] || 'K'}
                  {tutor.lastName?.[0] || 'R'}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-[#02111B] dark:text-[#F2F6FA] truncate">
              {tutor.firstName} {tutor.lastName}
            </h1>

            {tutor.mode && (
              <span
                className={[
                  "badge rounded-md px-2 py-1 text-[11px] border",
                  tutor.mode === 'ONLINE'
                    ? "border-[#5D737E] text-[#5D737E] bg-transparent"
                    : tutor.mode === 'OFFLINE'
                    ? "border-[#F4C95D] text-[#02111B] bg-[#F4C95D]/20"
                    : "border-[#58B09C] text-[#58B09C] bg-transparent"
                ].join(" ")}
              >
                {tutor.mode === 'ONLINE' && 'Online'}
                {tutor.mode === 'OFFLINE' && 'Offline'}
                {tutor.mode === 'BOTH' && 'Online + Offline'}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-x-3 gap-y-2 text-sm text-[#5D737E] mb-3">
            {tutor.city && (
              <span className="truncate font-semibold"> {tutor.city}</span>
            )}

            {tutor.meetingLink && (
              <a
                href={tutor.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#5D737E] hover:text-[#02111B] dark:hover:text-[#F2F6FA] underline-offset-2 hover:underline"
              >
                 Link do zajęć online
              </a>
            )}
          </div>

          {tutor.description && (
            <p className="text-sm text-[#02111B] dark:text-[#F2F6FA] opacity-90 whitespace-pre-line">
              {tutor.description}
            </p>
          )}


          <div className="mt-4">
            <button
              type="button"
              onClick={handleBookClick}
              className="btn h-11 rounded-md px-5 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            >
              Umów się na zajęcia
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA] mb-3">
          Przedmioty i ceny
        </h2>

        {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((s) => (
              <div
                key={s.subjectId}
                className="badge rounded-md px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#3F4045] bg-transparent text-[#02111B] dark:text-[#F2F6FA] gap-2"
              >
                <span>{s.subject?.name || 'Przedmiot'}</span>
                {s.priceInfo && (
                  <>
                    <span className="text-[#5D737E]">•</span>
                    <span className="text-[#02111B] dark:text-[#F2F6FA]">{s.priceInfo}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#5D737E]">
            Korepetytor nie dodał jeszcze informacji o przedmiotach.
          </p>
        )}
      </div>
    </div>
  </div>
);
}
``
