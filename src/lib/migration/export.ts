import type {
  BackupData,
  GameState,
  ProgressState,
  ExportedBy,
  BackupMetadata,
  ValidationInfo,
} from './types';
import { MIGRATION_VERSION, SCHEMA_VERSION } from './types';

/**
 * Calculate SHA-256 checksum of an object
 */
export async function calculateChecksum(obj: any): Promise<string> {
  const str = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // Use Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Generate timestamped filename for backup
 */
export function generateFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  return `codequest-backup-${timestamp}.json`;
}

/**
 * Read current state from localStorage
 */
function readFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;

    // Zustand persist stores with { state: {...}, version: number }
    const parsed = JSON.parse(item);
    return parsed.state || parsed;
  } catch (error) {
    console.error(`Failed to read from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Export current progress to BackupData structure
 */
export async function exportProgress(): Promise<BackupData> {
  // Read from localStorage
  const gameState = readFromLocalStorage<GameState>('codequest-game-state');
  const progressState = readFromLocalStorage<ProgressState>('codequest-progress');

  if (!gameState || !progressState) {
    throw new Error('Failed to read progress from localStorage');
  }

  // Remove UI state and hydration flags
  const cleanGameState: GameState = {
    userId: gameState.userId,
    username: gameState.username,
    displayName: gameState.displayName,
    avatarId: gameState.avatarId,
    stats: gameState.stats,
    unlockedAchievements: gameState.unlockedAchievements,
    preferences: gameState.preferences,
  };

  const cleanProgressState: ProgressState = {
    tracks: progressState.tracks,
    lessons: progressState.lessons,
    currentTrack: progressState.currentTrack,
    currentLesson: progressState.currentLesson,
  };

  // Create exportedBy info
  const exportedBy: ExportedBy = {
    userId: gameState.userId,
    username: gameState.username,
    displayName: gameState.displayName,
  };

  // Create metadata
  const lessonsCompleted = Object.values(progressState.lessons).filter(
    (lesson) => lesson.status === 'completed'
  ).length;

  const metadata: BackupMetadata = {
    totalXp: gameState.stats.totalXp,
    currentLevel: gameState.stats.currentLevel,
    achievementsCount: gameState.unlockedAchievements.length,
    lessonsCompleted,
  };

  // Create stores object (what will be checksummed)
  const stores = {
    gameState: cleanGameState,
    progressState: cleanProgressState,
  };

  // Calculate checksum
  const checksum = await calculateChecksum(stores);

  // Create validation info
  const validation: ValidationInfo = {
    checksum,
    tracksValidated: Object.keys(progressState.tracks) as any[],
    achievementsValidated: true,
  };

  // Create complete backup
  const backup: BackupData = {
    version: MIGRATION_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy,
    metadata,
    stores,
    validation,
  };

  return backup;
}

/**
 * Trigger browser download of backup file
 */
export function downloadBackup(data: BackupData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || generateFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export progress and trigger download
 * This is the main export function to call from UI
 */
export async function exportAndDownload(): Promise<void> {
  try {
    const backup = await exportProgress();
    downloadBackup(backup);
    console.log('[Migration] Export successful:', {
      xp: backup.metadata.totalXp,
      level: backup.metadata.currentLevel,
      achievements: backup.metadata.achievementsCount,
      lessons: backup.metadata.lessonsCompleted,
    });
  } catch (error) {
    console.error('[Migration] Export failed:', error);
    throw error;
  }
}
