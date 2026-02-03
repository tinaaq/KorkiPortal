import React, { useEffect, useMemo, useState } from 'react';
import flashcardsService from '../../services/flashcardsService';

function StudentFlashcards() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');

  const [selectedSetId, setSelectedSetId] = useState(null);
  const [learningCards, setLearningCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);  

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await flashcardsService.getStudentFlashcardSets();
        setSets(data || []);
        if (data && data.length > 0) {
          setSelectedSetId(data[0].id);
        }
      } catch (e) {
        console.error(e);
        setError(
          e?.response?.data?.error || 'Nie udało się pobrać fiszek ucznia'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredSets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sets;

    return sets.map((set) => {
      const cards = (set.flashcards || []).filter(
        (c) =>
          c.front.toLowerCase().includes(q) ||
          c.back.toLowerCase().includes(q)
      );
      return { ...set, flashcards: cards };
    });
  }, [sets, search]);

  const hasAnyCards = filteredSets.some(
    (s) => s.flashcards && s.flashcards.length > 0
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const selectedSet = useMemo(
    () => sets.find((s) => s.id === selectedSetId) || null,
    [sets, selectedSetId]
  );

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    if (selectedSet && selectedSet.flashcards && selectedSet.flashcards.length) {
      const shuffled = shuffleArray(selectedSet.flashcards);
      setLearningCards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setLearningCards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [selectedSetId, sets]); 

  const currentCard =
    learningCards.length > 0 ? learningCards[currentIndex] : null;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (learningCards.length === 0) return;
    setCurrentIndex((prev) =>
      prev + 1 < learningCards.length ? prev + 1 : 0
    );
    setIsFlipped(false);
  };

  const handlePrev = () => {
    if (learningCards.length === 0) return;
    setCurrentIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : learningCards.length - 1
    );
    setIsFlipped(false);
  };

  const handleRandom = () => {
    if (learningCards.length === 0) return;
    if (learningCards.length === 1) return;

    let rand = currentIndex;
    while (rand === currentIndex) {
      rand = Math.floor(Math.random() * learningCards.length);
    }
    setCurrentIndex(rand);
    setIsFlipped(false);
  };

  const handleReshuffle = () => {
    if (!selectedSet || !selectedSet.flashcards?.length) return;
    const shuffled = shuffleArray(selectedSet.flashcards);
    setLearningCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

    const paginate = (items) => {
      const start = (currentPage - 1) * itemsPerPage;
      return items.slice(start, start + itemsPerPage);
    };

return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
          Moje fiszki
        </h1>
        <p className="text-sm text-[#5D737E]">
          Przyswajaj wiedzę dzięki fiszkom. Wybierz zestaw, odwracaj karty, losuj fiszkę.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-md border border-[#E5E5E5] dark:border-[#3F4045] px-2 py-1 text-[#5D737E]">
          Zestawy: <span className="text-[#02111B] dark:text-[#F2F6FA]">{sets.length}</span>
        </span>
        <span className="rounded-md border border-[#E5E5E5] dark:border-[#3F4045] px-2 py-1 text-[#5D737E]">
          Fiszki w wybranym:{" "}
          <span className="text-[#02111B] dark:text-[#F2F6FA]">
            {selectedSet?.flashcards?.length || 0}
          </span>
        </span>
      </div>
    </div>


    <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-5 sm:p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">Tryb nauki</h2>
          <p className="text-xs text-[#5D737E]">Kliknij kartę, aby odwrócić. Przetasuj karty by zacząć od początku.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">

          <select
            className="select h-10 w-full md:w-64 rounded-md bg-[#FCFCFC] dark:bg-[#161D24]
                       border border-[#E5E5E5] dark:border-[#3F4045]
                       text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            value={selectedSetId || ""}
            onChange={(e) => setSelectedSetId(e.target.value ? Number(e.target.value) : null)}
          >
            {sets.length === 0 && <option value="">Brak zestawów</option>}
            {sets.length > 0 && !selectedSetId && <option value="">Wybierz zestaw…</option>}
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name || `Zestaw #${set.id}`} ({set.flashcards?.length || 0})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReshuffle}
            disabled={!selectedSet || !selectedSet.flashcards?.length}
            className="btn h-10 rounded-md px-4 bg-transparent
                       border border-[#E5E5E5] dark:border-[#3F4045]
                       text-[#02111B] dark:text-[#F2F6FA]
                       hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                       focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
          >
            Przetasuj
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-[#E5E5E5] dark:bg-[#3F4045] overflow-hidden">
          <div
            className="h-2 bg-[#58B09C] transition-all"
            style={{
              width:
                learningCards.length > 0
                  ? `${((currentIndex + 1) / learningCards.length) * 100}%`
                  : "0%",
            }}
          />
        </div>
        <span className="text-xs text-[#5D737E]">
          {learningCards.length > 0 ? `${currentIndex + 1}/${learningCards.length}` : "0/0"}
        </span>
      </div>

      {(!selectedSet || !selectedSet.flashcards?.length) && (
        <span className="text-sm text-[#5D737E]">
          Nie masz fiszek w wybranym zestawie. Poproś korepetytora o przypisanie zestawu.
        </span>
      )}

      {selectedSet && selectedSet.flashcards?.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full md:w-[520px] h-[260px] cursor-pointer select-none"
            onClick={handleFlip}
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative h-full w-full rounded-lg border border-[#E5E5E5] dark:border-[#3F4045]
                         bg-[#FCFCFC] dark:bg-[#1A232B] transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-[11px] uppercase text-[#5D737E]">Przód</div>
                <div className="text-lg font-medium whitespace-pre-wrap text-[#02111B] dark:text-[#F2F6FA]">
                  {currentCard?.front}
                </div>
                <div className="text-xs text-[#5D737E]">
                  Karta {currentIndex + 1} z {learningCards.length}
                </div>
              </div>

              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center rotate-y-180"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-[11px] uppercase text-[#5D737E]">Tył</div>
                <div className="text-lg font-medium whitespace-pre-wrap text-[#02111B] dark:text-[#F2F6FA]">
                  {currentCard?.back}
                </div>
                <div className="text-xs text-[#5D737E]">
                  Karta {currentIndex + 1} z {learningCards.length}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="btn h-10 rounded-md px-4 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                         text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                         focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              onClick={handlePrev}
              disabled={learningCards.length === 0}
            >
              ← Poprzednia
            </button>

            <button
              type="button"
              className="btn h-10 rounded-md px-5 bg-[#58B09C] hover:bg-[#4FA893] text-white
                         focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
              onClick={handleFlip}
              disabled={learningCards.length === 0}
            >
              Odwróć
            </button>

            <button
              type="button"
              className="btn h-10 rounded-md px-4 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                         text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                         focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              onClick={handleNext}
              disabled={learningCards.length === 0}
            >
              Następna →
            </button>

            <button
              type="button"
              className="btn h-10 rounded-md px-4 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                         text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                         focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              onClick={handleRandom}
              disabled={learningCards.length === 0}
            >
              Losowa
            </button>
          </div>

        </div>
      )}
    </div>

    <div className="space-y-5">
      {!loading && !hasAnyCards && (
        <div className="rounded-md border border-dashed border-[#E5E5E5] dark:border-[#3F4045] p-6 text-sm text-[#5D737E]">
          Nie masz jeszcze żadnych fiszek przypisanych przez korepetytora.
        </div>
      )}

    <div className="max-w-xl">
      <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">
        Szukaj w treści fiszek
      </label>
      <div className="relative mt-1">
        <input
          type="text"
          className="input w-full h-11 pl-9 rounded-md bg-[#FCFCFC] dark:bg-[#161D24]
                     border border-[#E5E5E5] dark:border-[#3F4045]
                     text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E]
                     focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
          placeholder="np. ułamek, hormon wzrostu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[#5D737E]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    {error && (
      <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64] max-w-2xl">
        {error}
      </div>
    )}
    {loading && <span className="loading loading-spinner loading-md" />}

      {filteredSets.map((set) =>
        !set.flashcards || set.flashcards.length === 0 ? null : (
          <div key={set.id} className="space-y-3">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
                {set.name || `Zestaw #${set.id}`}
              </h2>
              <span className="badge rounded-md px-2 py-1 text-[11px] border border-[#E5E5E5] dark:border-[#3F4045] text-[#5D737E]">
                {set.flashcards.length} fiszek
              </span>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {paginate(set.flashcards).map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045]
                             bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >
                  <div className="p-4 space-y-2">
                    <div>
                      <div className="text-[11px] uppercase text-[#5D737E]">Przód</div>
                      <div className="text-sm whitespace-pre-wrap text-[#02111B] dark:text-[#F2F6FA]">
                        {card.front}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase text-[#5D737E]">Tył</div>
                      <div className="text-sm whitespace-pre-wrap text-[#02111B] dark:text-[#F2F6FA]">
                        {card.back}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
 
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5D737E]">Na stronę:</span>
                <select
                  className="select h-8 w-[72px] rounded-md bg-[#FCFCFC] dark:bg-[#161D24]
                             border border-[#E5E5E5] dark:border-[#3F4045]
                             text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[6, 12, 24, 48].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

          
              <div className="flex items-center gap-1">
                <button
                  className="btn h-8 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                             text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                             focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ←
                </button>

                {Array.from({ length: Math.ceil(set.flashcards.length / itemsPerPage) }).map((_, i) => (
                  <button
                    key={i}
                    className={[
                      "btn h-8 w-8 rounded-md",
                      currentPage === i + 1
                        ? "bg-[#58B09C] hover:bg-[#4FA893] text-white border border-[#58B09C]"
                        : "bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]"
                    ].join(" ")}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn h-8 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                             text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                             focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                  disabled={currentPage >= Math.ceil(set.flashcards.length / itemsPerPage)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  </div>
);
}

export default StudentFlashcards;