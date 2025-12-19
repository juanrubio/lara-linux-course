'use client';

import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useGameStore } from '@/store/gameStore';
import { getTheme, getThemeCSSVariables } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { preferences, sidebarOpen, updateStreak } = useGameStore();
  const theme = getTheme(preferences.theme);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = getThemeCSSVariables(theme);
    const pairs = cssVars
      .split(';')
      .filter((s) => s.trim())
      .map((s) => s.split(':').map((p) => p.trim()));

    pairs.forEach(([key, value]) => {
      if (key && value) {
        root.style.setProperty(key, value);
      }
    });

    // Set background color on body
    document.body.style.backgroundColor = theme.colors.background;
  }, [theme]);

  // Update streak on mount
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.gradients.hero }}
    >
      <Header />
      <Sidebar />
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        {children}
      </main>
    </div>
  );
}
