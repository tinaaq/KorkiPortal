import { useEffect, useState } from 'react';
import {
  getStudentProfile,
  updateStudentProfile,
} from '../../services/studentProfileService';

export default function StudentProfile() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    address: '',
    grade: '',
    school: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getStudentProfile();
        const p = res.data;

        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          city: p.city || '',
          address: p.address || '',
          grade: p.grade || '',
          school: p.school || '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Nie udało się pobrać profilu');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    if (!form.firstName || !form.lastName) {
      setError('Imię i nazwisko są wymagane');
      setSaving(false);
      return;
    }

    try {
      await updateStudentProfile(form);
      setSuccess('Profil został zapisany');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Nie udało się zapisać profilu'
      );
    } finally {
      setSaving(false);
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
        Profil ucznia
      </h1>
      <p className="text-sm text-[#5D737E]">
        Uzupełnij dane, aby korepetytorzy mogli lepiej przygotowywać materiały do twoich zajeć.
      </p>

    </div>

    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Dane osobowe i adresy</h2>
          <p className="text-xs text-[#5D737E]">Pola oznaczone * są wymagane.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Imię*
              </span>
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
              placeholder="Jan"
            />
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Nazwisko*
              </span>
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
              placeholder="Kowalski"
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
              value={form.city}
              onChange={handleChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
              placeholder="np. Warszawa"
            />
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Adres
              </span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
              placeholder="ul. Przykładowa 1/2"
            />
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Klasa
              </span>
            </label>
            <input
              type="text"
              name="grade"
              value={form.grade}
              onChange={handleChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
              placeholder="np. 5, VII"
            />
          </div>

          <div className="form-control md:col-span-1">
            <label className="label py-1">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-[#5D737E]">
                Szkoła
              </span>
            </label>
            <input
              type="text"
              name="school"
              value={form.school}
              onChange={handleChange}
              className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:border-[#58B09C] focus:ring-2 focus:ring-[#58B09C]"
              placeholder="np. Liceum, Uniwersytet"
            />
          </div>

            {(error || success) && (
              <div className="md:col-span-2">
                <div
                  className={[
                    "rounded-md p-3 text-sm",
                    error
                      ? "border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] text-[#E15B64]"
                      : "border border-[#58B09C] bg-[#F2F2F2] dark:bg-[#161D24] text-[#58B09C]"
                  ].join(" ")}
                >
                  {error || success}
                </div>
              </div>
            )}

 
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
  </div>
);
}
