import { create } from 'zustand';
import Cookie from 'js-cookie';

interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  role: string;
}

import { apiClient } from '@/services/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set: any) => ({
  user: null,
  token: Cookie.get('access_token') || null,
  isLoading: false,
  error: null,

  setUser: (user: any) => set({ user }),
  setToken: (token: any) => {
    if (token) {
      Cookie.set('access_token', token);
    } else {
      Cookie.remove('access_token');
    }
    set({ token });
  },
  setIsLoading: (isLoading: any) => set({ isLoading }),
  setError: (error: any) => set({ error }),

  logout: async () => {
    await apiClient.logout();
    set({ user: null, token: null });
  },

  initialize: () => {
    const token = Cookie.get('access_token');
    if (token) {
      set({ token });
    }
  },
}));
