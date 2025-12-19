'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Lightbulb, Terminal, Code, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { useProgressStore } from '@/store/progressStore';

interface ExerciseCardProps {
  id: string;
  type: 'terminal' | 'code' | 'quiz' | 'file_create';
  title: string;
  instruction: string;
  hint?: string;
  xp: number;
  validation?: {
    command?: string;
    type?: string;
    pattern?: string;
  };
}

export function ExerciseCard({
  id,
  type,
  title,
  instruction,
  hint,
  xp,
}: ExerciseCardProps) {
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addXp } = useGameStore();
  const { currentTrack, currentLesson, completeExercise } = useProgressStore();

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      addXp(xp);
      if (currentTrack && currentLesson) {
        const lessonSlug = currentLesson.split('/')[1];
        completeExercise(currentTrack, lessonSlug, id);
      }
    }
  };

  const typeIcons = {
    terminal: Terminal,
    code: Code,
    quiz: HelpCircle,
    file_create: Code,
  };

  const TypeIcon = typeIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-6"
    >
      <Card
        className={`border-2 transition-all duration-300 ${
          isCompleted
            ? 'border-green-500 bg-green-900/20'
            : 'border-[var(--color-primary)] bg-[var(--color-surface)]'
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-[var(--color-primary)]" />
              )}
              <TypeIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text)]">{title}</span>
            </div>
            <span
              className={`text-sm font-medium ${
                isCompleted ? 'text-green-500' : 'text-[var(--color-accent)]'
              }`}
            >
              {isCompleted ? `+${xp} XP earned!` : `+${xp} XP`}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-[var(--color-text)]">{instruction}</p>

          {/* Hint section */}
          {hint && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700 text-yellow-200 text-sm">
                      <span className="font-semibold">💡 Hint:</span> {hint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Manual completion for demo purposes */}
          {!isCompleted && (
            <Button
              onClick={handleComplete}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
            >
              Mark as Complete
            </Button>
          )}

          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-2 text-green-500 py-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Exercise Completed!</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
