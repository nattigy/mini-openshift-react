'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/services/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    initialize();

    // Fetch current user if token exists
    const fetchUser = async () => {
      if (token) {
        try {
          const user = await apiClient.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
        }
      }
    };

    fetchUser();
  }, [token, initialize, setUser]);

  return <>{children}</>;
}
