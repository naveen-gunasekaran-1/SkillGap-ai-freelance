import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppRole = 'candidate' | 'company';

interface RoleState {
  activeRole: AppRole;
  setRole: (role: AppRole) => void;
  toggleRole: () => void;
}

/**
 * Stores the active role (candidate vs company) for UI switching.
 * The actual user.role from auth determines what features are available,
 * but this allows companies that also have candidate profiles to switch views.
 */
export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      activeRole: 'candidate',
      setRole: (role) => set({ activeRole: role }),
      toggleRole: () =>
        set((state) => ({
          activeRole: state.activeRole === 'candidate' ? 'company' : 'candidate',
        })),
    }),
    {
      name: 'skillgap-active-role',
    }
  )
);
