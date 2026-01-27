
// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginRequest } from '../../services/authService';
import {
  getTutorProfile,
  getStudentProfile,
  isTutorProfileComplete,
  isStudentProfileComplete,
} from '../../services/profileService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginRequest({ email, password });

      // zapis tokenu + user w kontekście
      login(res.data);

      const { role } = res.data.user;

      // SPRAWDZENIE PROFILU PO LOGOWANIU
      if (role === 'TUTOR') {
        try {
          const profileRes = await getTutorProfile();
          const complete = isTutorProfileComplete(profileRes.data);

          if (complete) navigate('/tutor');
          else navigate('/tutor/profile');
        } catch {
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
        err.response?.data?.error || 'Błąd logowania'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Logowanie
      </h2>

      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Hasło"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="btn btn-primary mt-2"
          disabled={loading}
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Nie masz konta?{' '}
        <Link to="/register" className="link link-primary">
          Zarejestruj się
        </Link>
      </p>
    </>
  );
}
