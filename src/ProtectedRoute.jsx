import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import { NotifAlert } from './components/Global/ToastNotif';

export const ProtectedRoute = () => {
  // cek token di localStorage
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    NotifAlert({
      icon: 'warning',
      title: 'Session Habis',
      message: 'Silahkan login terlebih dahulu',
    });
    return <Navigate to="/signin" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
