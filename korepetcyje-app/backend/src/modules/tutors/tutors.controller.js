
import prisma from '../../config/db.js';

// Pobierz profil korepetytora
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

// Aktualizacja profilu korepetytora
export const updateTutorProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      city,
      address,
      description,
      meetingLink,
      photoUrl,
      mode,
      subjects
    } = req.body;

    // Walidacja podstawowa
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Imię i nazwisko są wymagane' });
    }

    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId: req.user.userId },
      data: {
        firstName,
        lastName,
        city,
        address,
        description,
        meetingLink,
        photoUrl,
        mode,
        subjects
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Wyszukiwanie korepetytorów z filtrami
export const searchTutors = async (req, res) => {
  try {
    const { name, subject, city, mode, sortBy, order = 'asc', page = 1, limit = 10 } = req.query;

    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Sortowanie
    let orderBy = {};
    if (sortBy === 'firstName') {
      orderBy = { firstName: order };
    } else if (sortBy === 'city') {
      orderBy = { city: order };
    }

    const tutors = await prisma.tutorProfile.findMany({
      where: {
        AND: [
          name
            ? {
                OR: [
                  { firstName: { contains: name, mode: 'insensitive' } },
                  { lastName: { contains: name, mode: 'insensitive' } }
                ]
              }
            : {},
          subject
            ? {
                subjects: {
                  array_contains: [{ subject }] // Prisma JSON filter
                }
              }
            : {},
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          mode ? { OR: [ { mode: mode.toUpperCase() }, { mode: 'BOTH' } ] } : {}
        ]
      },
      skip,
      take,
      orderBy

    });


// Liczba wszystkich wyników (do paginacji)
    const total = await prisma.tutorProfile.count({
      where: {
        AND: [
          name
            ? {
                OR: [
                  { firstName: { contains: name, mode: 'insensitive' } },
                  { lastName: { contains: name, mode: 'insensitive' } }
                ]
              }
            : {},
          subject
            ? {
                subjects: {
                  array_contains: [{ subject }]
                }
              }
            : {},
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          mode ? { mode: mode.toUpperCase() } : {}
        ]
      }
    });

    res.json({
      data: tutors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

