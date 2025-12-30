import type {
  BackupData,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  MigrationErrorCode,
} from './types';
import { MIGRATION_VERSION, SCHEMA_VERSION } from './types';
import { calculateChecksum } from './export';
import type { Track } from '@/types';

/**
 * Valid track IDs
 */
const VALID_TRACKS: Track[] = ['linux', 'python', 'bash', 'raspberry-pi'];

/**
 * Valid lesson status values
 */
const VALID_LESSON_STATUSES = ['locked', 'available', 'in_progress', 'completed'];

/**
 * Validate track IDs
 */
export function validateTrackIds(tracks: string[]): {
  valid: boolean;
  invalid: string[];
} {
  const invalid = tracks.filter((track) => !VALID_TRACKS.includes(track as Track));
  return {
    valid: invalid.length === 0,
    invalid,
  };
}

/**
 * Validate lesson IDs and structure
 */
export function validateLessonIds(lessons: Record<string, any>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Check lessonId format: should be "trackId/lessonSlug"
    if (!lessonId.includes('/')) {
      errors.push(`Invalid lesson ID format: ${lessonId}`);
      continue;
    }

    const [trackId] = lessonId.split('/');
    if (!VALID_TRACKS.includes(trackId as Track)) {
      errors.push(`Invalid track in lesson ID: ${lessonId}`);
    }

    // Check required fields
    if (!lesson.status || !VALID_LESSON_STATUSES.includes(lesson.status)) {
      errors.push(`Invalid or missing status for lesson: ${lessonId}`);
    }

    if (!Array.isArray(lesson.exercisesCompleted)) {
      errors.push(`Invalid exercisesCompleted for lesson: ${lessonId}`);
    }

    if (typeof lesson.bestScore !== 'number') {
      errors.push(`Invalid bestScore for lesson: ${lessonId}`);
    }

    if (typeof lesson.attempts !== 'number') {
      errors.push(`Invalid attempts for lesson: ${lessonId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate achievement IDs (basic validation - just check format)
 */
export function validateAchievements(achievements: string[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(achievements)) {
    errors.push('Achievements must be an array');
    return { valid: false, errors };
  }

  for (const achievement of achievements) {
    if (typeof achievement !== 'string' || achievement.trim().length === 0) {
      errors.push(`Invalid achievement ID: ${achievement}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize data - remove invalid values, normalize numbers
 */
export function sanitizeData(data: BackupData): BackupData {
  const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone

  // Ensure gameState exists
  if (!sanitized.stores.gameState) {
    sanitized.stores.gameState = {};
  }

  // Ensure stats exists with defaults
  if (!sanitized.stores.gameState.stats) {
    sanitized.stores.gameState.stats = {};
  }

  // Sanitize game stats
  const stats = sanitized.stores.gameState.stats;
  stats.totalXp = Math.max(0, stats.totalXp || 0);
  stats.currentLevel = Math.max(1, stats.currentLevel || 1);
  stats.currentStreak = Math.max(0, stats.currentStreak || 0);
  stats.longestStreak = Math.max(0, stats.longestStreak || 0);
  stats.totalTimeSpentMinutes = Math.max(0, stats.totalTimeSpentMinutes || 0);
  stats.totalCommands = Math.max(0, stats.totalCommands || 0);
  stats.uniqueCommands = Array.isArray(stats.uniqueCommands) ? stats.uniqueCommands : [];
  stats.commandVariations = stats.commandVariations && typeof stats.commandVariations === 'object'
    ? stats.commandVariations
    : {};

  // Sanitize achievements - ensure array and filter out invalid
  const achievements = sanitized.stores.gameState.unlockedAchievements;
  sanitized.stores.gameState.unlockedAchievements = Array.isArray(achievements)
    ? achievements.filter((a: any) => typeof a === 'string' && a.trim().length > 0)
    : [];

  // Ensure progressState exists
  if (!sanitized.stores.progressState) {
    sanitized.stores.progressState = {};
  }

  // Ensure lessons and tracks exist
  if (!sanitized.stores.progressState.lessons || typeof sanitized.stores.progressState.lessons !== 'object') {
    sanitized.stores.progressState.lessons = {};
  }
  if (!sanitized.stores.progressState.tracks || typeof sanitized.stores.progressState.tracks !== 'object') {
    sanitized.stores.progressState.tracks = {};
  }

  // Sanitize lessons - remove invalid, fix numbers
  const lessons = sanitized.stores.progressState.lessons;
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    if (typeof lesson !== 'object' || !lesson) {
      delete lessons[lessonId];
      continue;
    }

    const l = lesson as any;
    l.bestScore = Math.max(0, Math.min(100, l.bestScore || 0));
    l.attempts = Math.max(0, l.attempts || 0);
    l.exercisesCompleted = Array.isArray(l.exercisesCompleted) ? l.exercisesCompleted : [];

    if (!VALID_LESSON_STATUSES.includes(l.status)) {
      l.status = 'available';
    }
  }

  // Sanitize tracks - fix counts
  const tracks = sanitized.stores.progressState.tracks;
  for (const [trackId, track] of Object.entries(tracks)) {
    if (typeof track !== 'object' || !track) {
      continue;
    }

    const t = track as any;
    t.lessonsCompleted = Math.max(0, t.lessonsCompleted || 0);
    t.totalLessons = Math.max(0, t.totalLessons || 0);
  }

  return sanitized;
}

/**
 * Check version compatibility
 */
export function checkCompatibility(version: string, schemaVersion: number): {
  compatible: boolean;
  error?: string;
} {
  // Check schema version
  if (schemaVersion > SCHEMA_VERSION) {
    return {
      compatible: false,
      error: 'This backup was created with a newer version of CodeQuest. Please update your app.',
    };
  }

  // For now, all schema v1 backups are compatible
  // In future, we might need migration logic for older schemas
  if (schemaVersion < SCHEMA_VERSION) {
    console.warn('[Migration] Backup uses older schema, may require migration');
  }

  return { compatible: true };
}

/**
 * Validate complete backup structure
 */
export async function validateBackup(data: BackupData): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required top-level fields
  if (!data.version) {
    errors.push({
      code: 'MISSING_FIELDS',
      message: 'Missing version field',
      field: 'version',
    });
  }

  if (typeof data.schemaVersion !== 'number') {
    errors.push({
      code: 'MISSING_FIELDS',
      message: 'Missing or invalid schemaVersion',
      field: 'schemaVersion',
    });
  }

  if (!data.exportedAt) {
    errors.push({
      code: 'MISSING_FIELDS',
      message: 'Missing exportedAt timestamp',
      field: 'exportedAt',
    });
  }

  if (!data.stores || !data.stores.gameState || !data.stores.progressState) {
    errors.push({
      code: 'MISSING_FIELDS',
      message: 'Missing stores data',
      field: 'stores',
    });
    // Can't continue validation without stores
    return { valid: false, errors, warnings };
  }

  // Check version compatibility
  const compatibility = checkCompatibility(data.version, data.schemaVersion);
  if (!compatibility.compatible) {
    errors.push({
      code: 'VERSION_MISMATCH',
      message: compatibility.error || 'Version incompatible',
    });
    return { valid: false, errors, warnings };
  }

  // Verify checksum
  if (data.validation?.checksum) {
    try {
      const calculatedChecksum = await calculateChecksum(data.stores);
      if (calculatedChecksum !== data.validation.checksum) {
        warnings.push({
          code: 'CHECKSUM_FAILED',
          message: 'Checksum mismatch - backup file may be corrupted',
        });
      }
    } catch (error) {
      warnings.push({
        code: 'CHECKSUM_FAILED',
        message: 'Could not verify checksum',
      });
    }
  }

  // Validate tracks
  const tracks = Object.keys(data.stores.progressState.tracks);
  const trackValidation = validateTrackIds(tracks);
  if (!trackValidation.valid) {
    warnings.push({
      code: 'INVALID_TRACKS',
      message: `Unknown tracks found: ${trackValidation.invalid.join(', ')}`,
    });
  }

  // Validate lessons
  const lessonValidation = validateLessonIds(data.stores.progressState.lessons);
  if (!lessonValidation.valid) {
    for (const error of lessonValidation.errors) {
      warnings.push({
        code: 'INVALID_LESSONS',
        message: error,
      });
    }
  }

  // Validate achievements
  const achievementValidation = validateAchievements(
    data.stores.gameState.unlockedAchievements
  );
  if (!achievementValidation.valid) {
    for (const error of achievementValidation.errors) {
      warnings.push({
        code: 'INVALID_ACHIEVEMENTS',
        message: error,
      });
    }
  }

  // Check for negative values
  const stats = data.stores.gameState.stats;
  if (stats.totalXp < 0 || stats.currentLevel < 1 || stats.totalCommands < 0) {
    warnings.push({
      code: 'INVALID_VALUES',
      message: 'Found negative or invalid stat values',
    });
  }

  // File size check (warn if > 5MB)
  const jsonSize = JSON.stringify(data).length;
  if (jsonSize > 5 * 1024 * 1024) {
    warnings.push({
      code: 'LARGE_FILE',
      message: `Backup file is large (${(jsonSize / 1024 / 1024).toFixed(2)} MB)`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
