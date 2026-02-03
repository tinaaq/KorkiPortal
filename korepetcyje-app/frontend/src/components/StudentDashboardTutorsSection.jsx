import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentTutors } from '../services/studentTutorsService';

export default function StudentDashboardTutorsSection() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getStudentTutors();
        setTutors(res.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            'Nie udało się pobrać listy Twoich korepetytorów'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTutors();
  }, []);

  const handleRemoveFromView = (id) => {
    setTutors((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTutors = useMemo(() => {
    if (!search.trim()) return tutors;

    const q = search.toLowerCase();
    return tutors.filter((t) => {
      const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (t.firstName || '').toLowerCase().includes(q) ||
        (t.lastName || '').toLowerCase().includes(q)
      );
    });
  }, [tutors, search]);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <h2 className="card-title text-lg">Twoi korepetytorzy</h2>
          </div>
          <div className="flex items-center gap-2 py-4">
            <span className="loading loading-spinner loading-sm" />
            <span className="text-sm opacity-70">Ładowanie…</span>
          </div>
        </div>
      </div>
    );
  }

return (
  <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
    {/* Sticky header z wyszukiwarką */}
    <div className="sticky top-[72px] sm:top-[76px] z-10 bg-[#FCFCFC] dark:bg-[#1A232B] border-b border-[#E5E5E5] dark:border-[#3F4045] px-5 sm:px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
          Twoi korepetytorzy
        </h2>

        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Wyszukaj"
              className="input w-full h-10 pl-9 rounded-md bg-[#FCFCFC] dark:bg-[#161D24]
                         border border-[#E5E5E5] dark:border-[#3F4045]
                         text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E]
                         focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            />
            {/* ikona lupy */}
            <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[#5D737E]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Treść listy */}
    <div className="p-5 sm:p-6">
      {error && (
        <div className="mb-4 rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64]">
          {error}
        </div>
      )}

      {!error && filteredTutors.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#E5E5E5] dark:border-[#3F4045] p-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-[#F2F2F2] dark:bg-[#161D24] flex items-center justify-center text-[#5D737E]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-8 9a8 8 0 0 1 16 0"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-[#5D737E]">
            Brak korepetytorów na liście. Zacznij od wyszukania i umówienia zajęć.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate('/student/tutors')}
              className="btn h-10 rounded-md px-4 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            >
              Otwórz wyszukiwarkę
            </button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-[#E5E5E5] dark:divide-[#3F4045]">
          {filteredTutors.map((tutor) => {
            const fullName = `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || 'Korepetytor';
            const initials = `${(tutor.firstName || 'K')[0]}${(tutor.lastName || 'R')[0]}`.toUpperCase();
            const mode =
              tutor.mode === 'ONLINE' ? 'Online' :
              tutor.mode === 'OFFLINE' ? 'Offline' :
              tutor.mode === 'BOTH' ? 'Online + Offline' : '—';

            return (
              <li key={tutor.id} className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Avatar + dane */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-[#58B09C] text-white flex items-center justify-center font-semibold">
                        {initials}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#02111B] dark:text-[#F2F6FA] truncate">
                          {fullName}
                        </h3>
                        {/* chip trybu */}
                        <span className="badge rounded-md px-2 py-1 text-[11px] border border-[#E5E5E5] dark:border-[#3F4045] text-[#5D737E]">
                          {mode}
                        </span>
                        {/* chip lokalizacji jeśli jest */}
                        {tutor.city && (
                          <span className="badge rounded-md px-2 py-1 text-[11px] border border-[#E5E5E5] dark:border-[#3F4045] text-[#5D737E]">
                            {tutor.city}
                          </span>
                        )}
                      </div>
                      {tutor.description && (
                        <p className="mt-1 text-xs text-[#3F4045] dark:text-[#F2F6FA] opacity-90 line-clamp-2">
                          {tutor.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Akcje */}
                  <div className="sm:ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/student/tutors/${tutor.id}`)}
                      className="btn h-9 rounded-md px-3 bg-transparent
                                 border border-[#E5E5E5] dark:border-[#3F4045]
                                 text-[#02111B] dark:text-[#F2F6FA]
                                 hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                                 focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                    >
                      Szczegóły
                    </button>
                    <button
                      type="button"
                      aria-label="Usuń z widoku"
                      title="Usuń z widoku"
                      onClick={() => handleRemoveFromView(tutor.id)}
                      className="btn h-9 w-9 rounded-md
                                 border border-[#E15B64] text-[#E15B64] bg-transparent
                                 hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                                 focus:outline-none focus:ring-2 focus:ring-[#E15B64] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </div>
);
}