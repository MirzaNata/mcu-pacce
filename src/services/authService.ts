import type { User } from '../types';

const STORAGE_KEY = 'mcu_user';

const SHARED_USER: User = {
  id: 'shared-staff-01',
  username: 'petugas_klinik',
  name: 'Petugas Klinik Pakisaji',
  role: 'STAFF',
};

export const authService = {
  login: (username: string, password: string): User | null => {
    if (!username.trim() || !password.trim()) {
      return null;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(SHARED_USER));
    return SHARED_USER;
  },

  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    return {
      id: '1',
      name: 'Petugas / Dokter MCU',
      role: 'ADMIN',
    } as User;
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },
};