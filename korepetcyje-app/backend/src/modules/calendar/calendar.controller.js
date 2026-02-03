import prisma from '../../config/db.js';

const LESSON_MINUTES = 30;

export const addAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;

    if (
      dayOfWeek === undefined || !startTime || !endTime ) {
      return res.status(400).json({ error: 'Brak danych' });
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Nieprawidłowy dzień tygodnia' });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        error: 'startTime i endTime muszą być w formacie HH:mm',
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        error: 'endTime musi być później niż startTime',
      });
    }


    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const overlap = await prisma.availability.findFirst({
      where: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (overlap) {
      return res.status(409).json({ error: 'Nachodzące godziny' });
    }

    const availability = await prisma.availability.create({
      data: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    res.status(201).json(availability);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const getMyAvailabilities = async (req, res) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });
   
    if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const availabilities = await prisma.availability.findMany({
      where: { tutorId: tutorProfile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json(availabilities);
  } catch (e) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const getTutorSlots = async (req, res) => {
  try {

    const { from, to } = req.query;
    const tutorId = Number(req.params.tutorId);

    if (!tutorId || Number.isNaN(tutorId)) {
      return res.status(400).json({ error: 'Nieprawidłowy tutorId' });
    }

    if (!from || !to) {
      return res.status(400).json({ error: 'Brak zakresu dat' });
    }
    // const tutorProfile = await prisma.tutorProfile.findUnique({ 
    //   where: { userId: req.user.userId }, }); 
    //const tutorId = tutorProfile.id;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Nieprawidłowe daty' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ error: 'from musi być <= to' });
    }

    const availabilities = await prisma.availability.findMany({
      where: { tutorId },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        tutorId,
        status: 'CONFIRMED',
        startAt: { gte: fromDate, lte: toDate },
      },
    });


const unavailabilities = await prisma.tutorUnavailability.findMany({
      where: {
        tutorId,
        startAt: { lt: toDate },
        endAt: { gt: fromDate },
      },
    });


    const slots = [];

    for (
      let d = new Date(fromDate);
      d <= toDate;
      d.setDate(d.getDate() + 1)
    ) {
      const weekday = d.getDay();

      const todaysAvail = availabilities.filter(
        (a) => a.dayOfWeek === weekday
      );

      for (const a of todaysAvail) {
        let [h, m] = a.startTime.split(':').map(Number);
        const [endH, endM] = a.endTime.split(':').map(Number);

        let slot = new Date(d);
        slot.setHours(h, m, 0, 0);

        const endLimit = new Date(d);
        endLimit.setHours(endH, endM, 0, 0);

        while (slot < endLimit) {
          const slotEnd = new Date(slot);
          slotEnd.setMinutes(slotEnd.getMinutes() + LESSON_MINUTES);

          const conflict = bookings.some(
            (b) =>
              b.startAt < slotEnd &&
              b.endAt > slot
          );

          
const conflictUnavailability = unavailabilities.some(
            (u) =>
              u.startAt < slotEnd &&
              u.endAt > slot
          );


          if (!conflict && !conflictUnavailability && slotEnd <= endLimit) {
            slots.push({
              start: slot.toISOString(),
              end: slotEnd.toISOString(),
            });
          }

          slot.setMinutes(slot.getMinutes() + LESSON_MINUTES);
        }
      }
    }

    res.json(slots);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const deleteAvailability = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'Nieprawidłowe id dostępności' });
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

   if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability || availability.tutorId !== tutorProfile.id) {
      return res.status(404).json({ error: 'Nie znaleziono dostępności' });
    }

    await prisma.availability.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};


export const getAvailabilityEvents = async (req, res) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Brak profilu tutora' });
    }

    const availabilities = await prisma.availability.findMany({
      where: { tutorId: tutorProfile.id },
    });

    const events = availabilities.map((a) => ({
      id: a.id,
      daysOfWeek: [a.dayOfWeek],
      startTime: a.startTime,
      endTime: a.endTime,
      display: 'background',
    }));

    res.json(events);
  } catch (e) {
    console.error('Błąd getAvailabilityEvents:', e);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

