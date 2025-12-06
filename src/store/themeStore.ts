import { create } from 'zustand';

interface ThemeStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',

  setTheme: (theme: 'light' | 'dark') => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist to localStorage
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Persist to localStorage
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    });
  },

  initializeTheme: () => {
    // Check localStorage only - ignore system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      // Use saved preference
      set({ theme: savedTheme });
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to light mode (independent of system preference)
      set({ theme: 'light' });
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  },
}));
