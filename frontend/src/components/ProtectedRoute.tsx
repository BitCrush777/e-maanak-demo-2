import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sovereign-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sovereign-navy mx-auto"></div>
          <p className="mt-4 text-sovereign-navy">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sovereign-bg">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-sovereign-navy mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
          <a href="/" className="text-sovereign-brass hover:underline">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
