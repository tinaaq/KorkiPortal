
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

      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs md:text-sm text-[#58B09C] hover:underline"
        >
          <span className="text-sm">←</span>
          Wróć na stronę główną
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-center mb-1">Logowanie</h2>
      <p className="text-center text-xs md:text-sm text-base-content/70 mb-4">
        Zaloguj się, aby przejść do swojego panelu ucznia lub korepetytora.
      </p>

      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="form-control w-full">
          <span className="label-text text-xs md:text-sm">Email</span>
          <input
            type="email"
            placeholder="np. jan.kowalski@email.com"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text text-xs md:text-sm">Hasło</span>
          <input
            type="password"
            placeholder="Wpisz hasło"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full mt-2 rounded-lg bg-[#58B09C] hover:bg-[#4A957F] text-white border-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Nie masz konta?{" "}
        <Link to="/register" className="text-[#58B09C] hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </>
  );
}
