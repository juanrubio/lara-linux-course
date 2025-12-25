'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AchievementPopup } from '@/components/gamification';
import { useGameStore } from '@/store/gameStore';
import { getTheme, getThemeCSSVariables, getThemeTokens } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { preferences, sidebarOpen, updateStreak } = useGameStore();
  const theme = getTheme(preferences.theme);
  const themeMode = preferences.darkMode ? 'dark' : 'light';
  const themeTokens = getThemeTokens(theme, themeMode);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = getThemeCSSVariables(theme, themeMode);
    const pairs = cssVars
      .split(';')
      .filter((s) => s.trim())
      .map((s) => s.split(':').map((p) => p.trim()));

    pairs.forEach(([key, value]) => {
      if (key && value) {
        root.style.setProperty(key, value);
      }
    });

    root.classList.toggle('dark', preferences.darkMode);
    root.dataset.motion = preferences.animationsEnabled ? 'on' : 'off';

    // Set background color on body
    document.body.style.backgroundColor = themeTokens.colors.background;
  }, [preferences.animationsEnabled, preferences.darkMode, theme, themeMode, themeTokens.colors.background]);

  // Update streak on mount
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <MotionConfig reducedMotion={preferences.animationsEnabled ? 'never' : 'always'}>
      <div
        className="min-h-screen"
        style={{ background: themeTokens.gradients.hero }}
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
        <AchievementPopup />
      </div>
    </MotionConfig>
  );
}
