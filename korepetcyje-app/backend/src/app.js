
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/db.js';
import authRoutes from './modules/auth/auth.routes.js'

import tutorsRoutes from './modules/tutors/tutors.routes.js';
import studentsRoutes from './modules/students/students.routes.js';

import calendarRoutes from './modules/calendar/calendar.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);

app.use('/api/tutors', tutorsRoutes);
app.use('/api/students', studentsRoutes);

app.use('/api/calendar', calendarRoutes);



app.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
