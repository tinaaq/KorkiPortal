
// src/pages/student/StudentTutors.jsx
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
  description: '',
};

export default function StudentTutors() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;
  const navigate = useNavigate();

  // 🔁 Główna funkcja pobierająca korepetytorów
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

      if (filters.name.trim()) params.name = filters.name.trim();
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.subject.trim()) params.subject = filters.subject.trim();
      if (filters.mode) params.mode = filters.mode;

      // description – backend na razie nie obsługuje
      // if (filters.description.trim()) params.description = filters.description.trim();

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

  // ✅ Auto-fetch przy zmianie filters lub page
  useEffect(() => {
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // Zmiana pól tekstowych
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Zmiana trybu
  const handleModeChange = (mode) => {
    setFilters((prev) => ({ ...prev, mode }));
  };

  // Klik „Szukaj” – tylko resetuje stronę na 1
  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Klik „Wyczyść” – reset filtrów + strona 1
  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
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
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Korepetytorzy</h1>

      {/* FILTRY */}
      <form
        onSubmit={handleSubmit}
        className="card bg-base-100 shadow-sm mb-6"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Imię / nazwisko */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Imię / nazwisko</span>
              </label>
              <input
                type="text"
                name="name"
                className="input input-bordered w-full"
                placeholder="np. Jan, Kowalski"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </div>

            {/* Miasto */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Miasto</span>
              </label>
              <input
                type="text"
                name="city"
                className="input input-bordered w-full"
                placeholder="np. Katowice"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>

            {/* Przedmiot */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Przedmiot</span>
              </label>
              <input
                type="text"
                name="subject"
                className="input input-bordered w-full"
                placeholder="np. Matematyka"
                value={filters.subject}
                onChange={handleFilterChange}
              />
            </div>

            {/* Tryb zajęć */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Tryb zajęć</span>
              </label>
              <div className="join flex flex-wrap">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value || 'ANY'}
                    type="button"
                    className={`btn join-item mb-2 ${
                      filters.mode === option.value ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => handleModeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opis – backend jeszcze nie obsługuje */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Opis
                  <span className="text-xs opacity-60 ml-1">
                    (wymaga wsparcia w backendzie)
                  </span>
                </span>
              </label>
              <input
                type="text"
                name="description"
                className="input input-bordered w-full"
                placeholder="słowo kluczowe w opisie"
                value={filters.description}
                onChange={handleFilterChange}
                disabled
              />
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
            >
              Wyczyść
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Filtrowanie...' : 'Szukaj'}
            </button>
          </div>
        </div>
      </form>

      {/* ERROR */}
      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      {/* INFO O LICZBIE */}
      <div className="flex items-center justify-between mb-3 text-sm opacity-70">
        <span>Łącznie: {total} korepetytorów</span>
        <span>
          Strona {page} / {totalPages}
        </span>
      </div>

      {/* LISTA */}
      {loading && (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}

      {!loading && tutors.length === 0 && (
        <p className="text-sm opacity-70">
          Brak korepetytorów dla wybranych filtrów.
        </p>
      )}

      {!loading && tutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="card bg-base-100 shadow-sm">
              <div className="card-body">
                {/* Nagłówek */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="card-title">
                      {tutor.firstName} {tutor.lastName}
                    </h2>
                    <div className="flex gap-2 text-xs opacity-70">
                      {tutor.city && <span>{tutor.city}</span>}
                    </div>
                  </div>
                  {renderModeBadge(tutor.mode)}
                </div>

                {/* Przedmioty */}
                {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-semibold mb-1">
                      Przedmioty i ceny:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.map((s) => (
                        <div
                          key={s.subjectId}
                          className="badge badge-outline gap-1"
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
                  </div>
                )}

                {/* Opis */}
                {tutor.description && (
                  <p className="mt-2 text-sm opacity-80 line-clamp-3">
                    {tutor.description}
                  </p>
                )}

                {/* Akcje */}
                <div className="card-actions justify-end mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => navigate(`/student/tutors/${tutor.id}`)}
                  >
                    Zobacz profil
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled
                  >
                    Umów się na zajęcia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINACJA */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            « Poprzednia
          </button>
          <span className="text-sm opacity-80">
            Strona {page} / {totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Następna »
          </button>
        </div>
      )}
    </div>
  );
}
