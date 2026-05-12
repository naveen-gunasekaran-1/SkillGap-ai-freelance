import { create } from 'zustand';

interface MobileAuthState {
  userName: string | null;
  setUserName: (name: string) => void;
  clear: () => void;
}

/**
 * Lightweight session display state (tokens live in SecureStore via `lib/http.ts`).
 */
export const useMobileAuthStore = create<MobileAuthState>((set) => ({
  userName: null,
  setUserName: (userName) => set({ userName }),
  clear: () => set({ userName: null }),
}));
