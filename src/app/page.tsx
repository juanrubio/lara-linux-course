'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Swords,
  Terminal,
  Trophy,
  Flame,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppShell } from '@/components/layout';
import { XPBar, LevelBadge, AchievementPopup } from '@/components/gamification';
import { useGameStore } from '@/store/gameStore';
import { useProgressStore } from '@/store/progressStore';
import { TRACKS } from '@/types';

export default function DashboardPage() {
  const { stats, displayName } = useGameStore();
  const { tracks } = useProgressStore();

  const totalLessonsCompleted = Object.values(tracks).reduce(
    (sum, t) => sum + t.lessonsCompleted,
    0
  );
  const totalLessons = Object.values(tracks).reduce(
    (sum, t) => sum + t.totalLessons,
    0
  );

  return (
    <AppShell>
      <AchievementPopup />
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                Welcome back, {displayName}!
                <motion.span
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block ml-2"
                >
                  👋
                </motion.span>
              </h1>
              <p className="text-[var(--color-text-muted)]">
                Ready to continue your coding adventure?
              </p>

              {/* Streak indicator */}
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-400 font-medium">
                    {stats.currentStreak} day streak!
                  </span>
                  {stats.currentStreak >= 7 && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                      On Fire!
                    </span>
                  )}
                </div>
              )}
            </div>

            <LevelBadge size="lg" showTitle animated />
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <XPBar />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/learn"
            icon={<BookOpen className="h-6 w-6" />}
            title="Continue Learning"
            description="Pick up where you left off"
            color="bg-blue-600"
          />
          <QuickActionCard
            href="/quests"
            icon={<Swords className="h-6 w-6" />}
            title="Quests"
            description="Complete story missions"
            color="bg-purple-600"
          />
          <QuickActionCard
            href="/playground"
            icon={<Terminal className="h-6 w-6" />}
            title="Playground"
            description="Practice freely"
            color="bg-green-600"
          />
          <QuickActionCard
            href="/achievements"
            icon={<Trophy className="h-6 w-6" />}
            title="Achievements"
            description="View your badges"
            color="bg-amber-600"
          />
        </div>

        {/* Learning Tracks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Learning Tracks
            </h2>
            <Link href="/learn">
              <Button variant="ghost" className="text-[var(--color-primary)]">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRACKS.map((track) => {
              const progress = tracks[track.id];
              const percentage = progress
                ? Math.round(
                    (progress.lessonsCompleted / progress.totalLessons) * 100
                  )
                : 0;

              return (
                <Link key={track.id} href={`/learn/${track.id}`}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="bg-[var(--color-surface)] border-white/10 hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                            style={{ backgroundColor: `${track.color}22` }}
                          >
                            {track.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[var(--color-text)]">
                              {track.name}
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">
                              {track.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Progress value={percentage} className="h-2 flex-1" />
                              <span className="text-xs text-[var(--color-text-muted)]">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total XP"
            value={stats.totalXp.toLocaleString()}
            icon={<Sparkles className="h-5 w-5 text-[var(--color-accent)]" />}
          />
          <StatCard
            title="Lessons Done"
            value={`${totalLessonsCompleted}/${totalLessons}`}
            icon={<BookOpen className="h-5 w-5 text-blue-400" />}
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon={<Flame className="h-5 w-5 text-orange-400" />}
          />
          <StatCard
            title="Best Streak"
            value={`${stats.longestStreak} days`}
            icon={<Trophy className="h-5 w-5 text-yellow-400" />}
          />
        </div>
      </div>
    </AppShell>
  );
}

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
  color,
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="bg-[var(--color-surface)] border-white/10 hover:border-[var(--color-primary)] transition-colors cursor-pointer h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="bg-[var(--color-surface)] border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
            <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
