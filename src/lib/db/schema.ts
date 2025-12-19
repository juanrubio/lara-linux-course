import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique().default('Lara'),
  displayName: text('display_name').default('Space Cadet'),
  avatarId: text('avatar_id').default('default'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  lastLogin: integer('last_login', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// User stats (XP, levels, streaks)
export const userStats = sqliteTable('user_stats', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  totalXp: integer('total_xp').default(0),
  currentLevel: integer('current_level').default(1),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: text('last_activity_date'),
  totalTimeSpentMinutes: integer('total_time_spent_minutes').default(0),
});

// Learning track progress
export const trackProgress = sqliteTable('track_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  trackId: text('track_id').notNull(), // 'linux', 'raspberry-pi', 'python', 'bash'
  lessonsCompleted: integer('lessons_completed').default(0),
  totalLessons: integer('total_lessons').notNull(),
  percentageComplete: real('percentage_complete').default(0),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Individual lesson progress
export const lessonProgress = sqliteTable('lesson_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  trackId: text('track_id').notNull(),
  lessonSlug: text('lesson_slug').notNull(),
  status: text('status').default('locked'), // 'locked', 'available', 'in_progress', 'completed'
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  attempts: integer('attempts').default(0),
  bestScore: integer('best_score').default(0),
});

// Exercise completion
export const exerciseProgress = sqliteTable('exercise_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  lessonId: integer('lesson_id').references(() => lessonProgress.id),
  exerciseId: text('exercise_id').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  attempts: integer('attempts').default(0),
  hintsUsed: integer('hints_used').default(0),
  solutionViewed: integer('solution_viewed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  userSolution: text('user_solution'),
});

// Achievement definitions
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category').notNull(), // 'skill', 'streak', 'exploration', 'challenge', 'secret'
  xpReward: integer('xp_reward').default(0),
  rarity: text('rarity').default('common'), // 'common', 'uncommon', 'rare', 'epic', 'legendary'
});

// User achievements (earned badges)
export const userAchievements = sqliteTable('user_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  achievementId: text('achievement_id').references(() => achievements.id),
  earnedAt: integer('earned_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  notified: integer('notified', { mode: 'boolean' }).default(false),
});

// Quest definitions
export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
  chapter: integer('chapter').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  storylineText: text('storyline_text'),
  prerequisites: text('prerequisites'), // JSON array of quest IDs
  requiredSkills: text('required_skills'), // JSON array of {track, lesson}
  xpReward: integer('xp_reward').default(0),
  badgeReward: text('badge_reward').references(() => achievements.id),
});

// Quest progress
export const questProgress = sqliteTable('quest_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  questId: text('quest_id').references(() => quests.id),
  status: text('status').default('locked'), // 'locked', 'available', 'in_progress', 'completed'
  currentStep: integer('current_step').default(0),
  totalSteps: integer('total_steps').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Quest steps
export const questSteps = sqliteTable('quest_steps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questId: text('quest_id').references(() => quests.id),
  stepNumber: integer('step_number').notNull(),
  taskType: text('task_type').notNull(), // 'command', 'file_create', 'code_write', 'quiz'
  taskDescription: text('task_description').notNull(),
  validationRule: text('validation_rule').notNull(), // JSON validation config
  hint: text('hint'),
});

// Daily challenges
export const dailyChallenges = sqliteTable('daily_challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  challengeDate: text('challenge_date').unique(),
  challengeType: text('challenge_type').notNull(),
  challengeData: text('challenge_data').notNull(), // JSON
  xpReward: integer('xp_reward').default(50),
});

// Daily challenge progress
export const dailyChallengeProgress = sqliteTable('daily_challenge_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  challengeId: integer('challenge_id').references(() => dailyChallenges.id),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Command history (for learning analytics)
export const commandHistory = sqliteTable('command_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  command: text('command').notNull(),
  output: text('output'),
  success: integer('success', { mode: 'boolean' }),
  context: text('context'), // Which lesson/quest
  executedAt: integer('executed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// User settings
export const userSettings = sqliteTable('user_settings', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  theme: text('theme').default('space'), // 'space', 'forest', 'ocean', 'desert'
  soundEnabled: integer('sound_enabled', { mode: 'boolean' }).default(true),
  terminalFontSize: integer('terminal_font_size').default(14),
  showHints: integer('show_hints', { mode: 'boolean' }).default(true),
  difficulty: text('difficulty').default('normal'), // 'easy', 'normal', 'challenge'
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type TrackProgress = typeof trackProgress.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Quest = typeof quests.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
