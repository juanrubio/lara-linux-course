'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { QuestDefinition, QuestStatus } from '@/types';
import { NPC_CHARACTERS } from '@/types';

interface QuestCardProps {
  quest: QuestDefinition;
  status: QuestStatus;
  currentStep?: number;
  className?: string;
}

export function QuestCard({
  quest,
  status,
  currentStep = 0,
  className = '',
}: QuestCardProps) {
  const character = NPC_CHARACTERS.find((c) => c.id === quest.character);
  const totalSteps = quest.steps.length;
  const progressPercentage = status === 'completed' ? 100 : Math.round((currentStep / totalSteps) * 100);

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isAvailable = status === 'available';

  const statusConfig = {
    locked: {
      icon: Lock,
      color: 'text-gray-500',
      bg: 'bg-gray-800/50',
      border: 'border-gray-700',
      badge: 'bg-gray-600',
    },
    available: {
      icon: PlayCircle,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      border: 'border-green-700',
      badge: 'bg-green-600',
    },
    in_progress: {
      icon: Circle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-700',
      badge: 'bg-yellow-600',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/20',
      border: 'border-emerald-700',
      badge: 'bg-emerald-600',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const CardContent = (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl border p-4
        ${config.bg} ${config.border}
        ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--color-primary)]'}
        transition-all duration-300
        ${className}
      `}
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      {/* Chapter Badge */}
      <Badge
        className={`absolute top-2 right-2 ${config.badge}`}
      >
        Chapter {quest.chapter}
      </Badge>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Character Avatar */}
        {character && (
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-2xl border-2 border-[var(--color-primary)]">
              {quest.character === 'commander_byte' && '🎖️'}
              {quest.character === 'pixel_the_penguin' && '🐧'}
              {quest.character === 'python_pete' && '🐍'}
              {quest.character === 'bash_betty' && '⚡'}
              {quest.character === 'pi_princess' && '🍓'}
            </div>
          </div>
        )}

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
            {quest.title}
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
            {quest.description}
          </p>
        </div>
      </div>

      {/* Progress */}
      {(isInProgress || isCompleted) && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>Progress</span>
            <span>{currentStep}/{totalSteps} steps</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Rewards Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--color-accent)] font-medium">
            +{quest.rewards.xp} XP
          </span>
          {quest.rewards.badge && (
            <span className="text-purple-400">🏆 Badge</span>
          )}
        </div>

        {!isLocked && (
          <div className="flex items-center gap-1 text-[var(--color-primary)]">
            <span className="text-sm">
              {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              Requires Level {quest.requiredLevel}
            </p>
            {quest.prerequisites.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Complete previous quests first
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  if (isLocked) {
    return CardContent;
  }

  return (
    <Link href={`/quests/${quest.id}`}>
      {CardContent}
    </Link>
  );
}
