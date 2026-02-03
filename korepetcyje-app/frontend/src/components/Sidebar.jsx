import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#58B09C] bg-[#58B09C] text-white font-semibold"
      : "rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#58B09C] text-[#3F4045] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]";

  return (

    <ul className="menu p-4 w-64 h-full bg-[#FCFCFC] dark:bg-[#1A232B] text-[#02111B] dark:text-[#F2F6FA] gap-1">
      <li className="menu-title text-xs font-medium tracking-wide text-[#5D737E] dark:text-[#F2F6FA]/70">
        Panel
      </li>


      {user?.role === "TUTOR" && (
        <>
          <li>
            <Link className={isActive("/tutor")} to="/tutor">Panel główny</Link>
          </li>

          <li>
            <Link className={isActive("/tutor/profile")} to="/tutor/profile">Profil</Link>
          </li>

          <li>
            <Link className={isActive("/tutor/calendar")} to="/tutor/calendar">Kalendarz</Link>
          </li>

          <li>
            <Link className={isActive("/tutor/students")} to="/tutor/students">Uczniowie</Link>
          </li>

          <li>
            <Link className={isActive("/tutor/flashcards")} to="/tutor/flashcards">Fiszki</Link>
          </li>
        </>
      )}

      {user?.role === "STUDENT" && (
        <>
          <li>
            <Link className={isActive("/student")} to="/student">Panel główny</Link>
          </li>

          <li>
            <Link className={isActive("/student/profile")} to="/student/profile">Profil</Link>
          </li>

          <li>
            <Link className={isActive("/student/tutors")} to="/student/tutors">Korepetytorzy - szukaj</Link>
          </li>

          <li>
            <Link className={isActive("/student/calendar")} to="/student/calendar">Kalendarz zajęć</Link>
          </li>

          <li>
            <Link className={isActive("/student/flashcards")} to="/student/flashcards">Moje fiszki</Link>
          </li>
        </>
      )}
    </ul>
  );
}
``