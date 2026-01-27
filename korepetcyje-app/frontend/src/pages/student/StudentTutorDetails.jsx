
// src/pages/student/StudentTutorDetails.jsx
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
    <div className="max-w-4xl mx-auto">
      {/* Górny panel */}
      <div className="card bg-base-100 shadow-sm mb-4">
        <div className="card-body flex flex-col md:flex-row gap-4">
          {/* Avatar */}
          <div className="flex justify-center md:block">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {tutor.photoUrl ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img src={tutor.photoUrl} />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-base-200 text-2xl">
                    {tutor.firstName?.[0]}
                    {tutor.lastName?.[0]}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dane główne */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">
                {tutor.firstName} {tutor.lastName}
              </h1>
              {renderModeBadge(tutor.mode)}
            </div>

            <div className="flex flex-wrap gap-3 text-sm opacity-80 mb-3">
              {tutor.city && (
                <span>
                  📍 {tutor.city}
                </span>
              )}
              {tutor.meetingLink && (
                <a
                  href={tutor.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="link link-primary"
                >
                  🔗 Link do zajęć online
                </a>
              )}
            </div>

            {tutor.description && (
              <p className="text-sm opacity-90 whitespace-pre-line">
                {tutor.description}
              </p>
            )}

            <div className="mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBookClick}
              >
                Umów się na zajęcia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Przedmioty i ceny */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-2">Przedmioty i ceny</h2>

          {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((s) => (
                <div
                  key={s.subjectId}
                  className="badge badge-outline gap-1 px-3 py-2 text-sm"
                >
                  <span>{s.subject?.name || 'Przedmiot'}</span>
                  {s.priceInfo && (
                    <>
                      <span className="opacity-60">•</span>
                      <span>{s.priceInfo}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-70">
              Korepetytor nie dodał jeszcze informacji o przedmiotach.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
``
