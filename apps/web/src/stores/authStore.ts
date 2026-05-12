import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@skillgap/types';
import { clearAuthTokens, setAuthTokens } from '../lib/api';

interface AuthState {
  user: User | null;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

/**
 * Global auth state. Access/refresh tokens live in `localStorage` (see `lib/api.ts`).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (user, accessToken, refreshToken) => {
        setAuthTokens(accessToken, refreshToken);
        set({ user });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearAuthTokens();
        set({ user: null });
      },
    }),
    {
      name: 'skillgap-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
