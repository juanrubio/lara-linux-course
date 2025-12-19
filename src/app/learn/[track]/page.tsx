'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AppShell, Navigation } from '@/components/layout';
import { useProgressStore } from '@/store/progressStore';
import { TRACKS, type Track } from '@/types';

interface PageProps {
  params: Promise<{ track: string }>;
}

export default function TrackPage({ params }: PageProps) {
  const { track: trackId } = use(params);
  const { tracks, lessons, isLessonAvailable, isLessonCompleted } = useProgressStore();

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

  // Sample lessons structure (in a real app, this would come from the content loader)
  const chaptersData = getChaptersForTrack(trackId);

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
                <span>{track.totalLessons} lessons</span>
                <span>•</span>
                <span>~{Math.round((track.totalLessons * 15) / 60)} hours</span>
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

// Helper function to get chapter structure for each track
function getChaptersForTrack(trackId: string) {
  const trackData: Record<string, { number: number; title: string; lessons: { slug: string; title: string; time: number; xp: number }[] }[]> = {
    linux: [
      {
        number: 1,
        title: 'Getting Started',
        lessons: [
          { slug: '01-what-is-linux', title: 'What is Linux?', time: 10, xp: 50 },
          { slug: '02-the-terminal', title: 'The Terminal - Your Command Center', time: 15, xp: 50 },
          { slug: '03-first-commands', title: 'Your First Commands', time: 15, xp: 50 },
          { slug: '04-getting-help', title: 'Getting Help', time: 10, xp: 50 },
          { slug: '05-chapter1-quest', title: 'Quest: Terminal Awakening', time: 20, xp: 100 },
        ],
      },
      {
        number: 2,
        title: 'Exploring the File System',
        lessons: [
          { slug: '06-understanding-directories', title: 'Understanding Directories', time: 15, xp: 50 },
          { slug: '07-navigation', title: 'Navigation', time: 15, xp: 50 },
          { slug: '08-creating-removing', title: 'Creating & Removing', time: 15, xp: 50 },
          { slug: '09-copying-moving', title: 'Copying & Moving', time: 15, xp: 50 },
          { slug: '10-chapter2-quest', title: 'Quest: The Lost Files', time: 20, xp: 150 },
        ],
      },
    ],
    python: [
      {
        number: 1,
        title: 'First Steps',
        lessons: [
          { slug: '01-what-is-python', title: 'What is Python?', time: 10, xp: 50 },
          { slug: '02-hello-world', title: 'Hello, World!', time: 15, xp: 50 },
          { slug: '03-variables', title: 'Variables', time: 15, xp: 50 },
          { slug: '04-numbers-math', title: 'Numbers and Math', time: 15, xp: 50 },
          { slug: '05-chapter1-quest', title: 'Quest: Calculator Creation', time: 20, xp: 100 },
        ],
      },
    ],
    bash: [
      {
        number: 1,
        title: 'Script Basics',
        lessons: [
          { slug: '01-what-is-shell-script', title: 'What is a Shell Script?', time: 10, xp: 50 },
          { slug: '02-first-script', title: 'Your First Script', time: 15, xp: 50 },
          { slug: '03-variables', title: 'Variables in Bash', time: 15, xp: 50 },
          { slug: '04-running-scripts', title: 'Running Scripts', time: 15, xp: 50 },
          { slug: '05-chapter1-quest', title: 'Quest: Automation Begins', time: 20, xp: 100 },
        ],
      },
    ],
    'raspberry-pi': [
      {
        number: 1,
        title: 'Getting Started with Pi',
        lessons: [
          { slug: '01-pi-setup', title: 'Pi Setup', time: 20, xp: 75 },
          { slug: '02-led-blinker', title: 'LED Blinker', time: 30, xp: 100 },
          { slug: '03-button-input', title: 'Button Input', time: 30, xp: 100 },
        ],
      },
    ],
  };

  return trackData[trackId] || [];
}
