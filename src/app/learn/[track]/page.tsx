'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AppShell, Navigation } from '@/components/layout';
import { useProgressStore } from '@/store/progressStore';
import { TRACKS, type Track } from '@/types';

interface LessonSummary {
  slug: string;
  title: string;
  time: number;
  xp: number;
  difficulty: string;
  lessonNumber: number;
}

interface ChapterSummary {
  number: number;
  title: string;
  lessons: LessonSummary[];
}

interface PageProps {
  params: Promise<{ track: string }>;
}

export default function TrackPage({ params }: PageProps) {
  const { track: trackId } = use(params);
  const { tracks, lessons } = useProgressStore();
  const [chaptersData, setChaptersData] = useState<ChapterSummary[]>([]);
  const [totalLessons, setTotalLessons] = useState<number | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const track = TRACKS.find((t) => t.id === trackId);
  const trackProgress = tracks[trackId as Track];

  if (!track) {
    return (
      <AppShell>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Track not found
          </h1>
        </div>
      </AppShell>
    );
  }

  const percentage = trackProgress
    ? Math.round(
        (trackProgress.lessonsCompleted / trackProgress.totalLessons) * 100
      )
    : 0;

  useEffect(() => {
    let cancelled = false;

    const loadChapters = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/lesson/${trackId}`);
        if (!response.ok) {
          throw new Error('Failed to load track lessons');
        }
        const data = await response.json();
        if (!cancelled) {
          setChaptersData(data.chapters || []);
          setTotalLessons(typeof data.totalLessons === 'number' ? data.totalLessons : null);
          setTotalMinutes(typeof data.totalMinutes === 'number' ? data.totalMinutes : null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError('Unable to load lessons. Please try again.');
          setChaptersData([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadChapters();

    return () => {
      cancelled = true;
    };
  }, [trackId]);

  const displayLessonCount = totalLessons ?? track.totalLessons;
  const minutesEstimate = totalMinutes ?? track.totalLessons * 15;
  const hourEstimate = Math.max(1, Math.round(minutesEstimate / 60));

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Navigation
            breadcrumbs={[
              { label: 'Learn', href: '/learn' },
              { label: track.name },
            ]}
          />
        </div>

        {/* Track Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${track.color}22 0%, ${track.color}11 100%)`,
          }}
        >
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: `${track.color}33` }}
            >
              {track.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                {track.name}
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                {track.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-[var(--color-text-muted)]">
                <span>{displayLessonCount} lessons</span>
                {chaptersData.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{chaptersData.length} chapters</span>
                  </>
                )}
                <span>•</span>
                <span>~{hourEstimate} hours</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[var(--color-text)]">
                {percentage}%
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">Complete</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={percentage} className="h-3" />
          </div>
        </motion.div>

        {/* Chapters */}
        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-20 bg-white/5 rounded animate-pulse" />
              <div className="h-20 bg-white/5 rounded animate-pulse" />
            </div>
          )}
          {loadError && (
            <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300">
              {loadError}
            </div>
          )}
          {chaptersData.map((chapter, chapterIndex) => (
            <motion.div
              key={chapter.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: chapterIndex * 0.1 }}
            >
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                Chapter {chapter.number}: {chapter.title}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                {chapter.lessons.length} lessons
              </p>

              <div className="space-y-2">
                {chapter.lessons.map((lesson, lessonIndex) => {
                  const lessonKey = `${trackId}/${lesson.slug}`;
                  const lessonProgress = lessons[lessonKey];
                  const status = lessonProgress?.status || (lessonIndex === 0 && chapterIndex === 0 ? 'available' : 'locked');

                  const isCompleted = status === 'completed';
                  const isAvailable = status === 'available' || status === 'in_progress';
                  const isLocked = status === 'locked';

                  return (
                    <Link
                      key={lesson.slug}
                      href={isLocked ? '#' : `/learn/${trackId}/${lesson.slug}`}
                    >
                      <Card
                        className={`border transition-all ${
                          isLocked
                            ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                            : isCompleted
                            ? 'border-green-700 bg-green-900/20 hover:border-green-500'
                            : 'border-white/10 bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-green-600'
                                  : isAvailable
                                  ? 'bg-[var(--color-primary)]'
                                  : 'bg-gray-700'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              ) : isAvailable ? (
                                <PlayCircle className="h-5 w-5 text-white" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1">
                              <h3 className="font-medium text-[var(--color-text)]">
                                {lesson.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-muted)]">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.time} min
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  +{lesson.xp} XP
                                </Badge>
                              </div>
                            </div>

                            {/* Arrow */}
                            {!isLocked && (
                              <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)]" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
