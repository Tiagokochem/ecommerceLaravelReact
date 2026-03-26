import { api, setStoredToken } from './client';
import type { AuthUser } from '../types';

const USER_KEY = 'auth_user';

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (user === null) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthStorage(): void {
  setStoredToken(null);
  setStoredUser(null);
}

interface AuthResponse {
  data: {
    token: string;
    token_type: string;
    user: AuthUser;
  };
}

export async function registerApi(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  const { data } = await api.post<AuthResponse>('/api/register', input);
  setStoredToken(data.data.token);
  setStoredUser(data.data.user);
}

export async function loginApi(input: { email: string; password: string }): Promise<void> {
  const { data } = await api.post<AuthResponse>('/api/login', input);
  setStoredToken(data.data.token);
  setStoredUser(data.data.user);
}

export async function logoutApi(): Promise<void> {
  try {
    await api.post('/api/logout');
  } catch {
    /* 401 se token inválido — limpa estado local mesmo assim */
  } finally {
    clearAuthStorage();
  }
}
