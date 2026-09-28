import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { OfficerQueuePage } from './pages/OfficerQueuePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicVerifyPage } from './pages/PublicVerifyPage';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sovereign-navy mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading Sovereign Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'OFFICER') {
    return <Navigate to="/officer" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/owner" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect based on Role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Owner Portal */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                <Layout>
                  <OwnerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Officer Queue */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <Layout>
                  <OfficerQueuePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Public Certificate Verification */}
          <Route
            path="/verify"
            element={
              <Layout>
                <PublicVerifyPage />
              </Layout>
            }
          />
          <Route
            path="/verify/:token"
            element={
              <Layout>
                <PublicVerifyPage />
              </Layout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
