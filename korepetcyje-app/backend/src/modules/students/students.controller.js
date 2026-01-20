
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
    const { name, grade } = req.body;

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: req.user.userId },
      data: {
        name,
        grade,
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
