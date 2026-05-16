import { Navigate, useLocation } from 'react-router-dom';
import { hasAccessToken } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

/**
 * Redirects unauthenticated users to `/login`, preserving the attempted URL.
 */
export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<'CANDIDATE' | 'COMPANY' | 'ADMIN'>;
}): React.JSX.Element {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  if (!hasAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'COMPANY' ? '/company' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
