
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
    role: 'STUDENT',
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
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs md:text-sm text-[#58B09C] hover:underline"
        >
          <span className="text-sm">←</span>
          Wróć na stronę główną
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-center mb-1">Rejestracja</h2>
      <p className="text-center text-xs md:text-sm text-base-content/70 mb-4">
        Utwórz konto jako uczeń lub korepetytor.
      </p>

      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex justify-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => handleRoleChange("STUDENT")}
            className={
              "btn btn-sm md:btn-md rounded-lg px-4 " +
              (form.role === "STUDENT"
                ? "bg-[#58B09C] hover:bg-[#4A957F] text-white border-none"
                : "bg-base-100 text-base-content border border-base-300 hover:bg-base-200")
            }
          >
            Uczeń
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("TUTOR")}
            className={
              "btn btn-sm md:btn-md rounded-lg px-4 " +
              (form.role === "TUTOR"
                ? "bg-[#58B09C] hover:bg-[#4A957F] text-white border-none"
                : "bg-base-100 text-base-content border border-base-300 hover:bg-base-200")
            }
          >
            Korepetytor
          </button>
        </div>

        <label className="form-control w-full">
          <span className="label-text">Imię</span>
          <input
            type="text"
            name="firstName"
            placeholder="np. Jan"
            className="input input-bordered w-full"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">Nazwisko</span>
          <input
            type="text"
            name="lastName"
            placeholder="np. Kowalski"
            className="input input-bordered w-full"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">Email</span>
          <input
            type="email"
            name="email"
            placeholder="np. jan.kowalski@email.com"
            className="input input-bordered w-full"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">Hasło</span>
          <input
            type="password"
            name="password"
            placeholder="Wpisz hasło"
            className="input input-bordered w-full"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full rounded-lg bg-[#58B09C] hover:bg-[#4A957F] text-white border-none mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Rejestrowanie..." : "Zarejestruj się"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Masz już konto?{" "}
        <Link to="/login" className="text-[#58B09C] hover:underline">
          Zaloguj się
        </Link>
      </p>
    </>
  );
}