'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, initializeTheme } = useThemeStore();

    useEffect(() => {
        // Initialize theme on mount
        initializeTheme();
    }, [initializeTheme]);

    useEffect(() => {
        // Apply theme class to document element
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return <>{children}</>;
}
