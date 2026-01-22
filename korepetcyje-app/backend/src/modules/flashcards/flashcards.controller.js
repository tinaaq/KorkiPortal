import prisma from '../../config/db.js';

/* =========================
   CREATE FLASHCARD
========================= */
export const createFlashcard = async (req, res) => {
  try {
    const { front, back, setId } = req.body;

    if (!front || !back || !setId) {
    return res.status(400).json({ error: 'Brak danych' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const flashcard = await prisma.flashcard.create({
    data: {
        tutorId: tutor.id,
        setId: Number(setId),
        front,
        back,
    },
    });

    res.status(201).json(flashcard);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   GET MY FLASHCARDS (TUTOR)
========================= */
export const getMyFlashcards = async (req, res) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const cards = await prisma.flashcard.findMany({
      where: { tutorId: tutor.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   UPDATE FLASHCARD
========================= */
export const updateFlashcard = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { front, back } = req.body;

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const card = await prisma.flashcard.findUnique({ where: { id } });

    if (!card || card.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Nie znaleziono fiszki' });
    }

    const updated = await prisma.flashcard.update({
      where: { id },
      data: { front, back },
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   DELETE FLASHCARD
========================= */
export const deleteFlashcard = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const card = await prisma.flashcard.findUnique({ where: { id } });

    if (!card || card.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Nie znaleziono fiszki' });
    }

    await prisma.flashcard.delete({ where: { id } });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   ASSIGN FLASHCARD TO STUDENT
========================= */
export const assignFlashcard = async (req, res) => {
  try {
    const flashcardId = Number(req.params.id);
    const { studentId } = req.body;

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const card = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!card || card.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Brak fiszki' });
    }

    const assignment = await prisma.flashcardAssignment.create({
      data: {
        flashcardId,
        studentId: Number(studentId),
      },
    });

    res.status(201).json(assignment);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Już przypisane' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   GET STUDENT FLASHCARDS
========================= */
export const getStudentFlashcards = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const sets = await prisma.flashcardSetAssignment.findMany({
      where: { studentId: student.id },
      include: {
        set: {
          include: { flashcards: true },
        },
      },
    });

    const flashcards = sets.flatMap((s) => s.set.flashcards);

    res.json(flashcards);
  } catch {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const createSet = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Brak nazwy' });

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const set = await prisma.flashcardSet.create({
      data: {
        tutorId: tutor.id,
        name,
      },
    });

    res.status(201).json(set);
  } catch {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

export const getMySets = async (req, res) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const sets = await prisma.flashcardSet.findMany({
      where: { tutorId: tutor.id },
      include: { flashcards: true },
    });

    res.json(sets);
  } catch {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

export const assignSetToStudent = async (req, res) => {
  try {
    const setId = Number(req.params.id);
    const { studentId } = req.body;

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    const set = await prisma.flashcardSet.findUnique({ where: { id: setId } });

    if (!set || set.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Brak zestawu' });
    }

    const assignment = await prisma.flashcardSetAssignment.create({
      data: {
        setId,
        studentId: Number(studentId),
      },
    });

    res.status(201).json(assignment);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Już przypisany' });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
