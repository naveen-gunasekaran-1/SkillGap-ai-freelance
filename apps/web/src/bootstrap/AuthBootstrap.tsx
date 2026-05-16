import { useEffect } from 'react';
import { api, hasAccessToken } from '../lib/api';
import { parseUser } from '../lib/normalize';
import { useAuthStore } from '../stores/authStore';

/**
 * Loads the current user profile when tokens exist (keeps UI in sync after refresh).
 */
export function AuthBootstrap(): null {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!hasAccessToken()) {
      setStatus('anonymous');
      return;
    }

    void api
      .get<{ user: unknown }>('/auth/me')
      .then((res) => setUser(parseUser(res.data.user)))
      .catch(() => {
        logout();
      });
  }, [logout, setStatus, setUser]);

  return null;
}
