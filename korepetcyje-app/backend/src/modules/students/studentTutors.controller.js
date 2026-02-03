import prisma from '../../config/db.js';

export const getStudentTutors = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ error: 'Brak profilu ucznia' });
    }

    const bookings = await prisma.booking.findMany({
      where: { studentId: student.id },
      distinct: ['tutorId'],
      orderBy: { startAt: 'desc' },
      include: {
        tutor: {
          include: {
            user: true,
          },
        },
      },
    });

    const tutors = bookings
      .filter((b) => b.tutor !== null)
      .map((b) => ({
        id: b.tutor.id,
        userId: b.tutor.userId,
        firstName: b.tutor.firstName,
        lastName: b.tutor.lastName,
        city: b.tutor.city,
        mode: b.tutor.mode,
        description: b.tutor.description,
        subjects: b.tutor.subjects,
        email: b.tutor.user.email,
      }));

    return res.json(tutors);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};