import type { UserGameStats, UserPreferences } from '@/types';
import type { Track } from '@/types';

/**
 * Backup file format version
 */
export const MIGRATION_VERSION = '1.0.0';
export const SCHEMA_VERSION = 1;

/**
 * Game Store State (from gameStore.ts)
 */
export interface GameState {
  userId: number;
  username: string;
  displayName: string;
  avatarId: string;
  stats: UserGameStats;
  unlockedAchievements: string[];
  preferences: UserPreferences;
  sidebarOpen?: boolean;
  showAchievementPopup?: boolean;
  pendingAchievements?: string[];
  _hasHydrated?: boolean;
}

/**
 * Lesson Progress Data
 */
export interface LessonProgress {
  lessonId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  exercisesCompleted: string[];
  bestScore: number;
  attempts: number;
}

/**
 * Track Progress Data
 */
export interface TrackProgress {
  trackId: Track;
  lessonsCompleted: number;
  totalLessons: number;
  currentLesson: string | null;
}

/**
 * Progress Store State (from progressStore.ts)
 */
export interface ProgressState {
  tracks: Record<Track, TrackProgress>;
  lessons: Record<string, LessonProgress>;
  currentTrack: Track | null;
  currentLesson: string | null;
  _hasHydrated?: boolean;
}

/**
 * Metadata about the backup (for quick preview)
 */
export interface BackupMetadata {
  totalXp: number;
  currentLevel: number;
  achievementsCount: number;
  lessonsCompleted: number;
}

/**
 * Exported user info
 */
export interface ExportedBy {
  userId: number;
  username: string;
  displayName: string;
}

/**
 * Validation info
 */
export interface ValidationInfo {
  checksum: string;
  tracksValidated: Track[];
  achievementsValidated: boolean;
}

/**
 * Complete backup data structure
 */
export interface BackupData {
  version: string;
  schemaVersion: number;
  exportedAt: string; // ISO 8601 timestamp
  exportedBy: ExportedBy;
  metadata: BackupMetadata;
  stores: {
    gameState: GameState;
    progressState: ProgressState;
  };
  validation: ValidationInfo;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

/**
 * Import options
 */
export interface ImportOptions {
  /** Whether to keep current preferences or use imported ones */
  keepPreferences?: boolean;

  /** Whether to perform merge or replace entirely */
  merge?: boolean;

  /** Whether to create a safety backup before import */
  createBackup?: boolean;

  /** Whether to skip validation (dangerous) */
  skipValidation?: boolean;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  error?: MigrationError;
  changes?: ImportChanges;
  safetyBackup?: BackupData;
}

/**
 * Changes that will be applied during import
 */
export interface ImportChanges {
  xpChange: number; // Delta in XP
  levelChange: number; // Delta in level
  newAchievements: number; // Number of new achievements
  newLessonsCompleted: number; // Number of new completed lessons
  preferencesChanged: boolean;
}

/**
 * Migration error types
 */
export enum MigrationErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  VERSION_MISMATCH = 'VERSION_MISMATCH',
  CHECKSUM_FAILED = 'CHECKSUM_FAILED',
  READ_ERROR = 'READ_ERROR',
  IMPORT_FAILED = 'IMPORT_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  MISSING_FIELDS = 'MISSING_FIELDS',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
}

/**
 * Migration error
 */
export interface MigrationError {
  code: MigrationErrorCode;
  message: string;
  action?: string; // Suggested action for user
  details?: any;
}

/**
 * Merge conflicts (if any)
 */
export interface MergeConflict {
  field: string;
  localValue: any;
  importedValue: any;
  resolvedValue: any;
  strategy: string; // e.g., 'take_maximum', 'union', 'user_choice'
}

/**
 * Compare result for preview
 */
export interface ComparisonResult {
  current: {
    level: number;
    xp: number;
    achievements: number;
    lessonsCompleted: number;
  };
  imported: {
    level: number;
    xp: number;
    achievements: number;
    lessonsCompleted: number;
  };
  merged: {
    level: number;
    xp: number;
    achievements: number;
    lessonsCompleted: number;
  };
  conflicts: MergeConflict[];
}
