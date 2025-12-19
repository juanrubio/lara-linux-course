import type { AchievementDefinition, AchievementCategory, AchievementRarity } from '@/types';

// Achievement Definitions
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ==================== SKILL ACHIEVEMENTS ====================
  {
    id: 'first_command',
    name: 'Hello, Terminal!',
    description: 'Run your first command',
    icon: '👋',
    category: 'skill',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'command_count', value: 1 },
  },
  {
    id: 'ten_commands',
    name: 'Getting the Hang of It',
    description: 'Run 10 commands',
    icon: '🔟',
    category: 'skill',
    rarity: 'common',
    xpReward: 30,
    condition: { type: 'command_count', value: 10 },
  },
  {
    id: 'hundred_commands',
    name: 'Command Master',
    description: 'Run 100 commands',
    icon: '💯',
    category: 'skill',
    rarity: 'uncommon',
    xpReward: 75,
    condition: { type: 'command_count', value: 100 },
  },
  {
    id: 'thousand_commands',
    name: 'Terminal Warrior',
    description: 'Run 1000 commands',
    icon: '⚔️',
    category: 'skill',
    rarity: 'rare',
    xpReward: 200,
    condition: { type: 'command_count', value: 1000 },
  },
  {
    id: 'ls_master',
    name: 'List Master',
    description: 'Use ls with 5 different flag combinations',
    icon: '📋',
    category: 'skill',
    rarity: 'uncommon',
    xpReward: 50,
    condition: { type: 'command_variation', command: 'ls', variations: 5 },
  },
  {
    id: 'grep_guru',
    name: 'Search Guru',
    description: 'Use grep successfully 20 times',
    icon: '🔍',
    category: 'skill',
    rarity: 'uncommon',
    xpReward: 60,
    condition: { type: 'command_count', command: 'grep', value: 20 },
  },
  {
    id: 'first_script',
    name: 'Script Starter',
    description: 'Write and run your first Bash script',
    icon: '📜',
    category: 'skill',
    rarity: 'uncommon',
    xpReward: 75,
    condition: { type: 'task_complete', taskId: 'bash_first_script' },
  },
  {
    id: 'python_hello',
    name: 'Pythonista',
    description: 'Run your first Python program',
    icon: '🐍',
    category: 'skill',
    rarity: 'common',
    xpReward: 25,
    condition: { type: 'task_complete', taskId: 'python_hello_world' },
  },
  {
    id: 'python_function',
    name: 'Function Creator',
    description: 'Create your first Python function',
    icon: '🔧',
    category: 'skill',
    rarity: 'uncommon',
    xpReward: 50,
    condition: { type: 'task_complete', taskId: 'python_first_function' },
  },
  {
    id: 'file_creator',
    name: 'File Creator',
    description: 'Create 10 files using touch or scripts',
    icon: '📄',
    category: 'skill',
    rarity: 'common',
    xpReward: 30,
    condition: { type: 'command_count', command: 'touch', value: 10 },
  },
  {
    id: 'directory_architect',
    name: 'Directory Architect',
    description: 'Create 10 directories',
    icon: '📁',
    category: 'skill',
    rarity: 'common',
    xpReward: 30,
    condition: { type: 'command_count', command: 'mkdir', value: 10 },
  },

  // ==================== STREAK ACHIEVEMENTS ====================
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    xpReward: 50,
    condition: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    rarity: 'uncommon',
    xpReward: 100,
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Practice for 14 days in a row',
    icon: '🌟',
    category: 'streak',
    rarity: 'rare',
    xpReward: 200,
    condition: { type: 'streak', value: 14 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Practice for 30 days in a row',
    icon: '🏆',
    category: 'streak',
    rarity: 'epic',
    xpReward: 500,
    condition: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Practice for 100 days in a row',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    xpReward: 2000,
    condition: { type: 'streak', value: 100 },
  },

  // ==================== EXPLORATION ACHIEVEMENTS ====================
  {
    id: 'explorer_25',
    name: 'Curious Cat',
    description: 'Try 25 different commands',
    icon: '🐱',
    category: 'exploration',
    rarity: 'common',
    xpReward: 40,
    condition: { type: 'unique_commands', value: 25 },
  },
  {
    id: 'explorer_50',
    name: 'Command Explorer',
    description: 'Try 50 different commands',
    icon: '🗺️',
    category: 'exploration',
    rarity: 'uncommon',
    xpReward: 75,
    condition: { type: 'unique_commands', value: 50 },
  },
  {
    id: 'explorer_100',
    name: 'Terminal Adventurer',
    description: 'Try 100 different commands',
    icon: '🧭',
    category: 'exploration',
    rarity: 'rare',
    xpReward: 150,
    condition: { type: 'unique_commands', value: 100 },
  },
  {
    id: 'playground_10',
    name: 'Playground Fan',
    description: 'Spend 10 minutes in the playground',
    icon: '🎮',
    category: 'exploration',
    rarity: 'common',
    xpReward: 30,
    condition: { type: 'playground_time', value: 10 },
  },
  {
    id: 'playground_hour',
    name: 'Free Thinker',
    description: 'Spend 1 hour in the playground',
    icon: '🎯',
    category: 'exploration',
    rarity: 'uncommon',
    xpReward: 75,
    condition: { type: 'playground_time', value: 60 },
  },

  // ==================== CHALLENGE ACHIEVEMENTS ====================
  {
    id: 'linux_track_complete',
    name: 'Linux Graduate',
    description: 'Complete all Linux lessons',
    icon: '🐧',
    category: 'challenge',
    rarity: 'epic',
    xpReward: 500,
    condition: { type: 'track_complete', trackId: 'linux' },
  },
  {
    id: 'python_track_complete',
    name: 'Python Master',
    description: 'Complete all Python lessons',
    icon: '🐍',
    category: 'challenge',
    rarity: 'epic',
    xpReward: 500,
    condition: { type: 'track_complete', trackId: 'python' },
  },
  {
    id: 'bash_track_complete',
    name: 'Bash Wizard',
    description: 'Complete all Bash lessons',
    icon: '🧙',
    category: 'challenge',
    rarity: 'epic',
    xpReward: 400,
    condition: { type: 'track_complete', trackId: 'bash' },
  },
  {
    id: 'pi_track_complete',
    name: 'Pi Pioneer',
    description: 'Complete all Raspberry Pi projects',
    icon: '🍓',
    category: 'challenge',
    rarity: 'epic',
    xpReward: 600,
    condition: { type: 'track_complete', trackId: 'raspberry-pi' },
  },
  {
    id: 'all_tracks_complete',
    name: 'CodeQuest Champion',
    description: 'Complete all learning tracks',
    icon: '🏅',
    category: 'challenge',
    rarity: 'legendary',
    xpReward: 2000,
    condition: { type: 'task_complete', taskId: 'all_tracks_complete' },
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    category: 'challenge',
    rarity: 'uncommon',
    xpReward: 50,
    condition: { type: 'level_reached', value: 5 },
  },
  {
    id: 'level_10',
    name: 'Legend in Making',
    description: 'Reach Level 10',
    icon: '🌟',
    category: 'challenge',
    rarity: 'rare',
    xpReward: 150,
    condition: { type: 'level_reached', value: 10 },
  },
  {
    id: 'level_15',
    name: 'Maximum Power',
    description: 'Reach Level 15 (Max Level)',
    icon: '💫',
    category: 'challenge',
    rarity: 'legendary',
    xpReward: 500,
    condition: { type: 'level_reached', value: 15 },
  },

  // ==================== SECRET ACHIEVEMENTS ====================
  {
    id: 'cowsay_secret',
    name: 'Moo!',
    description: 'Discover the cowsay command',
    icon: '🐄',
    category: 'secret',
    rarity: 'rare',
    xpReward: 100,
    condition: { type: 'command_used', command: 'cowsay' },
    secret: true,
  },
  {
    id: 'figlet_secret',
    name: 'ASCII Artist',
    description: 'Create ASCII art with figlet',
    icon: '🎨',
    category: 'secret',
    rarity: 'rare',
    xpReward: 100,
    condition: { type: 'command_used', command: 'figlet' },
    secret: true,
  },
  {
    id: 'sl_secret',
    name: 'Choo Choo!',
    description: 'Watch a steam locomotive',
    icon: '🚂',
    category: 'secret',
    rarity: 'rare',
    xpReward: 100,
    condition: { type: 'command_used', command: 'sl' },
    secret: true,
  },
  {
    id: 'fortune_secret',
    name: 'Fortune Teller',
    description: 'Get your fortune told',
    icon: '🔮',
    category: 'secret',
    rarity: 'rare',
    xpReward: 100,
    condition: { type: 'command_used', command: 'fortune' },
    secret: true,
  },
  {
    id: 'midnight_coder',
    name: 'Midnight Coder',
    description: 'Practice coding after midnight',
    icon: '🌙',
    category: 'secret',
    rarity: 'uncommon',
    xpReward: 50,
    condition: { type: 'task_complete', taskId: 'midnight_session' },
    secret: true,
  },
];

// Helper functions
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(
  category: AchievementCategory
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getAchievementsByRarity(rarity: AchievementRarity): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

export function getVisibleAchievements(): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => !a.secret);
}

export function getSecretAchievements(): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.secret);
}

export function getTotalAchievements(): number {
  return ACHIEVEMENTS.length;
}

export function getTotalXpFromAchievements(): number {
  return ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
}
