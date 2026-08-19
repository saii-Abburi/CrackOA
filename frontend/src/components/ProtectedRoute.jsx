import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — redirects unauthenticated users to /login,
 * passing the intended destination so LoginPage can redirect back after login.
 *
 * While the auth state is loading (validating stored token), shows a spinner
 * to avoid a flash of the login page for users who ARE authenticated.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-label="Checking authentication…"
      >
        <Loader2 className="w-8 h-8 text-accent animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
