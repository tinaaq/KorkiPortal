
import prisma from '../../config/db.js';

export const getTutorProfile = async (req, res) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Profil nie znaleziony' });
    }

    res.json(tutorProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTutorProfile = async (req, res) => {
  try {
    const { name, description, meetingLink, photoUrl, subjects } = req.body;

    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId: req.user.userId },
      data: {
        name,
        description,
        meetingLink,
        photoUrl,
        subjects,
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const searchTutors = async (req, res) => {
  try {
    const { name, subject, description } = req.query;

    const tutors = await prisma.tutorProfile.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: 'insensitive' } } : {},
          subject ? { subjects: { has: subject } } : {},
          description ? { description: { contains: description, mode: 'insensitive' } } : {},
        ],
      },
    });

    res.json(tutors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
