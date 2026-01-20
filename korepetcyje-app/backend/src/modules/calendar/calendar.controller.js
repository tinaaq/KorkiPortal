
import prisma from '../../config/db.js';

export const addAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime i endTime są wymagane' });
    }

    const availability = await prisma.availability.create({
      data: {
        tutorId: req.user.userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailabilities = async (req, res) => {
  try {
    const availabilities = await prisma.availability.findMany({
      where: { tutorId: req.user.userId },
      orderBy: { startTime: 'asc' },
    });

    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
