import prisma from '../../config/db.js';

export const getTutorStudents = async (req, res) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Brak profilu korepetytora' });
    }

    const bookings = await prisma.booking.findMany({
      where: { tutorId: tutor.id },
      distinct: ['studentId'],
      orderBy: { startAt: 'desc' },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const students = bookings
      .filter((b) => b.student !== null)
      .map((b) => ({
        id: b.student.id,
        userId: b.student.userId,
        firstName: b.student.firstName,
        lastName: b.student.lastName,
        grade: b.student.grade,
        city: b.student.city,
        email: b.student.user.email,
      }));

    return res.json(students);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
