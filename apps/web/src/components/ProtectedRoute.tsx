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
  const status = useAuthStore((s) => s.status);

  if (status === 'bootstrapping') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-10 w-56 animate-pulse rounded-card bg-border" />
          <div className="h-40 animate-pulse rounded-card bg-border" />
        </div>
      </div>
    );
  }

  if (!hasAccessToken() || status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const target = user.role === 'ADMIN' ? '/admin' : user.role === 'COMPANY' ? '/company' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
