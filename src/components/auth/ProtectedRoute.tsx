
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['chef', 'purchasing', 'supplier'] 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to the login page if the user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role is not in the allowed roles, redirect to an appropriate page
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on the user's actual role
    if (user.role === 'chef') {
      return <Navigate to="/chef/inventory" replace />;
    } else if (user.role === 'purchasing') {
      return <Navigate to="/suppliers" replace />;
    } else if (user.role === 'supplier') {
      return <Navigate to="/supplier/quotes" replace />;
    }
    
    // Fallback to login if role is not recognized
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
