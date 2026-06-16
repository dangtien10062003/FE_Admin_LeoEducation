import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { SubjectsPage } from './pages/SubjectsPage';
import { CoursesPage } from './pages/CoursesPage';
import { ClassesPage } from './pages/ClassesPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { ContactsPage } from './pages/ContactsPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { BlogsPage } from './pages/BlogsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3001/login';

const ExternalRedirect = ({ to }) => {
  React.useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<ExternalRedirect to={LOGIN_URL} />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="registrations" element={<RegistrationsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="instructors" element={<InstructorsPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="blogs" element={<BlogsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
