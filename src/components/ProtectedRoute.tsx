import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * Renders children only when the user is an authorized family member.
 * - Loading  → shows a centered spinner
 * - Unauthenticated / Unauthorized → redirects to /family-login
 * - Authorized → renders children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { familyStatus } = useAuth();
  const location = useLocation();

  if (familyStatus === 'loading') {
    return (
      <div className="dash-loader" aria-label="Checking authorisation…">
        <div className="dash-spinner" />
        <p>Verifying access…</p>
      </div>
    );
  }

  if (familyStatus === 'unauthenticated' || familyStatus === 'unauthorized') {
    // Pass "from" so the login page can redirect back after success
    return <Navigate to="/family-login" state={{ from: location }} replace />;
  }

  return children;
};
