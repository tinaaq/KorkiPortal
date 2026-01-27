
import prisma from '../../config/db.js';

/*
  TUTOR — dodaje nieobecność
  startAt: DateTime
  endAt: DateTime
  reason: String?
*/
export const addUnavailability = async (req, res) => {
  try {
    const { startAt, endAt, reason } = req.body;

    if (!startAt || !endAt) {
      return res.status(400).json({ error: 'Brak zakresu dat' });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Nieprawidłowe daty' });
    }

    if (start >= end) {
      return res.status(400).json({
        error: 'startAt musi być przed endAt',
      });
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const unavailability = await prisma.tutorUnavailability.create({
      data: {
        tutorId: tutorProfile.id,
        startAt: start,
        endAt: end,
        reason: reason || null,
      },
    });

    // Znajdź zajęcia do anulowania
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        tutorId: tutorProfile.id,
        status: 'CONFIRMED',
        startAt: { lt: end },
        endAt: { gt: start },
      },
      include: {
        student: {
          include: { user: true }
        }
      }
    });

    // Anuluj zajęcia
    await prisma.booking.updateMany({
      where: {
        id: { in: overlappingBookings.map(b => b.id) }
      },
      data: {
        status: 'CANCELLED'
      }
    });

    // TO DO: Wyślij e‑maile do uczniów overlappingBookings[*]

    res.status(201).json({
      unavailability,
      cancelledBookings: overlappingBookings.length,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/*
  Lista nieobecności
*/
export const getUnavailabilities = async (req, res) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const list = await prisma.tutorUnavailability.findMany({
      where: { tutorId: tutorProfile.id },
      orderBy: [{ startAt: 'asc' }],
    });

    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/*
  Usuń nieobecność
*/
export const deleteUnavailability = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID' });
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    const item = await prisma.tutorUnavailability.findUnique({
      where: { id },
    });

    if (!item || item.tutorId !== tutorProfile.id) {
      return res.status(404).json({ error: 'Nie znaleziono nieobecności' });
    }

    await prisma.tutorUnavailability.delete({ where: { id } });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
