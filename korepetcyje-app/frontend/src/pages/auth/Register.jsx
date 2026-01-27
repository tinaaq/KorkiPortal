
// src/pages/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registerRequest } from '../../services/authService';
import {
  getTutorProfile,
  getStudentProfile,
  isTutorProfileComplete,
  isStudentProfileComplete,
} from '../../services/profileService';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT', // domyślnie
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerRequest(form);

      // zapis tokenu + user w kontekście
      login(res.data);

      const { role } = res.data.user;

      // SPRAWDZENIE PROFILU PO REJESTRACJI
      if (role === 'TUTOR') {
        try {
          const profileRes = await getTutorProfile();
          const complete = isTutorProfileComplete(profileRes.data);

          if (complete) navigate('/tutor');
          else navigate('/tutor/profile');
        } catch {
          // brak profilu / błąd = traktujemy jak nieuzupełniony
          navigate('/tutor/profile');
        }
      } else {
        try {
          const profileRes = await getStudentProfile();
          const complete = isStudentProfileComplete(profileRes.data);

          if (complete) navigate('/student');
          else navigate('/student/profile');
        } catch {
          navigate('/student/profile');
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Błąd rejestracji'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Rejestracja
      </h2>

      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="join join-vertical sm:join-horizontal mb-2">
          <button
            type="button"
            className={`btn join-item ${
              form.role === 'STUDENT' ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => handleRoleChange('STUDENT')}
          >
            Uczeń
          </button>
          <button
            type="button"
            className={`btn join-item ${
              form.role === 'TUTOR' ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => handleRoleChange('TUTOR')}
          >
            Korepetytor
          </button>
        </div>

        <input
          type="text"
          name="firstName"
          placeholder="Imię"
          className="input input-bordered w-full"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="lastName"
          placeholder="Nazwisko"
          className="input input-bordered w-full"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Hasło"
          className="input input-bordered w-full"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          className="btn btn-primary mt-2"
          disabled={loading}
        >
          {loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Masz już konto?{' '}
        <Link to="/login" className="link link-primary">
          Zaloguj się
        </Link>
      </p>
    </>
  );
}
