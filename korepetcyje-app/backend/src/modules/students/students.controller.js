
import prisma from '../../config/db.js';

export const getStudentProfile = async (req, res) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Profil nie znaleziony' });
    }

    res.json(studentProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { firstName, lastName, city, address, grade } = req.body;

    
    if (!firstName) {
      return res.status(400).json({ error: 'Imię jest wymagane' });
    }

    if (!lastName) {
      return res.status(400).json({ error: 'Nazwisko jest wymagane' });
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: req.user.userId },
      data: {

        firstName,
        lastName,
        city: city || null,
        address: address || null,
        grade: grade || null

      },
    });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
