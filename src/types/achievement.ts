export type AchievementCategory = 'skill' | 'streak' | 'exploration' | 'challenge' | 'secret';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface AchievementCondition {
  type:
    | 'command_count'
    | 'command_variation'
    | 'task_complete'
    | 'streak'
    | 'unique_commands'
    | 'playground_time'
    | 'command_used'
    | 'lesson_complete'
    | 'track_complete'
    | 'level_reached'
    | 'xp_earned';
  value?: number;
  command?: string;
  variations?: number;
  taskId?: string;
  trackId?: string;
  lessonSlug?: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  condition: AchievementCondition;
  secret?: boolean; // Hidden until earned
}

export interface EarnedAchievement {
  achievement: AchievementDefinition;
  earnedAt: Date;
  notified: boolean;
}

// Rarity multipliers for XP
export const RARITY_MULTIPLIERS: Record<AchievementRarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 5,
};

// Rarity colors for UI
export const RARITY_COLORS: Record<AchievementRarity, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  uncommon: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' },
  rare: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-400' },
  epic: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-400' },
  legendary: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-400' },
};
