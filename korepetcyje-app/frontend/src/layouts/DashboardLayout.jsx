import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { useTutorProfile } from "../hooks/useTutorProfile";
import { isTutorProfileComplete } from "../services/profileService";

export default function DashboardLayout({ children }) {
  
  const { profile } = useTutorProfile();
  const incomplete = profile && !isTutorProfileComplete(profile);

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-base-200">
        <Navbar />

        <main className="p-4 md:p-6 flex-grow">         
          {incomplete && (
            <div className="alert alert-warning shadow-lg mb-4">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 stroke-current" 
                    fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.66 
                        1.73-3L13.73 4c-.77-1.34-2.69-1.34-3.46 
                        0L3.34 16c-.77 1.34.19 3 1.73 3z" />
                </svg>

                <span>
                  <strong>Uzupełnij wymagane elementy profilu</strong><br />
                  Aby uzyskać pełny dostęp do serwisu, wpisz:
                  <strong> Imię, Nazwisko, Tryb zajęć oraz co najmniej 1 przedmiot.</strong>
                </span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>

      <div className="drawer-side z-50">
        <label htmlFor="app-drawer" className="drawer-overlay"></label>
        <aside className="w-64 h-full bg-base-100 border-r border-base-300 shadow-xl">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}