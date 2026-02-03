import { useEffect, useState, useMemo } from 'react';
import { getTutorStudents } from '../../services/tutorStudentsService';
import  NotesModal from '../../components/NotesModal';

export default function TutorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTutorStudents();
        setStudents(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.error || 'Nie udało się pobrać listy uczniów'
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleRemoveFromView = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;

    const q = search.toLowerCase();
    return students.filter((s) => {
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (s.firstName || '').toLowerCase().includes(q) ||
        (s.lastName || '').toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

  
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#02111B] dark:text-[#F2F6FA]">
        Uczniowie
      </h1>
      <p className="text-sm text-[#5D737E]">
        Lista generowana automatycznie na podstawie odbytych zajęć.
      </p>
    </div>

 
    <div className="card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-sm">
      <div className="card-body p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[#5D737E]">
              Wyszukaj ucznia
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Imię lub nazwisko..."
              className="input w-full h-11 mt-1 rounded-md bg-[#FCFCFC] dark:bg-[#161D24] border border-[#E5E5E5] dark:border-[#3F4045] text-[#02111B] dark:text-[#F2F6FA] placeholder:text-[#5D737E] focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
            />
          </div>

          <p className="text-xs text-[#5D737E] max-w-sm">
            Uczniowie pojawiają się tu po pierwszych zajęciach.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-[#E15B64] bg-[#F2F2F2] dark:bg-[#161D24] p-3 text-sm text-[#E15B64]">
            {error}
          </div>
        )}
      </div>
    </div>

   
    {loading ? (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    ) : filteredStudents.length === 0 ? (
      <div className="rounded-lg border border-dashed border-[#E5E5E5] dark:border-[#3F4045] p-6">
        <p className="text-sm text-[#5D737E]">
          {students.length === 0
            ? 'Nie masz jeszcze żadnych uczniów.'
            : 'Brak wyników dla podanych kryteriów.'}
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();

          return (
            <div
              key={student.id}
              className="relative card rounded-lg border border-[#E5E5E5] dark:border-[#3F4045] bg-[#FCFCFC] dark:bg-[#1A232B] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)] p-5"
            >
             
              <button
                type="button"
                aria-label="Usuń z listy"
                onClick={() => handleRemoveFromView(student.id)}
                className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-md
                           border border-[#E15B64] text-[#E15B64]
                           hover:bg-[#F2F2F2] dark:hover:bg-[#161D24]
                           focus:outline-none focus:ring-2 focus:ring-[#E15B64]"
                title="Usuń z listy"
              >
                ✕
              </button>

              <div className="space-y-3 pr-10">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-[#02111B] dark:text-[#F2F6FA]">
                    {fullName || 'Uczeń'}
                  </h2>

                  {student.grade && (
                    <span
                      className="badge rounded-md px-2 py-2 text-[11px]
                                 border border-[#58B09C] text-[#58B09C] bg-[#58B09C]/10
                                 max-w-[50%] truncate"
                    >
                      Klasa {student.grade}
                    </span>
                  )}
                </div>

              
                <div className="space-y-1 text-sm">
                  {student.email && (
                    <p className="text-[#02111B] dark:text-[#F2F6FA]">
                      <span className="font-medium">Email:</span>{' '}
                      <span className="text-[#5D737E]">{student.email}</span>
                    </p>
                  )}

                  {(student.city || student.address) && (
                    <p className="text-[#02111B] dark:text-[#F2F6FA]">
                      <span className="font-medium">Miasto:</span>{' '}
                      <span className="text-[#5D737E]">
                        {[student.city, student.address].filter(Boolean).join(', ')}
                      </span>
                    </p>
                  )}
                </div>

           
                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(student);
                      setNotesOpen(true);
                    }}
                    className="btn btn-sm h-9 rounded-md px-3
                               bg-[#58B09C] hover:bg-[#4FA893] text-white
                               focus:outline-none focus:ring-2 focus:ring-[#58B09C]"
                  >
                    Notatki
                  </button>

               
                  <div />
                </div>

           
                <NotesModal
                  open={notesOpen}
                  student={selectedStudent}
                  onClose={() => setNotesOpen(false)}
                />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}
