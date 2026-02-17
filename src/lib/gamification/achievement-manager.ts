import { ACHIEVEMENTS } from './achievements';
import type { Track } from '@/types';

interface CheckResult {
  achievementId: string;
  xpReward: number;
}

interface ProgressState {
  tracks: Record<Track, {
    trackId: Track;
    lessonsCompleted: number;
    totalLessons: number;
    currentLesson: string | null;
  }>;
  lessons: Record<string, any>;
}

interface GameState {
  stats: {
    currentLevel: number;
    totalXp: number;
    [key: string]: any;
  };
  unlockedAchievements: string[];
}

/**
 * Check which achievements should be unlocked based on current progress
 */
export function checkLessonAchievements(
  trackId: Track,
  lessonSlug: string,
  progressState: ProgressState,
  gameState: GameState
): CheckResult[] {
  const unlocked: CheckResult[] = [];

  // Check each achievement condition
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (gameState.unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    // Check condition based on type
    const { condition } = achievement;
    let shouldUnlock = false;

    switch (condition.type) {
      case 'track_complete':
        // Check if the track is now complete
        if ('trackId' in condition && condition.trackId === trackId) {
          const track = progressState.tracks[condition.trackId];
          shouldUnlock = track && track.lessonsCompleted >= track.totalLessons;
          if (shouldUnlock) {
            console.log(`[Achievement] Track complete: ${condition.trackId}`, track);
          }
        }
        break;

      case 'level_reached':
        // Check if the user has reached the required level
        if ('value' in condition) {
          shouldUnlock = gameState.stats.currentLevel >= condition.value!;
          if (shouldUnlock) {
            console.log(`[Achievement] Level reached: ${condition.value!}`);
          }
        }
        break;

      case 'command_count':
        // Check if user has run enough commands
        if ('value' in condition) {
          // Check if it's a specific command or total commands
          if ('command' in condition && typeof condition.command === 'string') {
            // Count specific command (e.g., grep 20 times)
            const commandName = condition.command.toLowerCase();
            const commandOccurrences = gameState.stats.uniqueCommands.filter(
              (cmd: string) => cmd === commandName
            ).length;
            shouldUnlock = gameState.stats.totalCommands >= condition.value! && commandOccurrences > 0;
          } else {
            // Total command count
            shouldUnlock = gameState.stats.totalCommands >= condition.value!;
          }
          if (shouldUnlock) {
            console.log(`[Achievement] Command count reached: ${condition.value!}`);
          }
        }
        break;

      case 'command_variation':
        // Check if user has used a command with different flags
        if ('command' in condition && 'variations' in condition) {
          const commandName = (condition.command as string).toLowerCase();
          const variations = gameState.stats.commandVariations[commandName] || [];
          shouldUnlock = variations.length >= (condition.variations as number);
          if (shouldUnlock) {
            console.log(`[Achievement] Command variations: ${commandName} with ${variations.length} variations`);
          }
        }
        break;

      case 'unique_commands':
        // Check if user has used enough unique commands
        if ('value' in condition) {
          shouldUnlock = gameState.stats.uniqueCommands.length >= condition.value!;
          if (shouldUnlock) {
            console.log(`[Achievement] Unique commands: ${gameState.stats.uniqueCommands.length}`);
          }
        }
        break;

      case 'command_used':
        // Check if a specific command has been used at least once
        if ('command' in condition) {
          const commandName = (condition.command as string).toLowerCase();
          shouldUnlock = gameState.stats.uniqueCommands.includes(commandName);
          if (shouldUnlock) {
            console.log(`[Achievement] Command used: ${commandName}`);
          }
        }
        break;

      // Not yet implemented
      case 'task_complete':
      case 'streak':
      case 'playground_time':
        // These require additional tracking not implemented yet
        // Will be implemented in future iterations
        break;

      default:
        console.warn(`[Achievement] Unknown condition type:`, condition);
    }

    if (shouldUnlock) {
      unlocked.push({
        achievementId: achievement.id,
        xpReward: achievement.xpReward,
      });
      console.log(`[Achievement] Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`);
    }
  }

  return unlocked;
}

/**
 * Check achievements that should be unlocked based on level change
 */
export function checkLevelAchievements(
  currentLevel: number,
  unlockedAchievements: string[]
): CheckResult[] {
  const unlocked: CheckResult[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    const { condition } = achievement;
    if (condition.type === 'level_reached' && 'value' in condition) {
      if (currentLevel >= condition.value!) {
        unlocked.push({
          achievementId: achievement.id,
          xpReward: achievement.xpReward,
        });
        console.log(`[Achievement] Level milestone: ${achievement.name}`);
      }
    }
  }

  return unlocked;
}

/**
 * Check track completion achievements
 */
export function checkTrackAchievements(
  trackId: Track,
  progressState: ProgressState,
  unlockedAchievements: string[]
): CheckResult[] {
  const unlocked: CheckResult[] = [];
  const track = progressState.tracks[trackId];

  if (!track || track.lessonsCompleted < track.totalLessons) {
    return unlocked;
  }

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    const { condition } = achievement;
    if (condition.type === 'track_complete' && 'trackId' in condition) {
      if (condition.trackId === trackId) {
        unlocked.push({
          achievementId: achievement.id,
          xpReward: achievement.xpReward,
        });
        console.log(`[Achievement] Track completed: ${trackId}`);
      }
    }
  }

  return unlocked;
}

/**
 * Check command-based achievements after a command is executed
 */
export function checkCommandAchievements(
  gameState: GameState
): CheckResult[] {
  const unlocked: CheckResult[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (gameState.unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    const { condition } = achievement;
    let shouldUnlock = false;

    switch (condition.type) {
      case 'command_count':
        if ('value' in condition) {
          if ('command' in condition && typeof condition.command === 'string') {
            const commandName = condition.command.toLowerCase();
            const commandOccurrences = gameState.stats.uniqueCommands.filter(
              (cmd: string) => cmd === commandName
            ).length;
            shouldUnlock = gameState.stats.totalCommands >= condition.value! && commandOccurrences > 0;
          } else {
            shouldUnlock = gameState.stats.totalCommands >= condition.value!;
          }
        }
        break;

      case 'command_variation':
        if ('command' in condition && 'variations' in condition) {
          const commandName = (condition.command as string).toLowerCase();
          const variations = gameState.stats.commandVariations[commandName] || [];
          shouldUnlock = variations.length >= (condition.variations as number);
        }
        break;

      case 'unique_commands':
        if ('value' in condition) {
          shouldUnlock = gameState.stats.uniqueCommands.length >= condition.value!;
        }
        break;

      case 'command_used':
        if ('command' in condition) {
          const commandName = (condition.command as string).toLowerCase();
          shouldUnlock = gameState.stats.uniqueCommands.includes(commandName);
        }
        break;
    }

    if (shouldUnlock) {
      unlocked.push({
        achievementId: achievement.id,
        xpReward: achievement.xpReward,
      });
      console.log(`[Achievement] Command achievement unlocked: ${achievement.name}`);
    }
  }

  return unlocked;
}
