// Level System Configuration

export interface LevelInfo {
  level: number;
  xpRequired: number;
  title: string;
  color: string;
  icon: string;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, xpRequired: 0, title: 'Terminal Newbie', color: '#94a3b8', icon: '🌱' },
  { level: 2, xpRequired: 100, title: 'Command Cadet', color: '#22c55e', icon: '🎖️' },
  { level: 3, xpRequired: 250, title: 'File Explorer', color: '#3b82f6', icon: '🗺️' },
  { level: 4, xpRequired: 500, title: 'Script Apprentice', color: '#8b5cf6', icon: '📜' },
  { level: 5, xpRequired: 850, title: 'Code Warrior', color: '#f97316', icon: '⚔️' },
  { level: 6, xpRequired: 1300, title: 'System Navigator', color: '#ef4444', icon: '🧭' },
  { level: 7, xpRequired: 1900, title: 'Terminal Tactician', color: '#eab308', icon: '🎯' },
  { level: 8, xpRequired: 2600, title: 'Bash Baron', color: '#14b8a6', icon: '👑' },
  { level: 9, xpRequired: 3500, title: 'Python Pioneer', color: '#06b6d4', icon: '🐍' },
  { level: 10, xpRequired: 4500, title: 'Linux Legend', color: '#ec4899', icon: '🐧' },
  { level: 11, xpRequired: 5700, title: 'Tech Titan', color: '#8b5cf6', icon: '⚡' },
  { level: 12, xpRequired: 7100, title: 'Code Commander', color: '#f59e0b', icon: '🎖️' },
  { level: 13, xpRequired: 8700, title: 'System Sage', color: '#10b981', icon: '🧙' },
  { level: 14, xpRequired: 10500, title: 'Digital Deity', color: '#6366f1', icon: '✨' },
  { level: 15, xpRequired: 12500, title: 'Master Hacker', color: '#000000', icon: '🏆' },
];

// XP Rewards for various actions
export const XP_REWARDS = {
  // Lessons
  lessonStart: 5,
  lessonComplete: 50,
  lessonPerfect: 25, // No hints used bonus
  firstAttemptSuccess: 15, // Completed on first try

  // Exercises
  exerciseComplete: 10,
  exerciseNoHints: 5,
  exerciseFirstTry: 10,

  // Quests
  questStepComplete: 20,
  questComplete: 100,
  questBonusObjective: 30,

  // Streaks
  dailyLogin: 10,
  streakDay3: 25,
  streakDay7: 75,
  streakDay14: 150,
  streakDay30: 500,
  streakDay100: 2000,

  // Exploration
  newCommandUsed: 5,
  playgroundMinute: 2, // Per minute of free exploration

  // Challenges
  dailyChallengeComplete: 50,
  weeklyChallenge: 200,
};

/**
 * Calculate the current level based on total XP
 */
export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Get level info for a specific level
 */
export function getLevelInfo(level: number): LevelInfo {
  return LEVEL_THRESHOLDS[level - 1] || LEVEL_THRESHOLDS[0];
}

/**
 * Get current level info based on XP
 */
export function getCurrentLevelInfo(totalXp: number): LevelInfo {
  const level = calculateLevel(totalXp);
  return getLevelInfo(level);
}

/**
 * Calculate XP progress towards next level
 */
export function getXpToNextLevel(totalXp: number): {
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  percentage: number;
  isMaxLevel: boolean;
} {
  const currentLevel = calculateLevel(totalXp);
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];

  if (!nextThreshold) {
    // Max level reached
    return {
      currentLevelXp: currentThreshold.xpRequired,
      nextLevelXp: currentThreshold.xpRequired,
      xpIntoLevel: totalXp - currentThreshold.xpRequired,
      xpForLevel: 0,
      percentage: 100,
      isMaxLevel: true,
    };
  }

  const xpIntoLevel = totalXp - currentThreshold.xpRequired;
  const xpForLevel = nextThreshold.xpRequired - currentThreshold.xpRequired;

  return {
    currentLevelXp: currentThreshold.xpRequired,
    nextLevelXp: nextThreshold.xpRequired,
    xpIntoLevel,
    xpForLevel,
    percentage: Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)),
    isMaxLevel: false,
  };
}

/**
 * Calculate streak bonus XP
 */
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 100) return XP_REWARDS.streakDay100;
  if (streakDays >= 30) return XP_REWARDS.streakDay30;
  if (streakDays >= 14) return XP_REWARDS.streakDay14;
  if (streakDays >= 7) return XP_REWARDS.streakDay7;
  if (streakDays >= 3) return XP_REWARDS.streakDay3;
  return XP_REWARDS.dailyLogin;
}

/**
 * Check if user leveled up after gaining XP
 */
export function checkLevelUp(
  previousXp: number,
  newXp: number
): { leveledUp: boolean; newLevel: number; previousLevel: number } {
  const previousLevel = calculateLevel(previousXp);
  const newLevel = calculateLevel(newXp);

  return {
    leveledUp: newLevel > previousLevel,
    newLevel,
    previousLevel,
  };
}

/**
 * Get all levels up to and including the current one
 */
export function getUnlockedLevels(totalXp: number): LevelInfo[] {
  const currentLevel = calculateLevel(totalXp);
  return LEVEL_THRESHOLDS.slice(0, currentLevel);
}
