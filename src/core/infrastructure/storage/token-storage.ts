import Cookies from 'js-cookie';
import { AUTH_TOKEN_COOKIE, AUTH_USER_STORAGE_KEY } from '@/core/config/constants';

export const tokenStorage = {
  getToken(): string | undefined {
    return Cookies.get(AUTH_TOKEN_COOKIE);
  },

  setToken(token: string, days = 1): void {
    Cookies.set(AUTH_TOKEN_COOKIE, token, {
      expires: days,
      sameSite: 'lax',
      path: '/',
    });
  },

  removeToken(): void {
    Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  },

  clearAll(): void {
    Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  },
};
