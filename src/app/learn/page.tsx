'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AppShell, Navigation } from '@/components/layout';
import { useProgressStore } from '@/store/progressStore';
import { TRACKS } from '@/types';

export default function LearnPage() {
  const { tracks } = useProgressStore();

  return (
    <AppShell>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Navigation breadcrumbs={[{ label: 'Learn' }]} />
          <h1 className="text-3xl font-bold text-[var(--color-text)] mt-4">
            Learning Tracks
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Choose a track to start your journey
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TRACKS.map((track, index) => {
            const progress = tracks[track.id];
            const percentage = progress
              ? Math.round(
                  (progress.lessonsCompleted / progress.totalLessons) * 100
                )
              : 0;

            // Check if locked (prerequisites not met)
            const isLocked =
              track.prerequisites &&
              track.prerequisites.some((prereq) => {
                const prereqProgress = tracks[prereq];
                return (
                  !prereqProgress ||
                  prereqProgress.lessonsCompleted <
                    prereqProgress.totalLessons * 0.5
                );
              });

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isLocked ? (
                  <Card className="bg-[var(--color-surface)] border-white/10 opacity-60">
                    <CardContent className="p-6">
                      <TrackCardContent
                        track={track}
                        percentage={percentage}
                        isLocked={true}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Link href={`/learn/${track.id}`}>
                    <Card className="bg-[var(--color-surface)] border-white/10 hover:border-[var(--color-primary)] transition-all cursor-pointer group">
                      <CardContent className="p-6">
                        <TrackCardContent
                          track={track}
                          percentage={percentage}
                          isLocked={false}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

interface TrackCardContentProps {
  track: (typeof TRACKS)[0];
  percentage: number;
  isLocked: boolean;
}

function TrackCardContent({ track, percentage, isLocked }: TrackCardContentProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${track.color}22` }}
          >
            {track.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                {track.name}
              </h2>
              {isLocked && <Lock className="h-4 w-4 text-gray-500" />}
            </div>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              {track.description}
            </p>
          </div>
        </div>

        {!isLocked && (
          <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          <span>{track.totalLessons} lessons</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>~{Math.round(track.totalLessons * 15 / 60)} hours</span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[var(--color-text-muted)]">Progress</span>
          <span className="text-[var(--color-text)]">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      {/* Status Badge */}
      <div>
        {isLocked ? (
          <Badge variant="secondary" className="bg-gray-700">
            Complete 50% of prerequisites to unlock
          </Badge>
        ) : percentage === 100 ? (
          <Badge className="bg-green-600">Completed!</Badge>
        ) : percentage > 0 ? (
          <Badge className="bg-blue-600">In Progress</Badge>
        ) : (
          <Badge
            className="text-black"
            style={{ backgroundColor: track.color }}
          >
            Start Learning
          </Badge>
        )}
      </div>
    </div>
  );
}
