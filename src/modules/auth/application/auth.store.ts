import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_USER_STORAGE_KEY } from '@/core/config/constants';
import { tokenStorage } from '@/core/infrastructure/storage/token-storage';
import type { AuthUser } from '../domain/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        tokenStorage.setToken(accessToken, 1);
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      updateUser: (partialUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        }));
      },

      clearAuth: () => {
        tokenStorage.clearAll();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: AUTH_USER_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
