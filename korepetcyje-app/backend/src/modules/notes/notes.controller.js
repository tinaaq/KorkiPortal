import prisma from '../../config/db.js';


export const createNote = async (req, res) => {
  try {
    const { studentId, content } = req.body;

    if (!studentId || !content) {
      return res.status(400).json({ error: 'Brak danych' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });
   
    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: Number(studentId) },
    });

    if (!student) {
      return res.status(404).json({ error: 'Nie znaleziono ucznia' });
    }

    const note = await prisma.note.create({
      data: {
        tutorId: tutor.id,
        studentId: Number(studentId),
        content,
      },
    });

    res.status(201).json(note);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const getNotesByStudent = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const notes = await prisma.note.findMany({
      where: {
        tutorId: tutor.id,
        studentId,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const updateNote = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Nie znaleziono notatki' });
    }

    const updated = await prisma.note.update({
      where: { id },
      data: { content },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const deleteNote = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Nie znaleziono notatki' });
    }

    await prisma.note.delete({ where: { id } });

    res.json({ success: true });
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
