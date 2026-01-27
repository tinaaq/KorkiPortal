
// src/pages/student/StudentProfile.jsx
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

  // 1. Pobierz profil
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

  // 2. Zapisz
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Profil ucznia
      </h1>

      {error && (
        <div className="alert alert-error mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="alert alert-success mb-4 text-sm">{success}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
            <span className="label-text">Miasto*</span>
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
            <span className="label-text">Adres</span>
          </label>
          <input
            type="text"
            name="address"
            className="input input-bordered w-full"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* Klasa */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Klasa*</span>
          </label>
          <input
            type="text"
            name="grade"
            className="input input-bordered w-full"
            value={form.grade}
            onChange={handleChange}
            required
          />
        </div>

        {/* Szkoła */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Szkoła</span>
          </label>
          <input
            type="text"
            name="school"
            className="input input-bordered w-full"
            value={form.school}
            onChange={handleChange}
          />
        </div>

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
    </div>
  );
}
