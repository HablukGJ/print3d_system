import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Layout } from './components/Layout.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { MyRequests } from './pages/MyRequests.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Profile } from './pages/Profile.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthReady } = useAuth();
  
  if (!isAuthReady) return null;
  if (!token) return <Navigate to="/login" replace />;
  
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/requests" replace />} />
        <Route path="*" element={<Navigate to="/requests" replace />} />
      </Routes>
    </AuthProvider>
  );
}
