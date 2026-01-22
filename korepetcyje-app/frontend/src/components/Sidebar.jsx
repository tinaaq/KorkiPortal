import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <ul className="menu p-4 w-64 min-h-full bg-base-100 text-base-content">

      <li className="menu-title">Panel</li>

      {user?.role === 'TUTOR' && (
        <>
          <li><Link to="/tutor">Dashboard</Link></li>
          <li><Link to="/tutor/profile">Profil</Link></li>
          <li><Link to="/tutor/calendar">Kalendarz</Link></li>
          <li><Link to="/tutor/students">Uczniowie</Link></li>
          <li><Link to="/tutor/flashcards">Fiszki</Link></li>
        </>
      )}

      {user?.role === 'STUDENT' && (
        <>
          <li><Link to="/student">Dashboard</Link></li>
          <li><Link to="/student/tutors">Korepetytorzy</Link></li>
          <li><Link to="/student/calendar">Moje zajęcia</Link></li>
          <li><Link to="/student/flashcards">Fiszki</Link></li>
        </>
      )}

    </ul>
  );
}
