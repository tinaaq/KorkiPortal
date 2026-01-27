
// src/pages/tutor/TutorProfile.jsx
import { useEffect, useState } from 'react';
import {
  getTutorProfile,
  updateTutorProfile,
} from '../../services/profileService';
import {
  getTutorSubjects,
  addTutorSubject,
  updateTutorSubject,
  deleteTutorSubject,
} from '../../services/tutorSubjectsService';

const MODE_OPTIONS = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'BOTH', label: 'Online + Offline' },
];

export default function TutorProfile() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    address: '',
    mode: '',
    description: '',
    meetingLink: '',
    photoUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // PRZEDMIOTY
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectError, setSubjectError] = useState(null);
  const [subjectSavingId, setSubjectSavingId] = useState(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newPriceInfo, setNewPriceInfo] = useState('');

  // --- FETCH PROFIL + PRZEDMIOTY ---
  
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setSubjectsLoading(true);
    setError(null);
    setSubjectError(null);

    // 1️⃣ Najpierw PROFIL (osobny try/catch)
    try {
      const profileRes = await getTutorProfile();
      const p = profileRes.data;

      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        city: p.city || '',
        address: p.address || '',
        mode: p.mode || '',
        description: p.description || '',
        meetingLink: p.meetingLink || '',
        photoUrl: p.photoUrl || '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Nie udało się pobrać profilu korepetytora';
      setError(msg);
    } finally {
      setLoading(false);
    }

    // 2️⃣ Potem PRZEDMIOTY (osobny try/catch)
    try {
      const subjectsRes = await getTutorSubjects();
      setSubjects(subjectsRes.data || []);
    } catch (err) {
      setSubjectError(
        err.response?.data?.error ||
          'Nie udało się pobrać przedmiotów'
      );
    } finally {
      setSubjectsLoading(false);
    }
  };

  fetchData();
}, []);


  const reloadSubjects = async () => {
    setSubjectsLoading(true);
    setSubjectError(null);
    try {
      const res = await getTutorSubjects();
      setSubjects(res.data || []);
    } catch (err) {
      setSubjectError(
        err.response?.data?.error || 'Nie udało się pobrać przedmiotów'
      );
    } finally {
      setSubjectsLoading(false);
    }
  };

  // --- FORM PROFILU ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (mode) => {
    setForm((prev) => ({ ...prev, mode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Imię i nazwisko są wymagane');
      setSaving(false);
      return;
    }

    if (!form.mode) {
      setError('Tryb zajęć jest wymagany');
      setSaving(false);
      return;
    }

    try {
      await updateTutorProfile(form);
      setSuccess('Profil został zapisany');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Nie udało się zapisać profilu'
      );
    } finally {
      setSaving(false);
    }
  };

  // --- PRZEDMIOTY: HANDLERS ---
  const handleSubjectPriceChange = (subjectId, value) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.subjectId === subjectId ? { ...s, priceInfo: value } : s
      )
    );
  };

  const handleSaveSubject = async (subjectId, priceInfo) => {
    if (!priceInfo.trim()) {
      setSubjectError('Cena jest wymagana');
      return;
    }

    setSubjectSavingId(subjectId);
    setSubjectError(null);

    try {
      await updateTutorSubject(subjectId, { priceInfo });
      await reloadSubjects();
    } catch (err) {
      setSubjectError(
        err.response?.data?.error || 'Nie udało się zaktualizować przedmiotu'
      );
    } finally {
      setSubjectSavingId(null);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    const ok = window.confirm('Na pewno chcesz usunąć ten przedmiot?');
    if (!ok) return;

    setSubjectSavingId(subjectId);
    setSubjectError(null);

    try {
      await deleteTutorSubject(subjectId);
      await reloadSubjects();
    } catch (err) {
      setSubjectError(
        err.response?.data?.error || 'Nie udało się usunąć przedmiotu'
      );
    } finally {
      setSubjectSavingId(null);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setSubjectError(null);

    if (!newSubjectName.trim() || !newPriceInfo.trim()) {
      setSubjectError('Nazwa przedmiotu i cena są wymagane');
      return;
    }

    setSubjectSavingId('new');

    try {
      await addTutorSubject({
        subjectName: newSubjectName.trim(),
        priceInfo: newPriceInfo.trim(),
      });

      setNewSubjectName('');
      setNewPriceInfo('');
      await reloadSubjects();
    } catch (err) {
      setSubjectError(
        err.response?.data?.error || 'Nie udało się dodać przedmiotu'
      );
    } finally {
      setSubjectSavingId(null);
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Profil korepetytora
      </h1>

      <p className="mb-4 text-sm opacity-70">
        Uzupełnij swój profil. Uczniowie widzą te dane w wynikach
        wyszukiwania oraz w szczegółach Twojego profilu.
      </p>

      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 text-sm">
          {success}
        </div>
      )}

      {/* --- FORM DANYCH PROFILU --- */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {/* Imię */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Imię*</span>
          </label>
          <input
            type="text"
            name="firstName"
            className="input input-bordered w-full"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Nazwisko */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nazwisko*</span>
          </label>
          <input
            type="text"
            name="lastName"
            className="input input-bordered w-full"
            value={form.lastName}
            onChange={handleChange}
            required
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
            value={form.city}
            onChange={handleChange}
          />
        </div>

        {/* Adres */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">
              Adres (dla zajęć stacjonarnych)
            </span>
          </label>
          <input
            type="text"
            name="address"
            className="input input-bordered w-full"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* Tryb zajęć */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Tryb zajęć*</span>
          </label>
          <div className="join flex flex-wrap">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`btn join-item mb-2 ${
                  form.mode === option.value
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
                onClick={() => handleModeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opis */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Opis</span>
          </label>
          <textarea
            name="description"
            className="textarea textarea-bordered w-full min-h-[100px]"
            value={form.description}
            onChange={handleChange}
            placeholder="Napisz o swoim doświadczeniu, poziomach, z którymi pracujesz, itp."
          />
        </div>

        {/* Link do zajęć online */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">
              Link do spotkań online (np. Zoom, Teams)
            </span>
          </label>
          <input
            type="url"
            name="meetingLink"
            className="input input-bordered w-full"
            value={form.meetingLink}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        {/* URL zdjęcia */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">
              Link do zdjęcia profilowego
            </span>
          </label>
          <input
            type="url"
            name="photoUrl"
            className="input input-bordered w-full"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        {/* Podgląd zdjęcia */}
        {form.photoUrl && (
          <div className="md:col-span-2 flex justify-start mt-2">
            <div className="avatar">
              <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={form.photoUrl} />
              </div>
            </div>
          </div>
        )}

        {/* Zapisz profil */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Zapisywanie...' : 'Zapisz profil'}
          </button>
        </div>
      </form>

      {/* --- SEKCJA PRZEDMIOTY + CENY --- */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <h2 className="card-title">Przedmioty i ceny</h2>
            <span className="text-xs opacity-70">
              Wymagany jest co najmniej jeden przedmiot
            </span>
          </div>

          {subjectError && (
            <div className="alert alert-error mb-3 text-sm">
              {subjectError}
            </div>
          )}

          {/* Dodawanie nowego przedmiotu */}
          <form
            onSubmit={handleAddSubject}
            className="flex flex-col md:flex-row gap-2 mb-4"
          >
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Nazwa przedmiotu (np. Matematyka)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Cena (np. 80 zł / 60 min)"
              value={newPriceInfo}
              onChange={(e) => setNewPriceInfo(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={subjectSavingId === 'new'}
            >
              {subjectSavingId === 'new' ? 'Dodawanie...' : 'Dodaj'}
            </button>
          </form>

          {/* Lista przedmiotów */}
          {subjectsLoading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner" />
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-sm opacity-70">
              Nie dodałeś jeszcze żadnych przedmiotów.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Przedmiot</th>
                    <th>Cena / opis</th>
                    <th className="w-40 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.subjectId}>
                      <td>{s.subject?.name || '—'}</td>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered input-xs w-full"
                          value={s.priceInfo || ''}
                          onChange={(e) =>
                            handleSubjectPriceChange(
                              s.subjectId,
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() =>
                              handleSaveSubject(
                                s.subjectId,
                                s.priceInfo || ''
                              )
                            }
                            disabled={subjectSavingId === s.subjectId}
                          >
                            {subjectSavingId === s.subjectId
                              ? 'Zapisywanie...'
                              : 'Zapisz'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-error btn-outline"
                            onClick={() =>
                              handleDeleteSubject(s.subjectId)
                            }
                            disabled={subjectSavingId === s.subjectId}
                          >
                            Usuń
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
