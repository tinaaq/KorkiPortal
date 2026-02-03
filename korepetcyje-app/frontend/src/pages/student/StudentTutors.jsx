import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTutors } from '../../services/tutorsService';


const MODE_OPTIONS = [
  { value: '', label: 'Dowolny tryb' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'BOTH', label: 'Online + Offline' },
];

const INITIAL_FILTERS = {
  name: '',
  city: '',
  subject: '',
  mode: '',
};

export default function StudentTutors() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;
  const navigate = useNavigate();

  const fetchTutors = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        sortBy: 'firstName',
        order: 'asc',
      };

if (appliedFilters.name.trim()) params.name = appliedFilters.name.trim();
if (appliedFilters.city.trim()) params.city = appliedFilters.city.trim();
if (appliedFilters.subject.trim()) params.subject = appliedFilters.subject.trim();
if (appliedFilters.mode) params.mode = appliedFilters.mode;


      const res = await searchTutors(params);

      setTutors(res.data.data || []);
      setPage(res.data.pagination.page || 1);
      setTotalPages(res.data.pagination.totalPages || 1);
      setTotal(res.data.pagination.total || 0);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Nie udało się pobrać listy korepetytorów'
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchTutors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [appliedFilters, page]);


  // Zmiana pól tekstowych
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Zmiana trybu
  const handleModeChange = (mode) => {
    setFilters((prev) => ({ ...prev, mode }));
  };

const handleSubmit = (e) => {
  e.preventDefault();
  setAppliedFilters(filters);
  setPage(1);
};


const handleReset = () => {
  setFilters(INITIAL_FILTERS);
  setAppliedFilters(INITIAL_FILTERS);
  setPage(1);
};


  // Zmiana strony
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const renderModeBadge = (mode) => {
    if (mode === 'ONLINE') return <span className="badge badge-info">Online</span>;
    if (mode === 'OFFLINE') return <span className="badge badge-warning">Offline</span>;
    if (mode === 'BOTH') return <span className="badge badge-success">Online + Offline</span>;
    return null;
  };

 return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
        Korepetytorzy
      </h1>
      <p className="text-sm text-[#5D737E]">
        Użyj filtrów, aby szybciej znaleźć odpowiedniego korepetytora.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Imię / nazwisko
              </span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="np. Jan, Kowalski"
              value={filters.name}
              onChange={handleFilterChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:ring-2 focus:ring-[#58B09C] focus:border-[#58B09C]"
            />
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Miasto
              </span>
            </label>
            <input
              type="text"
              name="city"
              placeholder="np. Katowice"
              value={filters.city}
              onChange={handleFilterChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:ring-2 focus:ring-[#58B09C] focus:border-[#58B09C]"
            />
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Przedmiot
              </span>
            </label>
            <input
              type="text"
              name="subject"
              placeholder="np. Matematyka"
              value={filters.subject}
              onChange={handleFilterChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:ring-2 focus:ring-[#58B09C] focus:border-[#58B09C]"
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Tryb zajęć
              </span>
            </label>
            <div className="inline-flex flex-wrap gap-2 rounded-lg bg-[#F2F2F2] dark:bg-[#161D24] p-1">
              {MODE_OPTIONS.map((option) => {
                const active = filters.mode === option.value;
                return (
                  <button
                    key={option.value || 'ANY'}
                    type="button"
                    onClick={() => handleModeChange(option.value)}
                    className={[
                      "btn min-h-0 h-9 px-3 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#58B09C]",
                      active
                        ? "bg-[#58B09C] hover:bg-[#4FA893] text-white border border-[#58B09C]"
                        : "bg-transparent text-[#02111B] dark:text-[#F2F6FA] border border-transparent hover:bg-[#E5E5E5] dark:hover:bg-[#161D24]"
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

    
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn h-10 rounded-md px-4 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
          >
            Wyczyść
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn h-10 rounded-md px-5 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
          >
            {loading ? 'Filtrowanie...' : 'Szukaj'}
          </button>
        </div>
      </div>
    </form>


    {error && (
      <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64]">
        {error}
      </div>
    )}


    <div className="flex items-center justify-between text-sm text-[#5D737E]">
      <span>Łącznie: <span className="text-[#02111B] dark:text-[#F2F6FA] font-medium">{total}</span> korepetytorów</span>
      <span>Strona {page} / {totalPages}</span>
    </div>


    {loading && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-5">
            <div className="skeleton h-5 w-1/2 !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
            <div className="mt-3 space-y-2">
              <div className="skeleton h-4 w-2/3 !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
              <div className="skeleton h-4 w-1/3 !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
            </div>
            <div className="mt-4 skeleton h-8 w-full !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
          </div>
        ))}
      </div>
    )}

    {!loading && tutors.length === 0 && (
      <div className="rounded-md border border-dashed border-[#E5E5E5] dark:border-[#3F4045] p-8 text-center">
        <div className="text-sm text-[#5D737E] mb-3">
          Brak korepetytorów dla wybranych filtrów.
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="btn h-10 rounded-md px-4 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
        >
          Wyczyść filtry
        </button>
      </div>
    )}

    {!loading && tutors.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
            <div className="card-body p-5">
           
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA] truncate">
                    {tutor.firstName} {tutor.lastName}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5D737E]">
                    {tutor.city && <span className="truncate">{tutor.city}</span>}
                  </div>
                </div>

  
                {tutor.mode && (
                  <span
                    className={[
                      "badge rounded-md border px-2 py-2 text-[11px]",
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

   
              {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-[#02111B] dark:text-[#F2F6FA] mb-1">
                    Przedmioty i ceny:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((s) => (
                      <div
                        key={s.subjectId}
                        className="badge rounded-md border border-[#E5E5E5] dark:border-[#3F4045] bg-transparent text-[#02111B] dark:text-[#F2F6FA] gap-1 px-2 py-2"
                      >
                        <span>{s.subject?.name || 'Przedmiot'}</span>
                        {s.priceInfo && (
                          <>
                            <span className="text-[#5D737E]">•</span>
                            <span>{s.priceInfo}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

      
              {tutor.description && (
                <p className="mt-3 text-sm text-[#3F4045] dark:text-[#F2F6FA] opacity-90 line-clamp-3">
                  {tutor.description}
                </p>
              )}

      
              <div className="card-actions justify-end mt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/student/tutors/${tutor.id}`)}
                  className="btn h-10 btn-sm rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                >
                  Zobacz profil
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/student/tutors/${tutor.id}/book`)}
                  className="btn h-10 btn-sm rounded-md px-3 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
                >
                  Umów się na zajęcia
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}


    {totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 pt-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="btn btn-sm h-9 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
        >
          « Poprzednia
        </button>
        <span className="text-sm text-[#5D737E]">
          Strona {page} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className="btn btn-sm h-9 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
        >
          Następna »
        </button>
      </div>
    )}
  </div>
);
}
