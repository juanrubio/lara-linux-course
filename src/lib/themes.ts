export type ThemeId = 'space' | 'forest' | 'ocean' | 'desert';
export type ThemeMode = 'dark' | 'light';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    success: string;
    error: string;
    warning: string;
    terminalBg: string;
    terminalText: string;
  };
  gradients: {
    hero: string;
    card: string;
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  space: {
    id: 'space',
    name: 'Space Explorer',
    description: 'Journey through the cosmos',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      terminalBg: '#0a0a0a',
      terminalText: '#22c55e',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      card: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Adventure',
    description: 'Explore the enchanted woods',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#f59e0b',
      background: '#14532d',
      surface: '#166534',
      text: '#f0fdf4',
      textMuted: '#86efac',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      terminalBg: '#052e16',
      terminalText: '#4ade80',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #14532d 0%, #1a4d2c 50%, #14532d 100%)',
      card: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Explorer',
    description: 'Dive into the deep blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#fbbf24',
      background: '#0c4a6e',
      surface: '#075985',
      text: '#f0f9ff',
      textMuted: '#7dd3fc',
      success: '#34d399',
      error: '#fb7185',
      warning: '#fcd34d',
      terminalBg: '#082f49',
      terminalText: '#38bdf8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 50%, #0c4a6e 100%)',
      card: 'linear-gradient(135deg, #075985 0%, #0369a1 100%)',
    },
  },
  desert: {
    id: 'desert',
    name: 'Desert Quest',
    description: 'Seek treasures in the sands',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#ef4444',
      background: '#78350f',
      surface: '#92400e',
      text: '#fef3c7',
      textMuted: '#fcd34d',
      success: '#84cc16',
      error: '#dc2626',
      warning: '#fb923c',
      terminalBg: '#451a03',
      terminalText: '#fbbf24',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #78350f 0%, #7c2d12 50%, #78350f 100%)',
      card: 'linear-gradient(135deg, #92400e 0%, #a16207 100%)',
    },
  },
};

export function getTheme(themeId: ThemeId): Theme {
  return THEMES[themeId] || THEMES.space;
}

export function getThemeTokens(theme: Theme, mode: ThemeMode) {
  if (mode === 'dark') {
    return { colors: theme.colors, gradients: theme.gradients };
  }

  const lightColors = {
    ...theme.colors,
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#475569',
  };

  const lightGradients = {
    hero: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
  };

  return { colors: lightColors, gradients: lightGradients };
}

export function getThemeCSSVariables(theme: Theme, mode: ThemeMode = 'dark'): string {
  const { colors, gradients } = getThemeTokens(theme, mode);
  return `
    --color-primary: ${colors.primary};
    --color-secondary: ${colors.secondary};
    --color-accent: ${colors.accent};
    --color-background: ${colors.background};
    --color-surface: ${colors.surface};
    --color-text: ${colors.text};
    --color-text-muted: ${colors.textMuted};
    --color-success: ${colors.success};
    --color-error: ${colors.error};
    --color-warning: ${colors.warning};
    --color-terminal-bg: ${colors.terminalBg};
    --color-terminal-text: ${colors.terminalText};
    --gradient-hero: ${gradients.hero};
    --gradient-card: ${gradients.card};
  `;
}
