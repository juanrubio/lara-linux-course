import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeId } from '@/lib/themes';
import type { UserPreferences, UserGameStats } from '@/types';

interface GameState {
  // User info
  userId: number;
  username: string;
  displayName: string;
  avatarId: string;

  // Stats
  stats: UserGameStats;

  // Convenience getters (derived from stats)
  currentLevel: number;
  totalXp: number;
  currentStreak: number;

  // Achievements
  unlockedAchievements: string[];

  // Preferences
  preferences: UserPreferences;

  // UI State
  sidebarOpen: boolean;
  showAchievementPopup: boolean;
  pendingAchievements: string[];

  // Actions
  setUsername: (username: string) => void;
  setDisplayName: (displayName: string) => void;
  setAvatarId: (avatarId: string) => void;
  updateStats: (stats: Partial<UserGameStats>) => void;
  addXp: (amount: number) => void;
  addXP: (amount: number) => void; // Alias for addXp
  updateStreak: () => void;
  setTheme: (theme: ThemeId) => void;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleSidebar: () => void;
  showAchievement: (achievementId: string) => void;
  dismissAchievement: () => void;
  unlockAchievement: (achievementId: string) => void;
  reset: () => void;
  resetProgress: () => void; // Alias for reset
}

const initialStats: UserGameStats = {
  totalXp: 0,
  currentLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  totalTimeSpentMinutes: 0,
};

const initialPreferences: UserPreferences = {
  theme: 'space',
  soundEnabled: true,
  notificationsEnabled: true,
  animationsEnabled: true,
  darkMode: false,
  terminalFontSize: 14,
  showHints: true,
  difficulty: 'normal',
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4500, 5700, 7100, 8700, 10500, 12500
];

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      userId: 1,
      username: 'lara',
      displayName: 'Lara Rubio-Punal',
      avatarId: 'default',
      stats: initialStats,

      // Convenience getters
      get currentLevel() {
        return get().stats.currentLevel;
      },
      get totalXp() {
        return get().stats.totalXp;
      },
      get currentStreak() {
        return get().stats.currentStreak;
      },

      // Achievements
      unlockedAchievements: [],

      preferences: initialPreferences,
      sidebarOpen: true,
      showAchievementPopup: false,
      pendingAchievements: [],

      setUsername: (username) => set({ username }),

      setDisplayName: (displayName) => set({ displayName }),

      setAvatarId: (avatarId) => set({ avatarId }),

      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        })),

      addXp: (amount) =>
        set((state) => {
          const newTotalXp = state.stats.totalXp + amount;
          const newLevel = calculateLevel(newTotalXp);
          return {
            stats: {
              ...state.stats,
              totalXp: newTotalXp,
              currentLevel: newLevel,
            },
          };
        }),

      // Alias for addXp (different casing convention)
      addXP: (amount) => get().addXp(amount),

      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastActivity = state.stats.lastActivityDate;

          let newStreak = state.stats.currentStreak;

          if (!lastActivity) {
            newStreak = 1;
          } else {
            const lastDate = new Date(lastActivity);
            const todayDate = new Date(today);
            const diffDays = Math.floor(
              (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 0) {
              // Same day, no change
            } else if (diffDays === 1) {
              newStreak = state.stats.currentStreak + 1;
            } else {
              newStreak = 1; // Reset streak
            }
          }

          return {
            stats: {
              ...state.stats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.stats.longestStreak),
              lastActivityDate: today,
            },
          };
        }),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      showAchievement: (achievementId) =>
        set((state) => ({
          showAchievementPopup: true,
          pendingAchievements: [...state.pendingAchievements, achievementId],
        })),

      dismissAchievement: () =>
        set((state) => ({
          showAchievementPopup: state.pendingAchievements.length > 1,
          pendingAchievements: state.pendingAchievements.slice(1),
        })),

      unlockAchievement: (achievementId) =>
        set((state) => {
          if (state.unlockedAchievements.includes(achievementId)) {
            return state; // Already unlocked
          }
          return {
            unlockedAchievements: [...state.unlockedAchievements, achievementId],
          };
        }),

      reset: () =>
        set({
          stats: initialStats,
          preferences: initialPreferences,
          pendingAchievements: [],
          showAchievementPopup: false,
          unlockedAchievements: [],
        }),

      // Alias for reset
      resetProgress: () => get().reset(),
    }),
    {
      name: 'codequest-game-state',
    }
  )
);

// Selectors
export const selectXpProgress = (state: GameState) => {
  const currentLevel = state.stats.currentLevel;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const xpIntoLevel = state.stats.totalXp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;

  return {
    current: xpIntoLevel,
    required: xpForLevel,
    percentage: Math.round((xpIntoLevel / xpForLevel) * 100),
  };
};
