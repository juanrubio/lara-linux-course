'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { checkLevelAchievements } from '@/lib/gamification/achievement-manager';

interface ChallengeStep {
  command: string;
  hint: string;
}

interface ChallengeProps {
  id: string;
  title: string;
  description: string;
  steps: ChallengeStep[];
  xp: number;
  badge?: string;
}

export function Challenge({ id, title, description, steps, xp, badge }: ChallengeProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { addXp, showAchievement, unlockAchievement } = useGameStore();

  const handleStepComplete = (index: number) => {
    if (!completedSteps.includes(index)) {
      const newCompleted = [...completedSteps, index];
      setCompletedSteps(newCompleted);

      if (newCompleted.length === steps.length) {
        setIsComplete(true);
        addXp(xp);
        if (badge) {
          showAchievement(badge);
        }

        // Check for level-based achievements after XP is added
        const gameState = useGameStore.getState();
        const levelAchievements = checkLevelAchievements(
          gameState.stats.currentLevel,
          gameState.unlockedAchievements
        );
        for (const { achievementId, xpReward } of levelAchievements) {
          unlockAchievement(achievementId);
          showAchievement(achievementId);
          addXp(xpReward);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-6"
    >
      <Card className={`border-2 ${isComplete ? 'border-yellow-500 bg-yellow-900/20' : 'border-purple-500 bg-purple-900/20'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--color-text)]">
              {isComplete ? (
                <Trophy className="h-6 w-6 text-yellow-500" />
              ) : (
                <Swords className="h-6 w-6 text-purple-400" />
              )}
              Challenge: {title}
            </div>
            <span className="text-[var(--color-accent)] font-bold">+{xp} XP</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-[var(--color-text-muted)]">{description}</p>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  completedSteps.includes(index)
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleStepComplete(index)}
                    disabled={completedSteps.includes(index)}
                    className="mt-1"
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-[var(--color-text-muted)]" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-[var(--color-text)]">{step.hint}</p>
                    <code className="text-sm text-[var(--color-accent)]">
                      {step.command}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-lg font-bold text-yellow-400">
                Challenge Complete!
              </p>
              {badge && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  You earned a new badge!
                </p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
