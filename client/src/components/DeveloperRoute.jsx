import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function DeveloperRoute({ children }) {
  const { isAuthenticated, isDeveloper, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Verifying developer privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isDeveloper) {
    return <Navigate to="/developer/login" state={{ from: location }} replace />;
  }

  return children;
}
