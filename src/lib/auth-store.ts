import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserRole = 'director' | 'finance' | null;

interface AuthStore {
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  canApprove: (approvalType: 'director' | 'finance') => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: null,

      login: async (username, password) => {
        // Simple validation
        if (!username || !password) return false;

        // Check credentials
        if (password !== '1234') return false;

        if (username.toLowerCase() === 'director') {
          set({ isAuthenticated: true, userRole: 'director' });
          return true;
        }
        if (username.toLowerCase() === 'finance') {
          set({ isAuthenticated: true, userRole: 'finance' });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false, userRole: null });
      },

      canApprove: (approvalType) => {
        const { userRole } = get();
        return userRole === approvalType;
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage instead of localStorage
      partialize: (state) => ({ 
        isAuthenticated: false, // Always start logged out
        userRole: null 
      }),
    }
  )
);