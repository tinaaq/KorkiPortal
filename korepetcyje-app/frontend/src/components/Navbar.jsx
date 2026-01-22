import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-100 shadow">

      <div className="flex-none lg:hidden">
        <label htmlFor="app-drawer" className="btn btn-square btn-ghost">
          ☰
        </label>
      </div>

      <div className="flex-1 font-bold text-lg">Korepetycje</div>

      <div className="flex items-center gap-3">
        <span className="badge badge-outline">{user?.role}</span>
        <button onClick={handleLogout} className="btn btn-sm btn-outline">
          Logout
        </button>
      </div>

    </div>
  );
}
