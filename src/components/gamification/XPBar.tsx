'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, selectXpProgress } from '@/store/gameStore';
import { getLevelInfo } from '@/lib/gamification';

interface XPBarProps {
  showDetails?: boolean;
  className?: string;
}

export function XPBar({ showDetails = true, className = '' }: XPBarProps) {
  const { stats } = useGameStore();
  const xpProgress = useGameStore(useShallow(selectXpProgress));
  const levelInfo = getLevelInfo(stats.currentLevel);
  const nextLevelInfo = getLevelInfo(stats.currentLevel + 1);

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{levelInfo.icon}</span>
            <div>
              <div className="font-bold text-[var(--color-text)]">
                Level {stats.currentLevel}
              </div>
              <div className="text-[var(--color-text-muted)]">
                {levelInfo.title}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[var(--color-accent)]">
              {stats.totalXp} XP
            </div>
            {nextLevelInfo && (
              <div className="text-[var(--color-text-muted)] text-xs">
                {xpProgress.required - xpProgress.current} XP to next level
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <Progress
          value={xpProgress.percentage}
          className="h-3 bg-white/10"
          style={{ ['--progress-background' as string]: levelInfo.color }}
        />
        <motion.div
          className="absolute -top-1 right-0 transform translate-x-1/2"
          style={{ left: `${xpProgress.percentage}%` }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles
            className="h-4 w-4"
            style={{ color: levelInfo.color }}
          />
        </motion.div>
      </div>

      {showDetails && (
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>{xpProgress.current} / {xpProgress.required} XP</span>
          <span>{xpProgress.percentage}%</span>
        </div>
      )}
    </div>
  );
}
