import type {
  BackupData,
  ImportResult,
  ImportOptions,
  ImportChanges,
  ComparisonResult,
  GameState,
  ProgressState,
  MigrationErrorCode,
} from './types';
import { validateBackup, sanitizeData } from './validation';
import { mergeStates } from './merge';
import { exportProgress } from './export';

/**
 * Read current state from localStorage
 */
function readFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    return parsed.state || parsed;
  } catch (error) {
    console.error(`Failed to read from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Write state to localStorage (format for Zustand persist)
 */
function writeToLocalStorage(key: string, state: any): void {
  try {
    // Zustand persist format: { state: {...}, version: 0 }
    const data = {
      state,
      version: 0,
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to write to localStorage (${key}):`, error);
    throw error;
  }
}

/**
 * Parse backup file from File object
 */
export async function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Calculate changes that will be applied
 */
export function calculateChanges(
  current: { gameState: GameState; progressState: ProgressState },
  merged: { gameState: GameState; progressState: ProgressState }
): ImportChanges {
  const xpChange = merged.gameState.stats.totalXp - current.gameState.stats.totalXp;
  const levelChange = merged.gameState.stats.currentLevel - current.gameState.stats.currentLevel;

  const newAchievements =
    merged.gameState.unlockedAchievements.length -
    current.gameState.unlockedAchievements.length;

  const currentCompleted = Object.values(current.progressState.lessons).filter(
    (l) => l.status === 'completed'
  ).length;
  const mergedCompleted = Object.values(merged.progressState.lessons).filter(
    (l) => l.status === 'completed'
  ).length;
  const newLessonsCompleted = mergedCompleted - currentCompleted;

  const preferencesChanged =
    JSON.stringify(current.gameState.preferences) !==
    JSON.stringify(merged.gameState.preferences);

  return {
    xpChange,
    levelChange,
    newAchievements,
    newLessonsCompleted,
    preferencesChanged,
  };
}

/**
 * Create comparison for preview
 */
export function createComparison(
  current: { gameState: GameState; progressState: ProgressState },
  imported: BackupData,
  merged: { gameState: GameState; progressState: ProgressState; conflicts: any[] }
): ComparisonResult {
  const currentCompleted = Object.values(current.progressState.lessons).filter(
    (l) => l.status === 'completed'
  ).length;

  const importedCompleted = Object.values(imported.stores.progressState.lessons).filter(
    (l) => l.status === 'completed'
  ).length;

  const mergedCompleted = Object.values(merged.progressState.lessons).filter(
    (l) => l.status === 'completed'
  ).length;

  return {
    current: {
      level: current.gameState.stats.currentLevel,
      xp: current.gameState.stats.totalXp,
      achievements: current.gameState.unlockedAchievements.length,
      lessonsCompleted: currentCompleted,
    },
    imported: {
      level: imported.metadata.currentLevel,
      xp: imported.metadata.totalXp,
      achievements: imported.metadata.achievementsCount,
      lessonsCompleted: importedCompleted,
    },
    merged: {
      level: merged.gameState.stats.currentLevel,
      xp: merged.gameState.stats.totalXp,
      achievements: merged.gameState.unlockedAchievements.length,
      lessonsCompleted: mergedCompleted,
    },
    conflicts: merged.conflicts,
  };
}

/**
 * Import progress from backup file
 */
export async function importProgress(
  file: File,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const {
    keepPreferences = false,
    merge = true,
    createBackup = true,
    skipValidation = false,
  } = options;

  let safetyBackup: BackupData | undefined;

  try {
    // Parse file
    const backupData = await parseBackupFile(file);

    // Validate unless skipped
    if (!skipValidation) {
      const validation = await validateBackup(backupData);

      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED' as MigrationErrorCode,
            message: 'Backup file validation failed',
            action: 'Please ensure you selected a valid CodeQuest backup file',
            details: validation.errors,
          },
        };
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('[Migration] Validation warnings:', validation.warnings);
      }
    }

    // Sanitize data
    const sanitized = sanitizeData(backupData);

    // Read current state
    const currentGame = readFromLocalStorage<GameState>('codequest-game-state');
    const currentProgress = readFromLocalStorage<ProgressState>('codequest-progress');

    if (!currentGame || !currentProgress) {
      return {
        success: false,
        error: {
          code: 'READ_ERROR' as MigrationErrorCode,
          message: 'Failed to read current progress',
          action: 'Please try reloading the page',
        },
      };
    }

    // Create safety backup if requested
    if (createBackup) {
      try {
        safetyBackup = await exportProgress();
        // Store in sessionStorage as emergency backup
        sessionStorage.setItem('codequest-safety-backup', JSON.stringify(safetyBackup));
      } catch (error) {
        console.warn('[Migration] Could not create safety backup:', error);
      }
    }

    let finalGameState: GameState;
    let finalProgressState: ProgressState;

    if (merge) {
      // Perform merge
      const mergeResult = mergeStates(
        { gameState: currentGame, progressState: currentProgress },
        sanitized.stores,
        keepPreferences
      );

      finalGameState = mergeResult.gameState;
      finalProgressState = mergeResult.progressState;

      console.log('[Migration] Merge complete:', {
        conflicts: mergeResult.conflicts.length,
        xp: finalGameState.stats.totalXp,
        level: finalGameState.stats.currentLevel,
        achievements: finalGameState.unlockedAchievements.length,
      });
    } else {
      // Replace entirely
      finalGameState = sanitized.stores.gameState;
      finalProgressState = sanitized.stores.progressState;
    }

    // Calculate changes
    const changes = calculateChanges(
      { gameState: currentGame, progressState: currentProgress },
      { gameState: finalGameState, progressState: finalProgressState }
    );

    // Write to localStorage
    writeToLocalStorage('codequest-game-state', finalGameState);
    writeToLocalStorage('codequest-progress', finalProgressState);

    console.log('[Migration] Import successful:', changes);

    // Trigger page reload to rehydrate stores
    // This is the safest way to ensure Zustand picks up the new state
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    return {
      success: true,
      changes,
      safetyBackup,
    };
  } catch (error: any) {
    console.error('[Migration] Import failed:', error);

    // Try to rollback if we have safety backup
    if (safetyBackup) {
      try {
        writeToLocalStorage('codequest-game-state', safetyBackup.stores.gameState);
        writeToLocalStorage('codequest-progress', safetyBackup.stores.progressState);
        console.log('[Migration] Rolled back to safety backup');
      } catch (rollbackError) {
        console.error('[Migration] Rollback failed:', rollbackError);
      }
    }

    return {
      success: false,
      error: {
        code: 'IMPORT_FAILED' as MigrationErrorCode,
        message: error.message || 'Import failed',
        action: 'Your original data has been preserved. Please try again.',
        details: error,
      },
      safetyBackup,
    };
  }
}

/**
 * Preview import without applying changes
 * Useful for showing comparison dialog
 */
export async function previewImport(
  file: File,
  keepPreferences: boolean = false
): Promise<{
  success: boolean;
  comparison?: ComparisonResult;
  error?: any;
}> {
  try {
    // Parse and validate
    const backupData = await parseBackupFile(file);
    const validation = await validateBackup(backupData);

    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Backup file validation failed',
          errors: validation.errors,
        },
      };
    }

    // Sanitize
    const sanitized = sanitizeData(backupData);

    // Read current state
    const currentGame = readFromLocalStorage<GameState>('codequest-game-state');
    const currentProgress = readFromLocalStorage<ProgressState>('codequest-progress');

    if (!currentGame || !currentProgress) {
      return {
        success: false,
        error: { message: 'Failed to read current state' },
      };
    }

    // Perform merge (without saving)
    const mergeResult = mergeStates(
      { gameState: currentGame, progressState: currentProgress },
      sanitized.stores,
      keepPreferences
    );

    // Create comparison
    const comparison = createComparison(
      { gameState: currentGame, progressState: currentProgress },
      sanitized,
      mergeResult
    );

    return {
      success: true,
      comparison,
    };
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || 'Preview failed' },
    };
  }
}
