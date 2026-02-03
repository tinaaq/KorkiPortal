import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="navbar px-4 md:px-8 lg:px-16 bg-base-100 border-b border-base-300">
        <div className="flex-1">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-[#58B09C]">
            CzasNa<span className="text-base-content">Korki</span>
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          <Link
            to="/login"
            className="btn btn-sm md:btn-md rounded-lg bg-base-100 text-base-content border border-base-300 hover:bg-base-200"
          >
            Zaloguj się
          </Link>

          <Link
            to="/register"
            className="btn btn-sm md:btn-md rounded-lg bg-[#58B09C] hover:bg-[#4A957F] text-white border-none"
          >
            Załóż konto
          </Link>
        </div>
      </div>

      <main className="px-4 md:px-8 lg:px-16 py-10 md:py-16">
        <section className="grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#58B09C] text-xs md:text-sm text-[#58B09C]">
              Platforma do zarządzania korepetycjami
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              Twoje korepetycje
              <span className="block text-[#58B09C]">w jednym miejscu</span>
            </h1>

            <p className="text-sm md:text-base text-base-content/80 max-w-xl">
              Aplikacja dla korepetytorów i uczniów do umawiania zajęć, zarządzania kalendarzem,
              notatkami oraz fiszkami. Wszystko, czego potrzebujesz, żeby ogarnąć lekcje online i offline.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="btn rounded-lg bg-[#58B09C] hover:bg-[#4A957F] text-white border-none"
              >
                Zacznij teraz
              </Link>

              <Link
                to="/login"
                className="btn rounded-lg bg-base-100 text-base-content border border-base-300 hover:bg-base-200"
              >
                Mam już konto
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 text-xs md:text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-block h-3 w-3 rounded-full bg-[#58B09C]" />
                <div>
                  <p className="font-semibold">Dla korepetytora</p>
                  <p className="text-base-content/70">
                    Panel z kalendarzem, listą uczniów, notatkami i fiszkami.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 inline-block h-3 w-3 rounded-full bg-[#5D737E]" />
                <div>
                  <p className="font-semibold">Dla ucznia</p>
                  <p className="text-base-content/70">
                    Wyszukiwarka korepetytorów, rezerwacje zajęć i dostęp do fiszek.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="card bg-base-100 border border-base-300 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-base-content text-lg md:text-xl">
                  Jak działa platforma?
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2 text-xs md:text-sm">
                  <div className="p-3 rounded-xl bg-base-200 border border-base-300">
                    <p className="font-semibold mb-1 text">Korepetytor</p>
                    <p className="text-base-content/80">
                      Zarządzaj dostępnością, uczniami, notatkami i zestawami fiszek.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-base-200 border border-base-300">
                    <p className="font-semibold mb-1 text">Uczeń</p>
                    <p className="text-base-content/80">
                      Umawiaj zajęcia, wyszukuj korepetytorów i korzystaj z fiszek.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] md:text-xs">
                  <div className="badge badge-outline text-[#5D737E] font-bold">
                    Kalendarz dostępności
                  </div>
                  <div className="badge badge-outline text-[#5D737E] font-bold">
                    Rezerwacje online
                  </div>
                  <div className="badge badge-outline text-[#5D737E]  font-bold">
                    Notatki i fiszki
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 md:mt-20">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-base-content">
            Najważniejsze funkcjonalności
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Zarządzanie kalendarzem</h3>
                <p className="text-base-content/80">
                  Korepetytor ustawia cykliczną dostępność, nieobecności i widzi wszystkie zajęcia.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Rezerwacje zajęć</h3>
                <p className="text-base-content/80">
                  Uczeń wybiera termin według dostępności korepetytora.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h3 className="card-title">Fiszki i notatki</h3>
                <p className="text-base-content/80">
                  Korepetytor tworzy zestawy fiszek, przypisuje uczniom i prowadzi notatki.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 md:px-8 lg:px-16 py-6 border-t border-base-300 text-xs md:text-sm text-base-content/60 bg-base-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} czasNaKorki</span>
          <span className="text-[11px] md:text-xs">
            
          </span>
        </div>
      </footer>
    </div>
  );
}