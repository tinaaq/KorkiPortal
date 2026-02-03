import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import HomePage from './pages/HomePage';

import TutorDashboard from './pages/tutor/TutorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import NotFound from './pages/NotFound';

import TutorProfile from './pages/tutor/TutorProfile';
import TutorCalendar from './pages/tutor/TutorCalendar';
import TutorStudents from './pages/tutor/TutorStudents';
import TutorFlashcards from './pages/tutor/TutorFlashcards';

import StudentTutors from './pages/student/StudentTutors';
import StudentTutorDetails from './pages/student/StudentTutorDetails';
import StudentTutorBooking from './pages/student/StudentTutorBooking';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentFlashcards from './pages/student/StudentFlashcards';
import StudentProfile from './pages/student/StudentProfile';


import './App.css'


function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
}

function AuthRedirect({ children }) {
  const { user } = useAuth();

  if (user?.role === 'TUTOR') return <Navigate to="/tutor" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/student" replace />;

  return children;
}


export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage/>} />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </AuthRedirect>
          }
        />

        <Route
          path="/register"
          element={
            <AuthRedirect>
              <AuthLayout>
                <Register />
              </AuthLayout>
            </AuthRedirect>
          }
        />


        {/* TUTOR */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TutorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/tutor/profile" element={<DashboardLayout><TutorProfile /></DashboardLayout>} />
        <Route path="/tutor/calendar" element={<DashboardLayout><TutorCalendar /></DashboardLayout>} />
        <Route path="/tutor/students" element={<DashboardLayout><TutorStudents /></DashboardLayout>} />
        <Route path="/tutor/flashcards" element={<DashboardLayout><TutorFlashcards /></DashboardLayout>} />

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/student/tutors" element={<DashboardLayout><StudentTutors /></DashboardLayout>} />
        <Route path="/student/tutors/:id" element={<DashboardLayout><StudentTutorDetails /></DashboardLayout>} />
        <Route path="/student/tutors/:id/book" element={<DashboardLayout><StudentTutorBooking /></DashboardLayout>} />
        <Route path="/student/calendar" element={<DashboardLayout><StudentCalendar/></DashboardLayout>} />
        <Route path="/student/flashcards" element={<DashboardLayout><StudentFlashcards /></DashboardLayout>} />
        <Route path="/student/profile" element={<DashboardLayout><StudentProfile /></DashboardLayout>} />

        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
}
