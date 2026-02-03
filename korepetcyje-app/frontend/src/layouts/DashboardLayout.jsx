import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-base-200">
        <Navbar />

        <main className="p-4 md:p-6 flex-grow">
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