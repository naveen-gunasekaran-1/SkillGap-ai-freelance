import { create } from 'zustand';

interface MobileAuthState {
  isAuthenticated: boolean;
  userName: string | null;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' | null;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUserName: (name: string) => void;
  setSession: (name: string, role?: 'CANDIDATE' | 'COMPANY' | 'ADMIN') => void;
  clear: () => void;
}

/**
 * Lightweight session display state (tokens live in SecureStore via `lib/http.ts`).
 */
export const useMobileAuthStore = create<MobileAuthState>((set) => ({
  isAuthenticated: false,
  userName: null,
  role: null,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUserName: (userName) => set({ userName }),
  setSession: (userName, role) => set({ isAuthenticated: true, userName, ...(role ? { role } : {}) }),
  clear: () => set({ isAuthenticated: false, userName: null, role: null }),
}));
