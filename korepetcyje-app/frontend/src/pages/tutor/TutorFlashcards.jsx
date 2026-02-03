import React, { useEffect, useState } from 'react';
import flashcardsService from '../../services/flashcardsService';
import { getTutorStudents } from '../../services/tutorStudentsService';

function TutorFlashcards() {
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newSetName, setNewSetName] = useState('');

  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  const [editingCardId, setEditingCardId] = useState(null);
  const [editingFront, setEditingFront] = useState('');
  const [editingBack, setEditingBack] = useState('');

  const [assignMessage, setAssignMessage] = useState(null);

  const [editingSetId, setEditingSetId] = useState(null);
  const [editingSetName, setEditingSetName] = useState('');

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [assignedStudents, setAssignedStudents] = useState([]);
  const [assignedStudentsLoading, setAssignedStudentsLoading] = useState(false);

  const selectedSet = sets.find((s) => s.id === selectedSetId) || null;

  const loadSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await flashcardsService.getMySets();
      setSets(data);
      if (!selectedSetId && data.length > 0) {
        setSelectedSetId(data[0].id);
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się pobrać zestawów');
    } finally {
      setLoading(false);
    }
  };

  const loadTutorStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await getTutorStudents();
      setStudents(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadSetStudents = async (setId) => {
    if (!setId) {
      setAssignedStudents([]);
      return;
    }
    try {
      setAssignedStudentsLoading(true);
      const data = await flashcardsService.getSetStudents(setId);
      setAssignedStudents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAssignedStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
    loadTutorStudents();
  }, []);

  useEffect(() => {
    if (selectedSetId) {
      loadSetStudents(selectedSetId);
      setSelectedStudentIds([]);
      setEditingSetId(null);
    }
  }, [selectedSetId]);

  const handleCreateSet = async (e) => {
    e.preventDefault();
    if (!newSetName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const created = await flashcardsService.createSet(newSetName.trim());
      setSets((prev) => [created, ...prev]);
      setNewSetName('');
      setSelectedSetId(created.id);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się utworzyć zestawu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!selectedSet) return;
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const created = await flashcardsService.createFlashcard(
        selectedSet.id,
        newCardFront.trim(),
        newCardBack.trim()
      );
      setSets((prev) =>
        prev.map((set) =>
          set.id === selectedSet.id
            ? { ...set, flashcards: [created, ...(set.flashcards || [])] }
            : set
        )
      );
      setNewCardFront('');
      setNewCardBack('');
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się utworzyć fiszki');
    } finally {
      setLoading(false);
    }
  };

  const startEditCard = (card) => {
    setEditingCardId(card.id);
    setEditingFront(card.front);
    setEditingBack(card.back);
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditingFront('');
    setEditingBack('');
  };

  const saveEditCard = async (cardId) => {
    if (!editingFront.trim() || !editingBack.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const updated = await flashcardsService.updateFlashcard(
        cardId,
        editingFront.trim(),
        editingBack.trim()
      );

      setSets((prev) =>
        prev.map((set) => ({
          ...set,
          flashcards: (set.flashcards || []).map((c) =>
            c.id === cardId ? updated : c
          ),
        }))
      );

      cancelEditCard();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się zaktualizować fiszki');
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId) => {
    if (!selectedSet) return;
    if (!window.confirm('Na pewno usunąć tę fiszkę?')) return;

    try {
      setLoading(true);
      setError(null);
      await flashcardsService.deleteFlashcard(cardId);

      setSets((prev) =>
        prev.map((set) =>
          set.id === selectedSet.id
            ? {
                ...set,
                flashcards: (set.flashcards || []).filter(
                  (c) => c.id !== cardId
                ),
              }
            : set
        )
      );
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się usunąć fiszki');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignSetToSelected = async (e) => {
    e.preventDefault();
    if (!selectedSet) return;
    if (selectedStudentIds.length === 0) return;

    try {
      setError(null);
      setAssignMessage(null);

      for (const studentId of selectedStudentIds) {
        try {
          await flashcardsService.assignSetToStudent(selectedSet.id, studentId);
        } catch (inner) {
          if (inner?.response?.status !== 409) {
            console.error(inner);
          }
        }
      }

      setAssignMessage(
        `Zestaw przypisany do ${selectedStudentIds.length} ucznia/uczniów`
      );
      setSelectedStudentIds([]);
      await loadSetStudents(selectedSet.id);
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error || 'Nie udało się przypisać zestawu';
      setError(msg);
      setAssignMessage(null);
    }
  };

  const handleUnassign = async (studentId) => {
    if (!selectedSet) return;
    if (!window.confirm('Odebrać dostęp do zestawu temu uczniowi?')) return;

    try {
      setError(null);
      await flashcardsService.unassignSetFromStudent(selectedSet.id, studentId);
      await loadSetStudents(selectedSet.id);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się odebrać dostępu');
    }
  };

  const handleDeleteSet = async () => {
    if (!selectedSet) return;
    if (
      !window.confirm(
        `Na pewno usunąć zestaw "${selectedSet.name}" wraz z fiszkami i przypisaniami?`
      )
    ) {
      return;
    }

    try {
      setError(null);
      setAssignMessage(null);
      setLoading(true);

      await flashcardsService.deleteSet(selectedSet.id);

      setSets((prev) => {
        const filtered = prev.filter((s) => s.id !== selectedSet.id);
        if (filtered.length === 0) {
          setSelectedSetId(null);
        } else {
          setSelectedSetId(filtered[0].id);
        }
        return filtered;
      });

      setAssignedStudents([]);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się usunąć zestawu');
    } finally {
      setLoading(false);
    }
  };


  const startEditSetName = () => {
    if (!selectedSet) return;
    setEditingSetId(selectedSet.id);
    setEditingSetName(selectedSet.name);
  };

  const cancelEditSetName = () => {
    setEditingSetId(null);
    setEditingSetName('');
  };

  const saveEditSetName = async () => {
    if (!selectedSet) return;
    if (!editingSetName.trim()) return;

    try {
      setError(null);
      const updated = await flashcardsService.updateSet(
        selectedSet.id,
        editingSetName.trim()
      );

      setSets((prev) =>
        prev.map((set) =>
          set.id === selectedSet.id ? { ...set, name: updated.name } : set
        )
      );

      setEditingSetId(null);
      setEditingSetName('');
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Nie udało się zaktualizować nazwy zestawu');
    }
  };

  return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
        Fiszki – zestawy
      </h1>
      <p className="text-sm text-[#5D737E]">
        Twórz zestawy, dodawaj fiszki i przypisuj je uczniom.
      </p>
    </div>


    {error && (
      <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64] max-w-2xl">
        {error}
      </div>
    )}
    {assignMessage && (
      <div className="rounded-md border border-[#58B09C] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#58B09C] max-w-2xl">
        {assignMessage}
      </div>
    )}

  
    <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
   
      <div className="space-y-4">
   
        <form
          onSubmit={handleCreateSet}
          className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        >
          <h2 className="text-base font-semibold text-[#02111B] dark:text-[#F2F6FA] mb-2">
            Nowy zestaw
          </h2>
          <input
            type="text"
            placeholder="Nazwa zestawu"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            className="input w-full h-11 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045]
                       text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E]
                       focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
          />
          <button
            type="submit"
            className="btn w-full h-10 mt-3 rounded-md bg-[#58B09C] hover:bg-[#4FA893] text-white
                       focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
            disabled={loading || !newSetName.trim()}
          >
            {loading ? 'Dodawanie...' : 'Dodaj zestaw'}
          </button>
        </form>

    
        <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="text-base font-semibold text-[#02111B] dark:text-[#F2F6FA] mb-2">Moje zestawy</h2>
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
            {sets.length === 0 && (
              <span className="text-sm text-[#5D737E]">Brak zestawów</span>
            )}
            {sets.map((set) => {
              const active = selectedSetId === set.id;
              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setSelectedSetId(set.id)}
                  className={[
                    "btn h-10 justify-between rounded-md px-3 transition-colors",
                    active
                      ? "bg-[#58B09C] hover:bg-[#4FA893] text-white border border-[#58B09C]"
                      : "bg-transparent border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]"
                  ].join(" ")}
                > 
                  <span className="truncate text-left">{set.name}</span>
                  <span className={active
                    ? "badge rounded-md border border-white/40 text-[#5D737E] px-2 py-1 text-[11px]"
                    : "badge rounded-md border border-[#E5E5E5] dark:border-[#3F4045] text-[#5D737E] px-2 py-1 text-[11px]"}
                  >
                   {set.flashcards?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

   
      <div className="space-y-4">
        {selectedSet ? (
          <>
     
            <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {editingSetId === selectedSet.id ? (
                    <>
                      <input
                        type="text"
                        value={editingSetName}
                        onChange={(e) => setEditingSetName(e.target.value)}
                        className="input h-10 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045]
                                   text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                      />
                      <button
                        type="button"
                        onClick={saveEditSetName}
                        className="btn h-10 rounded-md px-3 bg-[#58B09C] hover:bg-[#4FA893] text-white focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                      >
                        Zapisz
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditSetName}
                        className="btn h-10 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                                   text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                      >
                        Anuluj
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
                        Zestaw: <span className="font-bold">{selectedSet.name}</span>
                      </h2>
                      <button
                        type="button"
                        onClick={startEditSetName}
                        className="btn h-10 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                                   text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                      >
                        Edytuj nazwę
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge rounded-md border border-[#E5E5E5] dark:border-[#3F4045] text-[#5D737E] px-2 py-1 text-[11px]">
                   Liczba fiszek w zestawie: {selectedSet.flashcards?.length || 0}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSet}
                    className="btn h-10 rounded-md px-3 border border-[#E15B64] text-[#E15B64] bg-transparent
                               hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#E15B64]"
                  >
                    Usuń zestaw
                  </button>
                </div>
              </div>
            </div>

     
            <form
              onSubmit={handleAssignSetToSelected}
              className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#02111B] dark:text-[#F2F6FA]">
                  Przypisz zestaw do uczniów
                </h3>
                {studentsLoading && <span className="loading loading-spinner loading-xs" />}
              </div>

              {students.length === 0 ? (
                <span className="text-sm text-[#5D737E]">Nie masz jeszcze żadnych uczniów z rezerwacji.</span>
              ) : (
                <div className="max-h-40 overflow-y-auto rounded-md border border-[#E5E5E5] dark:border-[#3F4045] p-2 flex flex-col gap-2">
                  {students.map((s) => {
                    const label = `${s.firstName} ${s.lastName}${s.grade ? ` • klasa ${s.grade}` : ''}${s.city ? ` • ${s.city}` : ''}`;
                    const checked = selectedStudentIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudentSelection(s.id)}
                          className="checkbox checkbox-xs border border-[#E5E5E5] dark:border-[#3F4045]"
                        />
                        <span className="text-[#02111B] dark:text-[#F2F6FA]">{label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={selectedStudentIds.length === 0}
                  className="btn h-10 rounded-md px-4 bg-[#5D737E] hover:bg-[#4C5E68] text-white
                             focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
                >
                  Przypisz do zaznaczonych ({selectedStudentIds.length})
                </button>
              </div>
            </form>

            <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#02111B] dark:text-[#F2F6FA]">Uczniowie z dostępem</h3>
                {assignedStudentsLoading && <span className="loading loading-spinner loading-xs" />}
              </div>

              {assignedStudents.length === 0 ? (
                <span className="text-sm text-[#5D737E]">Brak uczniów przypisanych do tego zestawu.</span>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {assignedStudents.map((s) => (
                    <div
                      key={s.studentId}
                      className="flex items-center justify-between text-sm rounded-md border border-[#E5E5E5] dark:border-[#3F4045] px-2 py-1"
                    >
                      <div>
                        <div className="font-medium text-[#02111B] dark:text-[#F2F6FA]">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-xs text-[#5D737E]">
                       
                          {s.city ? ` • ${s.city}` : ''}
                          {s.grade ? ` • klasa ${s.grade}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnassign(s.studentId)}
                        className="btn btn-xs h-8 rounded-md px-3 border border-[#E15B64] text-[#E15B64] bg-transparent
                                   hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#E15B64]"
                      >
                        Odbierz
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleCreateCard}
              className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] space-y-2"
            >
              <h3 className="text-sm font-semibold text-[#02111B] dark:text-[#F2F6FA]">Nowa fiszka</h3>
              <textarea
                placeholder="Przód (pytanie / słowo)"
                value={newCardFront}
                onChange={(e) => setNewCardFront(e.target.value)}
                className="textarea w-full min-h-[84px] rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045]
                           text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E]
                           focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              />
              <textarea
                placeholder="Tył (odpowiedź / tłumaczenie)"
                value={newCardBack}
                onChange={(e) => setNewCardBack(e.target.value)}
                className="textarea w-full min-h-[84px] rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045]
                           text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E]
                           focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !newCardFront.trim() || !newCardBack.trim()}
                  className="btn h-10 rounded-md px-4 bg-[#58B09C] hover:bg-[#4FA893] text-white
                             focus:outline-none focus:ring-2 focus:ring-[#58B09C] disabled:opacity-60"
                >
                  {loading ? 'Dodawanie...' : 'Dodaj fiszkę'}
                </button>
              </div>
            </form>

          
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {(!selectedSet.flashcards || selectedSet.flashcards.length === 0) && (
                <span className="text-sm text-[#5D737E]">Brak fiszek w tym zestawie</span>
              )}

              {selectedSet.flashcards && selectedSet.flashcards.map((card) => (
                <div key={card.id} className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <div className="p-4 space-y-2">
                    {editingCardId === card.id ? (
                      <>
                        <textarea
                          value={editingFront}
                          onChange={(e) => setEditingFront(e.target.value)}
                          className="textarea textarea-xs w-full min-h-[64px] rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                        />
                        <textarea
                          value={editingBack}
                          onChange={(e) => setEditingBack(e.target.value)}
                          className="textarea textarea-xs w-full min-h-[64px] rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditCard}
                            className="btn btn-xs h-8 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                                       text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                                       focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                          >
                            Anuluj
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditCard(card.id)}
                            className="btn btn-xs h-8 rounded-md px-3 bg-[#58B09C] hover:bg-[#4FA893] text-white
                                       focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                          >
                            Zapisz
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-[11px] uppercase text-[#5D737E]">Przód</div>
                          <div className="text-sm whitespace-pre-wrap text-[#02111B] dark:text-[#F2F6FA]">{card.front}</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase text-[#5D737E]">Tył</div>
                          <div className="text-sm whitespace-pre-wrap text-[#02111B] dark:text-[#F2F6FA]">{card.back}</div>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button
                            type="button"
                            onClick={() => startEditCard(card)}
                            className="btn btn-xs h-8 rounded-md px-3 bg-transparent border border-[#E5E5E5] dark:border-[#3F4045]
                                       text-[#02111B] dark:text-[#F2F6FA] hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                                       focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                          >
                            Edytuj
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCard(card.id)}
                            className="btn btn-xs h-8 rounded-md px-3 border border-[#E15B64] text-[#E15B64] bg-transparent
                                       hover:bg-[#F2F2F2] dark:hover:bg-[#161D24] focus:outline-none focus:ring-2 focus:ring-[#E15B64]"
                          >
                            Usuń
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] p-6 text-sm text-[#5D737E]">
            Wybierz zestaw po lewej lub dodaj nowy.
          </div>
        )}
      </div>
    </div>
  </div>
);
}

export default TutorFlashcards;