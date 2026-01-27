import prisma from '../../config/db.js';

const isValidString = (value, max = 500) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

const isValidId = (value) =>
  !isNaN(Number(value)) && Number(value) > 0;


export const createFlashcard = async (req, res) => {
  try {
    const { front, back, setId } = req.body;


    if (!isValidId(setId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID zestawu' });
    }

    if (!isValidString(front, 500) || !isValidString(back, 500)) {
      return res.status(400).json({ error: 'front/back muszą być tekstem 1–500 znaków' });
    }


    if (!front || !back || !setId) {
    return res.status(400).json({ error: 'Brak danych' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    // sprawdź czy zestaw należy do korepetytora
    const set = await prisma.flashcardSet.findUnique({
      where: { id: Number(setId) },
    });

    if (!set || set.tutorId !== tutor.id) {
      return res.status(403).json({ error: 'Brak dostępu do tego zestawu' });
    }

    const card = await prisma.flashcard.create({
    data: {
        setId: Number(setId),
        front,
        back,
    },
    });

    res.status(201).json(card);
  } catch (e) {
    console.error('Error createFlashcard', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const getMyFlashcards = async (req, res) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const cards = await prisma.flashcard.findMany({
      where: { set: { tutorId: tutor.id }, },
      orderBy: { createdAt: 'desc' },
    });

    res.json(cards);
  } catch (e) {
    console.error('Error getMyFlashcards', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

export const updateFlashcard = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID fiszki' });
    }

    const { front, back } = req.body;

    if (!front || !back) { return res.status(400).json({ error: "Brak danych" }); }

    if (!isValidString(front) || !isValidString(back)) {
      return res.status(400).json({ error: 'front/back muszą być tekstem 1–500 znaków' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) return res.status(404).json({ error: 'Brak profilu tutora' });

    const card = await prisma.flashcard.findUnique({ where: { id: Number(id) }, include: {set: true}, });

    if (!card || card.set.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Nie znaleziono fiszki' });
    }

    const updated = await prisma.flashcard.update({
      where: { id: Number(id) },
      data: { front, back },
    });

    res.json(updated);
  } catch (e) {
    console.error('Error updateFlashcard',e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const deleteFlashcard = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID fiszki' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) return res.status(404).json({ error: 'Brak profilu tutora' });

    const card = await prisma.flashcard.findUnique({ where: { id }, include: {set: true}, });

    if (!card || card.set.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Nie znaleziono fiszki' });
    }

    await prisma.flashcard.delete({ where: { id: Number(id) } });

    res.json({ success: true });
  } catch (e) {
    console.error('Error deleteFlashcard', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// export const assignFlashcard = async (req, res) => {
//   try {
//     const flashcardId = Number(req.params.id);
//     const { studentId } = req.body;

//     const tutor = await prisma.tutorProfile.findUnique({
//       where: { userId: req.user.id },
//     });

//     const card = await prisma.flashcard.findUnique({
//       where: { id: flashcardId },
//     });

//     if (!card || card.tutorId !== tutor.id) {
//       return res.status(404).json({ error: 'Brak fiszki' });
//     }

//     const assignment = await prisma.flashcardAssignment.create({
//       data: {
//         flashcardId,
//         studentId: Number(studentId),
//       },
//     });

//     res.status(201).json(assignment);
//   } catch (e) {
//     if (e.code === 'P2002') {
//       return res.status(409).json({ error: 'Już przypisane' });
//     }
//     res.status(500).json({ error: 'Błąd serwera' });
//   }
// };


export const getStudentFlashcards = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Brak profilu ucznia' });
    }

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
  } catch (e) {
    console.error('Error getStudentFlashcards', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const createSet = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Brak nazwy' });
    
    if (!isValidString(name, 200)) {
      return res.status(400).json({ error: 'Nazwa zestawu musi mieć 1–200 znaków' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const set = await prisma.flashcardSet.create({
      data: {
        tutorId: tutor.id,
        name,
      },
    });

    res.status(201).json(set);
  } catch (e){
    console.error('Error createSet',e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

export const getMySets = async (req, res) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) return res.status(404).json({ error: 'Brak profilu tutora' });

    const sets = await prisma.flashcardSet.findMany({
      where: { tutorId: tutor.id },
      include: { flashcards: true },
    });

    res.json(sets);
  } catch (e) {
    console.error('Error getMySets', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

export const assignSetToStudent = async (req, res) => {
  try {
    const setId = Number(req.params.id);
    const { studentId } = req.body;

   if (!isValidId(setId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID zestawu' });
    }

    if (!isValidId(studentId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID ucznia' });
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }
      // zwykłe setId czy Number(setId)
    const set = await prisma.flashcardSet.findUnique({ where: { id: Number(setId) } });

    if (!set || set.tutorId !== tutor.id) {
      return res.status(404).json({ error: 'Brak zestawu lub dostępu do zestawu' });
    }

    // sprawdź czy student istnieje
    const student = await prisma.studentProfile.findUnique({
      where: { id: Number(studentId) },
    });

    if (!student) {
      return res.status(404).json({ error: 'Nie znaleziono ucznia' });
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
      return res.status(409).json({ error: 'Zestaw już przypisany' });
    }
    console.error('ERROR assignSetToStudent', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
