import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredUserType = 'citizen' }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!user) {
    const loginPath = requiredUserType === 'citizen' ? '/citizen-login' : '/admin-login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If authenticated but wrong user type, redirect to appropriate login
  if (user.userType !== requiredUserType) {
    const loginPath = requiredUserType === 'citizen' ? '/citizen-login' : '/admin-login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If authenticated and correct user type, render the protected component
  return children;
};

export default ProtectedRoute;