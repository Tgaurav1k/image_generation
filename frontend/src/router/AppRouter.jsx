import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getMe } from '../services/authService';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import AdminLayout from '../pages/AdminLayout';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminGenerate from '../pages/AdminGenerate';
import AdminManageAdmins from '../pages/AdminManageAdmins';
import UserLayout from '../pages/UserLayout';
import GeneratePage from '../pages/GeneratePage';
import GalleryPage from '../pages/GalleryPage';
import RecentHistoryPage from '../pages/RecentHistoryPage';

export default function AppRouter() {
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    getMe()
      .then(user => setUser(user))
      .catch(() => clearUser());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="generate" element={<AdminGenerate />} />
          <Route path="recent" element={<RecentHistoryPage />} />
          <Route path="admins" element={<AdminManageAdmins />} />
        </Route>

        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user"><UserLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="generate" replace />} />
          <Route path="generate" element={<GeneratePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="recent" element={<RecentHistoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
