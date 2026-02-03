import StudentDashboardTutorsSection from '../../components/StudentDashboardTutorsSection';

export default function StudentDashboard() {
return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
        Czas na nauke?
      </h1>
      <p className="text-sm text-[#5D737E]">
        Szybkie skróty do korepetytorów, zajęć i fiszek.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-shadow">
        <div className="card-body p-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Korepetytorzy</h2>
          <p className="text-sm text-[#5D737E]">
            Przejdź do wyszukiwarki i znajdź nauczyciela.
          </p>
          <div className="pt-2">
            <a
              href="/student/tutors"
              className="btn h-10 w-full md:w-auto rounded-md px-4 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            >
              Otwórz wyszukiwarkę
            </a>
          </div>
        </div>
      </div>

      <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-shadow">
        <div className="card-body p-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Moje zajęcia</h2>
          <p className="text-sm text-[#5D737E]">
            Sprawdź nadchodzące terminy w kalendarzu.
          </p>
          <div className="pt-2">
            <a
              href="/student/calendar"
              className="btn h-10 w-full md:w-auto rounded-md px-4 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            >
              Przejdź do kalendarza
            </a>
          </div>
        </div>
      </div>

      <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-shadow">
        <div className="card-body p-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Moje fiszki</h2>
          <p className="text-sm text-[#5D737E]">
            Ucz się z przypisanych zestawów.
          </p>
          <div className="pt-2">
            <a
              href="/student/flashcards"
              className="btn h-10 w-full md:w-auto rounded-md px-4 bg-[#5D737E] hover:bg-[#4C5E68] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            >
              Otwórz fiszki
            </a>
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 sm:p-5">
      <StudentDashboardTutorsSection />
    </div>
  </div>
);
}