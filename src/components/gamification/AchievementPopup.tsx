'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { getAchievementById } from '@/lib/gamification';
import type { AchievementRarity } from '@/types';

export function AchievementPopup() {
  const { showAchievementPopup, pendingAchievements, dismissAchievement, preferences } =
    useGameStore();

  const currentAchievementId = pendingAchievements[0];
  const achievement = currentAchievementId
    ? getAchievementById(currentAchievementId)
    : null;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (showAchievementPopup && currentAchievementId) {
      const timer = setTimeout(() => {
        dismissAchievement();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAchievementPopup, currentAchievementId, dismissAchievement]);

  // Play sound effect
  useEffect(() => {
    if (showAchievementPopup && preferences.soundEnabled) {
      // TODO: Play achievement sound
    }
  }, [showAchievementPopup, preferences.soundEnabled]);

  const rarityStyles = achievement
    ? getRarityStyles(achievement.rarity)
    : getRarityStyles('common');

  return (
    <AnimatePresence>
      {showAchievementPopup && achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-20 right-4 z-50"
        >
          <div
            className={`relative overflow-hidden rounded-lg border-2 p-4 shadow-2xl ${rarityStyles.border} ${rarityStyles.bg}`}
            style={{ minWidth: '300px' }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, delay: 0.3 }}
            />

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={dismissAchievement}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Trophy className={`h-5 w-5 ${rarityStyles.text}`} />
              <span className={`text-sm font-semibold uppercase ${rarityStyles.text}`}>
                Achievement Unlocked!
              </span>
            </div>

            {/* Content */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                className="achievement-animate text-4xl"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                {achievement.icon}
              </motion.div>

              {/* Details */}
              <div>
                <h3 className="font-bold text-lg text-[var(--color-text)]">
                  {achievement.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${rarityStyles.badge}`}>
                    {achievement.rarity.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-accent)]">
                    +{achievement.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Queue indicator */}
            {pendingAchievements.length > 1 && (
              <div className="mt-3 text-xs text-[var(--color-text-muted)] text-center">
                +{pendingAchievements.length - 1} more achievement
                {pendingAchievements.length > 2 ? 's' : ''}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getRarityStyles(rarity: AchievementRarity): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (rarity) {
    case 'legendary':
      return {
        bg: 'bg-gradient-to-br from-amber-900/90 to-yellow-900/90',
        border: 'border-amber-400',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-black',
      };
    case 'epic':
      return {
        bg: 'bg-gradient-to-br from-purple-900/90 to-violet-900/90',
        border: 'border-purple-400',
        text: 'text-purple-400',
        badge: 'bg-purple-500 text-white',
      };
    case 'rare':
      return {
        bg: 'bg-gradient-to-br from-blue-900/90 to-indigo-900/90',
        border: 'border-blue-400',
        text: 'text-blue-400',
        badge: 'bg-blue-500 text-white',
      };
    case 'uncommon':
      return {
        bg: 'bg-gradient-to-br from-green-900/90 to-emerald-900/90',
        border: 'border-green-400',
        text: 'text-green-400',
        badge: 'bg-green-500 text-white',
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-gray-800/90 to-slate-800/90',
        border: 'border-gray-400',
        text: 'text-gray-400',
        badge: 'bg-gray-500 text-white',
      };
  }
}
