import { create } from 'zustand';
import type { User } from '@skillgap/types';
import { clearAuthTokens, setAuthTokens } from '../lib/api';

type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setSession: (user: User, accessToken: string, refreshToken: string, remember: boolean) => void;
  setUser: (user: User) => void;
  setStatus: (status: AuthStatus) => void;
  logout: () => void;
}

/**
 * Runtime auth state. Tokens control persistence:
 * - Remember me: localStorage refresh session
 * - No remember me: sessionStorage only, cleared when browser session ends
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'bootstrapping',
  setSession: (user, accessToken, refreshToken, remember) => {
    setAuthTokens(accessToken, refreshToken, remember ? 'local' : 'session');
    set({ user, status: 'authenticated' });
  },
  setUser: (user) => set({ user, status: 'authenticated' }),
  setStatus: (status) => set({ status }),
  logout: () => {
    clearAuthTokens();
    set({ user: null, status: 'anonymous' });
  },
}));
