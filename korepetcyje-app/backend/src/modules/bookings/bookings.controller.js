import prisma from '../../config/db.js';
import { sendCancellationEmail } from '../notifications/email.service.js';


const LESSON_MINUTES = 30;

export const createBooking = async (req, res) => {
  try {
    const { tutorId, startAt, subjectId, mode, addressOption } = req.body;

    if (!tutorId || !startAt || !subjectId || !mode) {
      return res.status(400).json({ error: 'Brak wymaganych danych' });
    }

    const start = new Date(startAt);
    if (isNaN(start)) {
      return res.status(400).json({ error: 'Zły format daty' });
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + LESSON_MINUTES);

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
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

    // Sprawdź, czy korepetytor ma taki przedmiot
    const tutorSubject = await prisma.tutorSubject.findUnique({
      where: {
        tutorId_subjectId: {
          tutorId: tutorProfile.id,
          subjectId: Number(subjectId),
        },
      },
    });

    if (!tutorSubject) {
      return res.status(400).json({ error: 'Korepetytor nie prowadzi tego przedmiotu' });
    }

    // Normalizacja i walidacja mode
    const normalizedMode = mode.toUpperCase();
    if (!['ONLINE', 'OFFLINE', 'BOTH'].includes(normalizedMode)) {
      return res.status(400).json({ error: 'Nieprawidłowy tryb zajęć' });
    }

    // czy slot pasuje do availability
    const weekday = start.getDay();
    
    const pad = (n) => String(n).padStart(2, '0');
    const hh = `${pad(start.getHours())}:${pad(start.getMinutes())}`;

    //const hh = start.toISOString().substring(11, 16);

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

    // Ustal location + address w zależności od trybu
      let finalAddress = null;
      let location = null; // LessonLocation: AT_STUDENT / AT_TUTOR / null


      if (normalizedMode === 'ONLINE') {
            finalAddress = tutorProfile.meetingLink || null;
          } else {
            if (!addressOption) {
             throw new Error('NO_ADDRESS_OPTION');
            }

            if (addressOption === 'student') {
              finalAddress = studentProfile.address || null;
              location = 'AT_STUDENT';
            } else if (addressOption === 'tutor') {
              finalAddress = tutorProfile.address || null;
              location = 'AT_TUTOR';
            } else {
               throw new Error('BAD_ADDRESS_OPTION');  
            }

            if (!finalAddress) {
              throw new Error('NO_ADDRESS_DEFINED');  
            }
          }


      return tx.booking.create({
        data: {
          tutorId: tutorProfile.id,
          studentId: studentProfile.id,          
          subjectId: Number(subjectId),
          mode: normalizedMode,
          location,
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
    
    if (e.message === 'NO_ADDRESS_OPTION') {
      return res.status(400).json({ error: 'Wybierz adres zajęć' });
    }
    if (e.message === 'BAD_ADDRESS_OPTION') {
      return res.status(400).json({ error: 'Nieprawidłowa opcja adresu' });
    }
    if (e.message === 'NO_ADDRESS_DEFINED') {
      return res.status(400).json({ error: 'Brak adresu dla wybranego miejsca zajęć' });
    }

    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const getMyBookings = async (req, res) => {
  try {
    const now = new Date();

    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

    if (!student) {
        return res.status(404).json({ error: 'Brak profilu ucznia' });
      }

      const bookings = await prisma.booking.findMany({
        
        where: { studentId: student.id },
                include: {
                  tutor: {
                    include: {
                      user: true,
                      subjects: { include: { subject: true } },
                    },
                  },
                  subject: true,
                },
                orderBy: { startAt: 'asc' },
              });


      return res.json(bookings);
    }

    if (req.user.role === 'TUTOR') {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!tutor) {
        return res.status(404).json({ error: 'Brak profilu korepetytora' });
      }

      const bookings = await prisma.booking.findMany({
        
        where: { tutorId: tutor.id },
                include: {
                  student: {
                    include: { user: true },
                  },
                  subject: true,
                },
                orderBy: { startAt: 'asc' },
              });

      return res.json(bookings);
    }

    res.status(403).json({ error: 'Brak dostępu' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);

    
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID rezerwacji' });
    }

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
        where: { userId: req.user.id },
      });
      if (student && student.id === booking.studentId) allowed = true;
    }

    if (req.user.role === 'TUTOR') {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { userId: req.user.id },
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

    //  EMAIL TYLKO GDY TUTOR ANULUJE
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

export const cancelManyBookings = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Brak listy ID bookingów' });
    }

    const bookings = await prisma.booking.findMany({
      where: { id: { in: ids } },
      include: {
        student: { include: { user: true } },
        tutor: true,
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono rezerwacji' });
    }

    // Sprawdź dostęp (czy user jest studentem lub tutorem tych zajęć)
    const userId = req.user.id;
    const role = req.user.role;

    let allowed = false;

    if (role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (student && bookings.every(b => b.studentId === student.id)) {
        allowed = true;
      }
    }

    if (role === 'TUTOR') {
      const tutor = await prisma.tutorProfile.findUnique({
        where: { userId },
      });
      if (tutor && bookings.every(b => b.tutorId === tutor.id)) {
        allowed = true;
      }
    }

    if (!allowed) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const anyBooking = bookings[0];
    const studentEmail = anyBooking.student.user.email;
    const tutorName = anyBooking.tutor.firstName;
    const startAt = bookings[0].startAt;
    const endAt = bookings[bookings.length - 1].endAt;

    await prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: { id: { in: ids } },
        data: { status: 'CANCELLED' },
      });
    });

    if (role === 'TUTOR') {
      sendCancellationEmail(studentEmail, tutorName, startAt, endAt)
        .catch((e) => console.error('Email error:', e));
    }

    res.json({
      success: true,
      cancelled: ids.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

