import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Route component that restricts access based on role
// mainAdmin: if true, only main admin can access
// divisionAdmin: if true, only division admin can access
// both: if true, both roles can access

const DivisionRoute = ({ children, mainAdmin = false, divisionAdmin = false, both = false }) => {
  const { currentUser, loading, isMainAdmin, isDivisionAdmin } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role access
  if (both) {
    // Both roles are allowed
    if (isMainAdmin() || isDivisionAdmin()) {
      return children;
    }
  } else if (mainAdmin) {
    // Only main admin is allowed
    if (isMainAdmin()) {
      return children;
    }
  } else if (divisionAdmin) {
    // Only division admin is allowed
    if (isDivisionAdmin()) {
      return children;
    }
  }

  // If no access, redirect to dashboard
  // The dashboard component should handle showing appropriate content based on role
  return <Navigate to="/dashboard" replace />;
};

export default DivisionRoute;