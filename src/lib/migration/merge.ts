import type {
  GameState,
  ProgressState,
  LessonProgress,
  TrackProgress,
  MergeConflict,
} from './types';
import type { Track } from '@/types';

/**
 * Calculate level from XP (matches gameStore calculation)
 */
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4500, 5700, 7100, 8700, 10500, 12500,
];

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Merge achievements (Union - combine both sets)
 */
export function mergeAchievements(local: string[], imported: string[]): string[] {
  const safeLocal = Array.isArray(local) ? local : [];
  const safeImported = Array.isArray(imported) ? imported : [];
  return Array.from(new Set([...safeLocal, ...safeImported]));
}

/**
 * Merge unique commands (Union)
 */
export function mergeUniqueCommands(local: string[], imported: string[]): string[] {
  const safeLocal = Array.isArray(local) ? local : [];
  const safeImported = Array.isArray(imported) ? imported : [];
  return Array.from(new Set([...safeLocal, ...safeImported]));
}

/**
 * Merge command variations (Deep merge per command)
 */
export function mergeCommandVariations(
  local: Record<string, string[]>,
  imported: Record<string, string[]>
): Record<string, string[]> {
  const merged: Record<string, string[]> = {};
  const safeLocal = local && typeof local === 'object' ? local : {};
  const safeImported = imported && typeof imported === 'object' ? imported : {};

  // Get all command names from both
  const allCommands = new Set([
    ...Object.keys(safeLocal),
    ...Object.keys(safeImported),
  ]);

  // Merge variations for each command
  for (const cmd of allCommands) {
    const localVariations = safeLocal[cmd] || [];
    const importedVariations = safeImported[cmd] || [];
    merged[cmd] = Array.from(new Set([...localVariations, ...importedVariations]));
  }

  return merged;
}

/**
 * Merge lessons (Mark completed if either completed, take best scores)
 */
export function mergeLessons(
  local: Record<string, LessonProgress>,
  imported: Record<string, LessonProgress>
): Record<string, LessonProgress> {
  const merged: Record<string, LessonProgress> = {};
  const safeLocal = local && typeof local === 'object' ? local : {};
  const safeImported = imported && typeof imported === 'object' ? imported : {};

  // Get all lesson IDs from both
  const allLessonIds = new Set([
    ...Object.keys(safeLocal),
    ...Object.keys(safeImported),
  ]);

  for (const lessonId of allLessonIds) {
    const localLesson = safeLocal[lessonId];
    const importedLesson = safeImported[lessonId];

    // If only one side has it, use that
    if (!localLesson) {
      merged[lessonId] = importedLesson;
      continue;
    }
    if (!importedLesson) {
      merged[lessonId] = localLesson;
      continue;
    }

    // Both have it - merge intelligently
    // If completed on either side, mark as completed
    const isCompleted =
      localLesson.status === 'completed' || importedLesson.status === 'completed';

    // Merge exercises completed (union) - handle potentially undefined arrays
    const localExercises = Array.isArray(localLesson.exercisesCompleted) ? localLesson.exercisesCompleted : [];
    const importedExercises = Array.isArray(importedLesson.exercisesCompleted) ? importedLesson.exercisesCompleted : [];
    const exercisesCompleted = Array.from(
      new Set([...localExercises, ...importedExercises])
    );

    // Take best score (handle undefined)
    const bestScore = Math.max(localLesson.bestScore ?? 0, importedLesson.bestScore ?? 0);

    // Sum attempts (handle undefined)
    const attempts = (localLesson.attempts ?? 0) + (importedLesson.attempts ?? 0);

    // Determine status
    let status: LessonProgress['status'];
    if (isCompleted) {
      status = 'completed';
    } else if (localLesson.status === 'in_progress' || importedLesson.status === 'in_progress') {
      status = 'in_progress';
    } else if (localLesson.status === 'available' || importedLesson.status === 'available') {
      status = 'available';
    } else {
      status = 'locked';
    }

    merged[lessonId] = {
      lessonId,
      status,
      exercisesCompleted,
      bestScore,
      attempts,
    };
  }

  return merged;
}

/**
 * Recalculate track progress from lessons
 */
export function recalculateTrackProgress(
  lessons: Record<string, LessonProgress>,
  existingTracks: Record<Track, TrackProgress>
): Record<Track, TrackProgress> {
  const tracks: Record<Track, TrackProgress> = JSON.parse(JSON.stringify(existingTracks));

  // Count completed lessons for each track
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    if (lesson.status !== 'completed') continue;

    // Extract track ID from lesson ID (format: "trackId/lessonSlug")
    const [trackId] = lessonId.split('/');
    if (!tracks[trackId as Track]) continue;

    // Count is done by filtering all lessons for this track
    const completedForTrack = Object.entries(lessons).filter(
      ([id, l]) => id.startsWith(`${trackId}/`) && l.status === 'completed'
    ).length;

    tracks[trackId as Track].lessonsCompleted = completedForTrack;
  }

  return tracks;
}

/**
 * Merge game state
 */
export function mergeGameState(
  local: GameState,
  imported: GameState,
  keepLocalPreferences: boolean = false
): { merged: GameState; conflicts: MergeConflict[] } {
  const conflicts: MergeConflict[] = [];

  // Take maximum XP
  const totalXp = Math.max(local.stats.totalXp, imported.stats.totalXp);
  if (local.stats.totalXp !== imported.stats.totalXp) {
    conflicts.push({
      field: 'stats.totalXp',
      localValue: local.stats.totalXp,
      importedValue: imported.stats.totalXp,
      resolvedValue: totalXp,
      strategy: 'take_maximum',
    });
  }

  // Recalculate level from XP
  const currentLevel = calculateLevel(totalXp);

  // Take maximum streaks
  const currentStreak = Math.max(local.stats.currentStreak, imported.stats.currentStreak);
  const longestStreak = Math.max(local.stats.longestStreak, imported.stats.longestStreak);

  // Take most recent last activity date
  let lastActivityDate = local.stats.lastActivityDate;
  if (
    imported.stats.lastActivityDate &&
    (!lastActivityDate || new Date(imported.stats.lastActivityDate) > new Date(lastActivityDate))
  ) {
    lastActivityDate = imported.stats.lastActivityDate;
  }

  // Sum time spent and total commands
  const totalTimeSpentMinutes =
    local.stats.totalTimeSpentMinutes + imported.stats.totalTimeSpentMinutes;
  const totalCommands = local.stats.totalCommands + imported.stats.totalCommands;

  // Merge unique commands (union)
  const uniqueCommands = mergeUniqueCommands(
    local.stats.uniqueCommands,
    imported.stats.uniqueCommands
  );

  // Merge command variations (deep merge)
  const commandVariations = mergeCommandVariations(
    local.stats.commandVariations,
    imported.stats.commandVariations
  );

  // Merge achievements (union)
  const unlockedAchievements = mergeAchievements(
    local.unlockedAchievements,
    imported.unlockedAchievements
  );
  if (unlockedAchievements.length !== local.unlockedAchievements.length) {
    conflicts.push({
      field: 'unlockedAchievements',
      localValue: local.unlockedAchievements.length,
      importedValue: imported.unlockedAchievements.length,
      resolvedValue: unlockedAchievements.length,
      strategy: 'union',
    });
  }

  // Preferences - use local or imported based on user choice
  const preferences = keepLocalPreferences ? local.preferences : imported.preferences;
  if (keepLocalPreferences) {
    conflicts.push({
      field: 'preferences',
      localValue: 'kept',
      importedValue: 'discarded',
      resolvedValue: 'kept_local',
      strategy: 'user_choice',
    });
  }

  // User info - prefer imported (user might have updated on other device)
  const merged: GameState = {
    userId: imported.userId,
    username: imported.username,
    displayName: imported.displayName,
    avatarId: imported.avatarId,
    stats: {
      totalXp,
      currentLevel,
      currentStreak,
      longestStreak,
      lastActivityDate,
      totalTimeSpentMinutes,
      totalCommands,
      uniqueCommands,
      commandVariations,
    },
    unlockedAchievements,
    preferences,
  };

  return { merged, conflicts };
}

/**
 * Merge progress state
 */
export function mergeProgressState(
  local: ProgressState,
  imported: ProgressState
): { merged: ProgressState; conflicts: MergeConflict[] } {
  const conflicts: MergeConflict[] = [];

  // Merge lessons
  const lessons = mergeLessons(local.lessons, imported.lessons);

  // Count lesson changes
  const localCompleted = Object.values(local.lessons).filter(
    (l) => l.status === 'completed'
  ).length;
  const importedCompleted = Object.values(imported.lessons).filter(
    (l) => l.status === 'completed'
  ).length;
  const mergedCompleted = Object.values(lessons).filter((l) => l.status === 'completed').length;

  if (mergedCompleted !== localCompleted) {
    conflicts.push({
      field: 'lessons',
      localValue: localCompleted,
      importedValue: importedCompleted,
      resolvedValue: mergedCompleted,
      strategy: 'progressive_merge',
    });
  }

  // Merge tracks - start with imported as base, then recalculate
  const baseTracks = { ...imported.tracks };
  const tracks = recalculateTrackProgress(lessons, baseTracks);

  // Current position - use imported (continue where they left off on other device)
  const currentTrack = imported.currentTrack;
  const currentLesson = imported.currentLesson;

  const merged: ProgressState = {
    tracks,
    lessons,
    currentTrack,
    currentLesson,
  };

  return { merged, conflicts };
}

/**
 * Main merge function - combines both stores
 */
export function mergeStates(
  local: { gameState: GameState; progressState: ProgressState },
  imported: { gameState: GameState; progressState: ProgressState },
  keepLocalPreferences: boolean = false
): {
  gameState: GameState;
  progressState: ProgressState;
  conflicts: MergeConflict[];
} {
  const gameResult = mergeGameState(local.gameState, imported.gameState, keepLocalPreferences);
  const progressResult = mergeProgressState(local.progressState, imported.progressState);

  return {
    gameState: gameResult.merged,
    progressState: progressResult.merged,
    conflicts: [...gameResult.conflicts, ...progressResult.conflicts],
  };
}
