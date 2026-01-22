import prisma from '../../config/db.js';
import { sendCancellationEmail } from '../notifications/email.service.js';


const LESSON_MINUTES = 30;

/* =========================
   CREATE BOOKING (STUDENT)
========================= */
export const createBooking = async (req, res) => {
  try {
    const { tutorId, startAt, subject, mode, addressOption } = req.body;

    if (!tutorId || !startAt || !subject || !mode) {
      return res.status(400).json({ error: 'Brak danych' });
    }

    const start = new Date(startAt);
    if (isNaN(start)) {
      return res.status(400).json({ error: 'Zły format daty' });
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + LESSON_MINUTES);

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Brak profilu ucznia' });
    }
   
    // Pobierz profil korepetytora
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { id: Number(tutorId) },
    });
    if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu korepetytora' });
    }

    // czy slot pasuje do availability
    const weekday = start.getDay();
    const hh = start.toISOString().substring(11, 16);

    const availability = await prisma.availability.findFirst({
      where: {
        tutorId: Number(tutorId),
        dayOfWeek: weekday,
        startTime: { lte: hh },
        endTime: { gte: hh },
      },
    });

    if (!availability) {
      return res.status(400).json({ error: 'Termin niedostępny' });
    }

    // transakcja — blokada kolizji
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          tutorId: Number(tutorId),
          status: 'CONFIRMED',
          startAt: { lt: end },
          endAt: { gt: start },
        },
      });

      if (conflict) {
        throw new Error('SLOT_TAKEN');
      }

      if (mode === 'OFFLINE' || mode === 'BOTH') {
        if (!addressOption) {
          return res.status(400).json({ error: 'Wybierz adres zajęć' });
        }
      }

      let finalAddress = null;

      // ONLINE → zawsze link do spotkania
      if (mode === 'ONLINE') {
        finalAddress = tutorProfile.meetingLink;
      }

      // OFFLINE → zależy od wyboru ucznia
      else if (mode === 'OFFLINE') {
        if (addressOption === 'student') {
          finalAddress = studentProfile.address;
        } else if (addressOption === 'tutor') {
          finalAddress = tutorProfile.address;
        } else {
          return res.status(400).json({ error: 'Nieprawidłowa opcja adresu' });
        }
      }

      // BOTH → student musi wybrać jedną z dwóch opcji
      else if (mode === 'BOTH') {
        if (addressOption === 'student') {
          finalAddress = studentProfile.address;
        } else if (addressOption === 'tutor') {
          finalAddress = tutorProfile.address;
        } else {
          return res.status(400).json({ error: 'Nieprawidłowa opcja adresu' });
        }
      }


      return tx.booking.create({
        data: {
          tutorId: Number(tutorId),
          studentId: studentProfile.id,          
          subject,
          mode,
          address: finalAddress,
          startAt: start,
          endAt: end,
          status: 'CONFIRMED',
        },
      });
    });

    res.status(201).json(booking);
  } catch (e) {
    if (e.message === 'SLOT_TAKEN') {
      return res.status(409).json({ error: 'Slot zajęty' });
    }
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   GET MY BOOKINGS
========================= */
export const getMyBookings = async (req, res) => {
  try {
    const now = new Date();

    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      const bookings = await prisma.booking.findMany({
        where: { studentId: student.id },
        include: { tutor: true },
        orderBy: { startAt: 'asc' },
      });

      return res.json(bookings);
    }

    if (req.user.role === 'TUTOR') {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { userId: req.user.userId },
      });

      const bookings = await prisma.booking.findMany({
        where: { tutorId: tutor.id },
        include: { student: true },
        orderBy: { startAt: 'asc' },
      });

      return res.json(bookings);
    }

    res.status(403).json({ error: 'Brak dostępu' });
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

/* =========================
   CANCEL BOOKING
========================= */
export const cancelBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        tutor: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Nie znaleziono rezerwacji' });
    }

    let allowed = false;

    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (student && student.id === booking.studentId) allowed = true;
    }

    if (req.user.role === 'TUTOR') {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { userId: req.user.userId },
      });
      if (tutor && tutor.id === booking.tutorId) allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // 👉 EMAIL TYLKO GDY TUTOR ANULUJE
    if (req.user.role === 'TUTOR') {
      const studentEmail = booking.student.user.email;
      const tutorName = booking.tutor.firstName;

      sendCancellationEmail(
        studentEmail,
        tutorName,
        booking.startAt,
        booking.endAt
      ).catch((e) => console.error('Email error:', e));
    }

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

