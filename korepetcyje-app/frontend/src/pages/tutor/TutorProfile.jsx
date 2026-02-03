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

  const [photoFile, setPhotoFile] = useState(null);
const [photoPreview, setPhotoPreview] = useState('');

const API_URL = import.meta.env.VITE_API_URL;



  
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setSubjectsLoading(true);
    setError(null);
    setSubjectError(null);

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

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (mode) => {
    setForm((prev) => ({ ...prev, mode }));
  };

  const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    setPhotoFile(null);
    setPhotoPreview('');
    return;
  }
  if (!file.type.startsWith('image/')) {
    setError('Dozwolone są tylko pliki graficzne');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setError('Plik jest za duży (max 5MB)');
    return;
  }
  setError(null);
  setPhotoFile(file);
  setPhotoPreview(URL.createObjectURL(file));
};

useEffect(() => {
  return () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  };
}, [photoPreview]);

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

if (photoFile) {
    const fd = new FormData();
    fd.append('firstName', form.firstName);
    fd.append('lastName', form.lastName);
    fd.append('city', form.city || '');
    fd.append('address', form.address || '');
    fd.append('mode', form.mode || '');
    fd.append('description', form.description || '');
    fd.append('meetingLink', form.meetingLink || '');
   
    fd.append('photo', photoFile);

    const res = await updateTutorProfile(fd);

   
    if (res?.data?.photoUrl) {
      setForm((prev) => ({ ...prev, photoUrl: res.data.photoUrl }));
    }
    setPhotoFile(null);
    setPhotoPreview('');
  }

      else{
      await updateTutorProfile(form);}
      setSuccess('Profil został zapisany');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Nie udało się zapisać profilu'
      );
    } finally {
      setSaving(false);
    }
  };

 
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

 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

return (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
   
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
        Profil korepetytora
      </h1>
      <p className="text-sm text-[#5D737E]">
        Uzupełnij swój profil — uczniowie zobaczą te dane w wynikach wyszukiwania oraz na Twojej stronie.
      </p>
    </div>

    {error && (
      <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64]">
        {error}
      </div>
    )}
    {success && (
      <div className="rounded-md border border-[#58B09C] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#58B09C]">
        {success}
      </div>
    )}


    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Dane osobowe i adresy</h2>
          <p className="text-xs text-[#5D737E]">Te informacje pomogą uczniom Cię znaleźć.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">Imię*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>

        
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">Nazwisko*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>

        
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">Miasto</span>
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>

        
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Adres (dla zajęć stacjonarnych)
              </span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>

       
          <div className="form-control md:col-span-2">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">Tryb zajęć*</span>
            </label>
            <div className="inline-flex flex-wrap gap-2 rounded-lg bg-[#F2F2F2] dark:bg-[#161D24] p-1">
              {MODE_OPTIONS.map((option) => {
                const active = form.mode === option.value;
                return (
                  <button
                    key={option.value}
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

       
          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn h-11 rounded-md px-5 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60 w-full sm:w-auto"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz profil'}
            </button>
          </div>
        </form>
      </div>
    </div>


    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Linki do spotkania</h2>
          <p className="text-xs text-[#5D737E]">Dodaj link do Zoom/Teams/Meet, którego używasz na zajęciach online.</p>
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
              Link do spotkań online
            </span>
          </label>
          <input
            type="url"
            name="meetingLink"
            value={form.meetingLink}
            onChange={handleChange}
            placeholder="https://..."
            className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
          />
        </div>
      </div>
    </div>

  
    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Zdjęcie i opis</h2>
          <p className="text-xs text-[#5D737E]">Dodaj zdjęcie i krótki opis, aby zbudować zaufanie.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                        Zdjęcie profilowe
                      </span>
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="file-input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
                    />

                    <p className="mt-2 text-xs text-[#5D737E]">
                      Obsługiwane: JPG, PNG, WEBP. Maks. 5MB.
                    </p>
                  </div>

                  {(photoPreview || form.photoUrl) && (
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="w-20 rounded-full ring ring-[#58B09C] ring-offset-2 ring-offset-[#FCFCFC] dark:ring-offset-[#1A232B] overflow-hidden">
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <img src={photoPreview ||  (form.photoUrl ? `${API_URL}${form.photoUrl}` : '')} alt="Avatar"/>
                        </div>
                      </div>
                      <span className="text-xs text-[#5D737E]">Podgląd zdjęcia</span>
                    </div>
                  )}
                </div>

          
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Opis
              </span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Napisz o swoim doświadczeniu, poziomach, z którymi pracujesz, itp."
              className="textarea w-full min-h-[140px] rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>
        </div>
      </div>
    </div>

 
    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Przedmioty i ceny</h2>
          <span className="text-xs text-[#5D737E]">Wymagany jest co najmniej jeden przedmiot</span>
        </div>

        {subjectError && (
          <div className="mb-3 rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64]">
            {subjectError}
          </div>
        )}

       
        <form onSubmit={handleAddSubject} className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Nazwa przedmiotu (np. Matematyka)"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            className="input flex-1 h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
          />
          <input
            type="text"
            placeholder="Cena (np. 80 zł / 60 min)"
            value={newPriceInfo}
            onChange={(e) => setNewPriceInfo(e.target.value)}
            className="input w-full md:w-56 h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
          />
          <button
            type="submit"
            disabled={subjectSavingId === 'new'}
            className="btn h-11 rounded-md px-5 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60 w-full md:w-auto"
          >
            {subjectSavingId === 'new' ? 'Dodawanie...' : 'Dodaj'}
          </button>
        </form>

  
        {subjectsLoading ? (
          <div className="space-y-2">
            <div className="skeleton h-8 w-full !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
            <div className="skeleton h-8 w-full !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
            <div className="skeleton h-8 w-full !bg-[#E5E5E5] dark:!bg-[#3F4045]" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#E5E5E5] dark:border-[#3F4045] p-6 text-center">
            <div className="text-sm text-[#5D737E] mb-3">Nie dodałeś jeszcze żadnych przedmiotów.</div>
            <button
              type="button"
              onClick={() => {
                const el = document.querySelector('input[placeholder="Nazwa przedmiotu (np. Matematyka)"]');
                el?.focus();
              }}
              className="btn h-10 rounded-md px-4 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            >
              Dodaj przedmiot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[#E5E5E5] dark:border-[#3F4045]">
            <table className="table table-sm">
              <thead className="bg-[#F2F2F2] dark:bg-[#161D24]">
                <tr>
                  <th className="text-[#5D737E] font-medium">Przedmiot</th>
                  <th className="text-[#5D737E] font-medium">Cena / opis</th>
                  <th className="text-[#5D737E] font-medium w-40 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.subjectId} className="border-b border-[#E5E5E5] dark:border-[#3F4045]">
                    <td className="text-[#02111B] dark:text-[#F2F6FA]">{s.subject?.name || '—'}</td>
                    <td>
                      <input
                        type="text"
                        value={s.priceInfo || ''}
                        onChange={(e) => handleSubjectPriceChange(s.subjectId, e.target.value)}
                        className="input input-sm w-full md:w-56 h-9 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
                      />
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveSubject(s.subjectId, s.priceInfo || '')}
                          disabled={subjectSavingId === s.subjectId}
                          className="btn btn-xs rounded-md px-3 bg-transparent border border-[#58B09C] text-[#58B09C] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
                        >
                          {subjectSavingId === s.subjectId ? 'Zapisywanie...' : 'Zapisz'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(s.subjectId)}
                          disabled={subjectSavingId === s.subjectId}
                          className="btn btn-xs rounded-md px-3 bg-transparent border border-[#E15B64] text-[#E15B64] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
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
