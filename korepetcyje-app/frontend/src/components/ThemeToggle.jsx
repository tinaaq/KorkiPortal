import { useEffect, useState } from "react";

const LIGHT_THEME = "light";
const DARK_THEME = "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(LIGHT_THEME);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const initial = stored === DARK_THEME ? DARK_THEME : LIGHT_THEME;

    setTheme(initial);
    root.setAttribute("data-theme", initial);

    if (initial === DARK_THEME) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    setTheme(next);

    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    if (next === DARK_THEME) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle text-base-content"
      aria-label="Przełącz motyw"
    >
      {theme === DARK_THEME ? (
        // Słońce – przełącz na jasny
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="btn btn-ghost btn-circle text-current h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      ) : (
        // Księżyc – przełącz na ciemny
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="btn btn-ghost btn-circle text-current h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}