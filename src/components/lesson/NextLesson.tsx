'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NextLessonProps {
  track: string;
  lesson: string;
  teaser?: string;
}

export function NextLesson({ track, lesson, teaser }: NextLessonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border border-[var(--color-primary)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-[var(--color-primary)]" />
            What's Next?
          </h3>
          {teaser && (
            <p className="text-[var(--color-text-muted)] mt-1">{teaser}</p>
          )}
        </div>

        <Link href={`/learn/${track}/${lesson}`}>
          <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]">
            Next Lesson
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
