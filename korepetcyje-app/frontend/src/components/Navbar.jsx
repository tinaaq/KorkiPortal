import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-100 backdrop-blur border-b border-base-300 shadow-sm sticky top-0 z-20 px-4 lg:px-6">

      <div className="flex-none lg:hidden">
        <label htmlFor="app-drawer" className="btn btn-square btn-ghost">
          ☰
        </label>
      </div>

      <div className="flex-1 font-semibold text-lg tracking-tight">
        <span className="text-[#58B09C]">CzasNa</span>Korki
      </div>

      <div className="flex items-center gap-4">

        <div className="px-3 py-1 text-xs rounded-full border border-base-300">
          {user?.role === "TUTOR" ? "Korepetytor" : "Uczeń"}
        </div>
          <ThemeToggle />

        <button
          onClick={handleLogout}
          className="btn btn-sm rounded-lg bg-[#58B09C] px-3 text-sm hover:bg-[#4A957F] text-white border-none"
        >
          Wyloguj
        </button>
      </div>
    </div>
  );
}