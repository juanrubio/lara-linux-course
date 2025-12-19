export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  avatarId: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserGameStats {
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalTimeSpentMinutes: number;
}

export interface UserProgress {
  profile: UserProfile;
  stats: UserGameStats;
  tracks: TrackProgressSummary[];
  recentAchievements: RecentAchievement[];
  activeQuest: ActiveQuest | null;
}

export interface TrackProgressSummary {
  trackId: string;
  trackName: string;
  lessonsCompleted: number;
  totalLessons: number;
  percentageComplete: number;
  isUnlocked: boolean;
}

export interface RecentAchievement {
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
}

export interface ActiveQuest {
  questId: string;
  title: string;
  currentStep: number;
  totalSteps: number;
}

export interface UserPreferences {
  theme: 'space' | 'forest' | 'ocean' | 'desert';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  animationsEnabled: boolean;
  darkMode: boolean;
  terminalFontSize: number;
  showHints: boolean;
  difficulty: 'easy' | 'normal' | 'challenge';
}
