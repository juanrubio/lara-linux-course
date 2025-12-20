'use client';

import { use, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
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
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell, Navigation } from '@/components/layout';
import { LessonContent } from '@/components/lesson';
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

interface LessonNavigation {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export default function LessonPage({ params }: PageProps) {
  const { track: trackId, lessonSlug } = use(params);
  const [lessonMeta, setLessonMeta] = useState<LessonMeta | null>(null);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [navigation, setNavigation] = useState<LessonNavigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);

  const { lessons, completeLesson, startLesson } = useProgressStore();
  const { addXP } = useGameStore();

  const track = TRACKS.find((t) => t.id === trackId);
  const lessonKey = `${trackId}/${lessonSlug}`;
  const lessonProgress = lessons[lessonKey];
  const isCompleted = lessonProgress?.status === 'completed';

  // Load lesson content from API
  useEffect(() => {
    async function loadLesson() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/lesson/${trackId}/${lessonSlug}`);

        if (!response.ok) {
          throw new Error('Failed to load lesson');
        }

        const data = await response.json();

        setLessonMeta(data.frontmatter);
        setMdxSource(data.source);
        setNavigation(data.navigation);

        // Mark lesson as started
        startLesson(trackId, lessonSlug);
      } catch (error) {
        console.error('Failed to load lesson:', error);
        setLoadError('Failed to load lesson content. Please try again.');
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
              {navigation?.next && (
                <Link href={`/learn/${trackId}/${navigation.next.slug}`}>
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

                {/* Lesson Content */}
                {loadError ? (
                  <div className="p-6 rounded-xl bg-red-900/20 border border-red-500/30">
                    <p className="text-red-400 text-center">{loadError}</p>
                  </div>
                ) : mdxSource ? (
                  <LessonContent source={mdxSource} />
                ) : (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                )}

                {/* Navigation Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  {navigation?.prev ? (
                    <Link href={`/learn/${trackId}/${navigation.prev.slug}`}>
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

                    {navigation?.next && (
                      <Link href={`/learn/${trackId}/${navigation.next.slug}`}>
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

// Helper function for terminal welcome message
function getTerminalWelcome(lessonTitle: string): string {
  return `\x1b[1;33m📚 ${lessonTitle}\x1b[0m

\x1b[1;36mUse this terminal to practice commands from the lesson.\x1b[0m
Type \x1b[1;32mhelp\x1b[0m to see available commands.
`;
}
