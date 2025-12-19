'use client';

import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGameStore } from '@/store/gameStore';
import { getLevelInfo } from '@/lib/gamification';

interface LevelBadgeProps {
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  animated?: boolean;
  className?: string;
}

export function LevelBadge({
  level,
  size = 'md',
  showTitle = false,
  animated = false,
  className = '',
}: LevelBadgeProps) {
  const { stats } = useGameStore();
  const displayLevel = level ?? stats.currentLevel;
  const levelInfo = getLevelInfo(displayLevel);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const titleSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const BadgeContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
        style={{
          background: `linear-gradient(135deg, ${levelInfo.color}22, ${levelInfo.color}44)`,
          border: `2px solid ${levelInfo.color}`,
          boxShadow: animated ? `0 0 20px ${levelInfo.color}44` : 'none',
        }}
        animate={
          animated
            ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                  `0 0 10px ${levelInfo.color}22`,
                  `0 0 20px ${levelInfo.color}66`,
                  `0 0 10px ${levelInfo.color}22`,
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span>{levelInfo.icon}</span>
      </motion.div>

      {showTitle && (
        <div>
          <div
            className={`font-bold ${titleSizeClasses[size]}`}
            style={{ color: levelInfo.color }}
          >
            Level {displayLevel}
          </div>
          <div className={`text-[var(--color-text-muted)] ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
            {levelInfo.title}
          </div>
        </div>
      )}
    </div>
  );

  if (!showTitle) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{BadgeContent}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-bold">Level {displayLevel}</div>
            <div className="text-sm text-muted-foreground">{levelInfo.title}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return BadgeContent;
}
