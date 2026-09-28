import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-xs font-semibold text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xs shadow-md border border-slate-300 max-w-md">
          <h1 className="text-xl font-black text-slate-900 mb-2">{t('common.restrictedTitle')}</h1>
          <p className="text-xs text-slate-600 mb-6">{t('common.restrictedDesc')}</p>
          <a href="/" className="gov-btn-primary py-1.5 px-4 text-xs font-bold inline-block">
            {t('common.goToDashboard')}
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
