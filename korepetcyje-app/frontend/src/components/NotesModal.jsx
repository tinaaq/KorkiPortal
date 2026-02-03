import { useEffect, useState } from 'react';
import {
  getNotesByStudent,
  createNote,
  updateNote,
  deleteNote,
} from '../services/notesService';

export default function NotesModal({ student, open, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!student || !open) return;

    const load = async () => {
      setLoading(true);
      const res = await getNotesByStudent(student.id);
      setNotes(res.data || []);
      setLoading(false);
    };

    load();
  }, [student, open]);

  const handleSave = async () => {
    if (!content.trim()) return;

    if (editingId) {
      // update
      const res = await updateNote(editingId, { content });
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? res.data : n))
      );
    } else {
      // create
      const res = await createNote({
        studentId: student.id,
        content,
      });
      setNotes((prev) => [res.data, ...prev]);
    }

    setContent('');
    setEditingId(null);
  };

  const handleEdit = (note) => {
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Usunąć notatkę?')) return;

    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl mb-3">
          Notatki — {student.firstName} {student.lastName}
        </h3>

        {/* Lista notatek */}
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner" />
          </div>
        ) : notes.length === 0 ? (
          <p className="opacity-70 text-sm mb-3">Brak notatek.</p>
        ) : (
          <ul className="space-y-3 mb-4 max-h-60 overflow-auto pr-1">
            {notes.map((note) => (
              <li
                key={note.id}
                className="border rounded-lg p-3 bg-base-200 flex justify-between gap-3"
              >
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => handleEdit(note)}
                  >
                    Edytuj
                  </button>
                  <button
                    className="btn btn-xs btn-error btn-outline"
                    onClick={() => handleDelete(note.id)}
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Dodawanie/edycja */}
        <textarea
          className="textarea textarea-bordered w-full mb-2"
          rows={3}
          placeholder="Dodaj notatkę..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <div className="modal-action">
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Zapisz zmiany' : 'Dodaj notatkę'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
