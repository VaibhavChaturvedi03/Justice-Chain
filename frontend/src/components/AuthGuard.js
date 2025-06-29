import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthGuard = ({ children, redirectTo = '/citizen-login', requireAuth = true }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && user) {
    // User is logged in but trying to access login/signup pages
    const dashboardPath = user.userType === 'citizen' ? '/citizen-dashboard' : '/admin-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default AuthGuard;