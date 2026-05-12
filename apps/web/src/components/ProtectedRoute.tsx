import { Navigate, useLocation } from 'react-router-dom';
import { hasAccessToken } from '../lib/api';

/**
 * Redirects unauthenticated users to `/login`, preserving the attempted URL.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  const location = useLocation();

  if (!hasAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
