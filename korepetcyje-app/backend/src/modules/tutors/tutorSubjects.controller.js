// src/modules/tutors/tutorSubjects.controller.js
import prisma from '../../config/db.js';

// Pomocnicza funkcja – pobiera profil korepetytora po zalogowanym userze
const getTutorProfileForUser = async (userId) => {
  return prisma.tutorProfile.findUnique({
    where: { userId }, // unikalne pole w schema.prisma
  });
};

// GET /api/tutors/subjects
export const getTutorSubjects = async (req, res) => {
  try {
    // 👇 ID Z TOKENA, NIE Z PARAMS
    const tutorProfile = await getTutorProfileForUser(req.user.id);

    if (!tutorProfile) {
      return res
        .status(404)
        .json({ error: 'Profil korepetytora nie istnieje' });
    }

    const subjects = await prisma.tutorSubject.findMany({
      where: { tutorId: tutorProfile.id }, // TutorProfile.id
      include: { subject: true },
    });

    res.json(subjects);
  } catch (error) {
    console.error('[getTutorSubjects] error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/tutors/subjects
// body: { subjectName, priceInfo }
export const addTutorSubject = async (req, res) => {
  try {
    const { subjectName, priceInfo } = req.body;

    if (!subjectName || !priceInfo) {
      return res
        .status(400)
        .json({ error: 'Nazwa przedmiotu i cena są wymagane' });
    }

    const tutorProfile = await getTutorProfileForUser(req.user.id);

    if (!tutorProfile) {
      return res
        .status(404)
        .json({ error: 'Profil korepetytora nie istnieje' });
    }

    let subject = await prisma.subject.findUnique({
      where: { name: subjectName },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: subjectName },
      });
    }

    const tutorSubject = await prisma.tutorSubject.create({
      data: {
        tutorId: tutorProfile.id,   // TutorProfile.id
        subjectId: subject.id,
        priceInfo,
      },
    });

    res.status(201).json(tutorSubject);
  } catch (error) {
    console.error('[addTutorSubject] error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/tutors/subjects/:subjectId
// body: { priceInfo }
export const updateTutorSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { priceInfo } = req.body;

    if (!priceInfo) {
      return res.status(400).json({ error: 'Cena jest wymagana' });
    }

    const tutorProfile = await getTutorProfileForUser(req.user.id);

    if (!tutorProfile) {
      return res
        .status(404)
        .json({ error: 'Profil korepetytora nie istnieje' });
    }

    const updated = await prisma.tutorSubject.update({
      where: {
        tutorId_subjectId: {
          tutorId: tutorProfile.id,
          subjectId: parseInt(subjectId, 10),
        },
      },
      data: { priceInfo },
    });

    res.json(updated);
  } catch (error) {
    console.error('[updateTutorSubject] error:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/tutors/subjects/:subjectId
export const deleteTutorSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const tutorProfile = await getTutorProfileForUser(req.user.id);

    if (!tutorProfile) {
      return res
        .status(404)
        .json({ error: 'Profil korepetytora nie istnieje' });
    }

    await prisma.tutorSubject.delete({
      where: {
        tutorId_subjectId: {
          tutorId: tutorProfile.id,
          subjectId: parseInt(subjectId, 10),
        },
      },
    });

    res.json({ message: 'Przedmiot usunięty' });
  } catch (error) {
    console.error('[deleteTutorSubject] error:', error);
    res.status(500).json({ error: error.message });
  }
};