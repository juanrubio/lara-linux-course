'use client';

import { use, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Maximize2,
  Minimize2,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell, Navigation } from '@/components/layout';
import { useProgressStore } from '@/store/progressStore';
import { useGameStore } from '@/store/gameStore';
import { TRACKS } from '@/types';

// Dynamically import Terminal with no SSR
const Terminal = dynamic(
  () => import('@/components/terminal').then((mod) => mod.Terminal),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-[var(--color-terminal-bg)] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-4 w-48 mb-2 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    ),
  }
);

interface PageProps {
  params: Promise<{ track: string; lessonSlug: string }>;
}

interface LessonMeta {
  title: string;
  track: string;
  chapter: number;
  lesson: number;
  slug: string;
  prerequisites: string[];
  estimatedTime: number;
  difficulty: string;
  xpReward: number;
  objectives: string[];
  nextLesson?: string;
  prevLesson?: string;
}

export default function LessonPage({ params }: PageProps) {
  const { track: trackId, lessonSlug } = use(params);
  const [lessonMeta, setLessonMeta] = useState<LessonMeta | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);

  const { lessons, completeLesson, startLesson } = useProgressStore();
  const { addXP } = useGameStore();

  const track = TRACKS.find((t) => t.id === trackId);
  const lessonKey = `${trackId}/${lessonSlug}`;
  const lessonProgress = lessons[lessonKey];
  const isCompleted = lessonProgress?.status === 'completed';

  // Load lesson content
  useEffect(() => {
    async function loadLesson() {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from an API or use next-mdx-remote
        // For now, we'll use sample data
        const meta: LessonMeta = {
          title: getLessonTitle(lessonSlug),
          track: trackId,
          chapter: 1,
          lesson: parseInt(lessonSlug.split('-')[0]) || 1,
          slug: lessonSlug,
          prerequisites: [],
          estimatedTime: 15,
          difficulty: 'beginner',
          xpReward: 50,
          objectives: [
            'Learn the basics of this topic',
            'Practice with hands-on exercises',
            'Complete the challenge',
          ],
          nextLesson: getNextLesson(trackId, lessonSlug),
          prevLesson: getPrevLesson(trackId, lessonSlug),
        };
        setLessonMeta(meta);
        setLessonContent('loaded');

        // Mark lesson as started
        startLesson(trackId, lessonSlug);
      } catch (error) {
        console.error('Failed to load lesson:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLesson();
  }, [trackId, lessonSlug, startLesson]);

  const handleCompleteLesson = () => {
    if (!isCompleted && lessonMeta) {
      completeLesson(trackId, lessonSlug);
      addXP(lessonMeta.xpReward);
      setShowCompletionBanner(true);
    }
  };

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

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <Navigation
            breadcrumbs={[
              { label: 'Learn', href: '/learn' },
              { label: track.name, href: `/learn/${trackId}` },
              { label: lessonMeta?.title || 'Lesson' },
            ]}
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-[var(--color-text)]">
                {lessonMeta?.title}
              </h1>
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lessonMeta?.estimatedTime} min
              </span>
              <Badge variant="secondary">
                +{lessonMeta?.xpReward} XP
              </Badge>
            </div>
          </div>
        </div>

        {/* Completion Banner */}
        {showCompletionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-900/50 border-b border-green-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-bold text-green-400">Lesson Complete!</p>
                  <p className="text-sm text-green-300">
                    You earned +{lessonMeta?.xpReward} XP
                  </p>
                </div>
              </div>
              {lessonMeta?.nextLesson && (
                <Link href={`/learn/${trackId}/${lessonMeta.nextLesson}`}>
                  <Button>
                    Next Lesson
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className={`flex-1 flex ${terminalExpanded ? 'flex-col' : 'flex-row'} overflow-hidden`}>
          {/* Lesson Content Panel */}
          {!terminalExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-1/2 overflow-y-auto border-r border-white/10"
            >
              <div className="p-6">
                {/* Objectives Card */}
                <Card className="mb-6 border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-[var(--color-primary)]">
                      <Target className="h-5 w-5" />
                      <span className="font-semibold">Learning Objectives</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {lessonMeta?.objectives.map((objective, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                        >
                          <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Lesson Content Placeholder */}
                <div className="prose prose-invert max-w-none">
                  <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-white/10">
                    <p className="text-[var(--color-text-muted)] text-center">
                      Lesson content for <strong>{lessonMeta?.title}</strong> will be loaded here.
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] text-center mt-2">
                      Practice commands in the terminal on the right!
                    </p>
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  {lessonMeta?.prevLesson ? (
                    <Link href={`/learn/${trackId}/${lessonMeta.prevLesson}`}>
                      <Button variant="outline" size="sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <Button onClick={handleCompleteLesson}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}

                    {lessonMeta?.nextLesson && (
                      <Link href={`/learn/${trackId}/${lessonMeta.nextLesson}`}>
                        <Button variant={isCompleted ? 'default' : 'outline'}>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Terminal Panel */}
          <div className={`${terminalExpanded ? 'flex-1' : 'w-1/2'} flex flex-col bg-[var(--color-surface)]`}>
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[var(--color-terminal-bg)]">
              <div className="flex items-center gap-2">
                <TerminalIcon className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Practice Terminal
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setTerminalExpanded(!terminalExpanded)}
              >
                {terminalExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Terminal */}
            <div className="flex-1 p-2">
              <Terminal
                welcomeMessage={getTerminalWelcome(lessonMeta?.title || 'Practice')}
                className="h-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// Helper functions
function getLessonTitle(slug: string): string {
  const titles: Record<string, string> = {
    '01-what-is-linux': 'What is Linux?',
    '02-the-terminal': 'The Terminal - Your Command Center',
    '03-first-commands': 'Your First Commands',
    '04-getting-help': 'Getting Help',
    '05-chapter1-quest': 'Quest: Terminal Awakening',
    '06-understanding-directories': 'Understanding Directories',
    '07-navigation': 'Navigation',
    '08-creating-removing': 'Creating & Removing',
    '09-copying-moving': 'Copying & Moving',
    '10-chapter2-quest': 'Quest: The Lost Files',
  };
  return titles[slug] || slug.replace(/-/g, ' ').replace(/^\d+-/, '');
}

function getNextLesson(track: string, currentSlug: string): string | undefined {
  const lessons: Record<string, string[]> = {
    linux: [
      '01-what-is-linux',
      '02-the-terminal',
      '03-first-commands',
      '04-getting-help',
      '05-chapter1-quest',
      '06-understanding-directories',
      '07-navigation',
      '08-creating-removing',
      '09-copying-moving',
      '10-chapter2-quest',
    ],
  };
  const trackLessons = lessons[track] || [];
  const currentIndex = trackLessons.indexOf(currentSlug);
  if (currentIndex >= 0 && currentIndex < trackLessons.length - 1) {
    return trackLessons[currentIndex + 1];
  }
  return undefined;
}

function getPrevLesson(track: string, currentSlug: string): string | undefined {
  const lessons: Record<string, string[]> = {
    linux: [
      '01-what-is-linux',
      '02-the-terminal',
      '03-first-commands',
      '04-getting-help',
      '05-chapter1-quest',
      '06-understanding-directories',
      '07-navigation',
      '08-creating-removing',
      '09-copying-moving',
      '10-chapter2-quest',
    ],
  };
  const trackLessons = lessons[track] || [];
  const currentIndex = trackLessons.indexOf(currentSlug);
  if (currentIndex > 0) {
    return trackLessons[currentIndex - 1];
  }
  return undefined;
}

function getTerminalWelcome(lessonTitle: string): string {
  return `\x1b[1;36m╔════════════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[1;36m║\x1b[0m  \x1b[1;33m📚 Lesson: ${lessonTitle.substring(0, 50).padEnd(50)}\x1b[0m  \x1b[1;36m║\x1b[0m
\x1b[1;36m║\x1b[0m                                                                      \x1b[1;36m║\x1b[0m
\x1b[1;36m║\x1b[0m  Use this terminal to practice the commands from the lesson.        \x1b[1;36m║\x1b[0m
\x1b[1;36m║\x1b[0m  Type \x1b[1;32mhelp\x1b[0m to see available commands.                                \x1b[1;36m║\x1b[0m
\x1b[1;36m╚════════════════════════════════════════════════════════════════════╝\x1b[0m
`;
}
