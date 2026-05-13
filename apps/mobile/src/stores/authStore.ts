import { create } from 'zustand';

interface MobileAuthState {
  isAuthenticated: boolean;
  userName: string | null;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUserName: (name: string) => void;
  setSession: (name: string) => void;
  clear: () => void;
}

/**
 * Lightweight session display state (tokens live in SecureStore via `lib/http.ts`).
 */
export const useMobileAuthStore = create<MobileAuthState>((set) => ({
  isAuthenticated: false,
  userName: null,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUserName: (userName) => set({ userName }),
  setSession: (userName) => set({ isAuthenticated: true, userName }),
  clear: () => set({ isAuthenticated: false, userName: null }),
}));
