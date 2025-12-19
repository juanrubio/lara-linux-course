'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Swords,
  Trophy,
  Terminal,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/store/gameStore';
import { useProgressStore } from '@/store/progressStore';
import { TRACKS } from '@/types';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  isActive?: boolean;
  isLocked?: boolean;
}

function NavItem({ href, icon, label, badge, isActive, isLocked }: NavItemProps) {
  if (isLocked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--color-text-muted)] opacity-50 cursor-not-allowed">
        {icon}
        <span className="flex-1">{label}</span>
        <Lock className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
        isActive
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-[var(--color-text)] hover:bg-white/10'
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-[var(--color-accent)] text-black text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 opacity-50" />
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useGameStore();
  const { tracks } = useProgressStore();

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-[var(--color-surface)]/95 backdrop-blur-xl overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <NavItem
            href="/"
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            isActive={pathname === '/'}
          />
          <NavItem
            href="/quests"
            icon={<Swords className="h-5 w-5" />}
            label="Quests"
            isActive={pathname.startsWith('/quests')}
          />
          <NavItem
            href="/achievements"
            icon={<Trophy className="h-5 w-5" />}
            label="Achievements"
            isActive={pathname === '/achievements'}
          />
          <NavItem
            href="/playground"
            icon={<Terminal className="h-5 w-5" />}
            label="Playground"
            isActive={pathname === '/playground'}
          />
        </nav>

        {/* Learning Tracks */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Learning Tracks
          </h3>
          <nav className="space-y-1">
            {TRACKS.map((track) => {
              const progress = tracks[track.id];
              const percentage = progress
                ? Math.round((progress.lessonsCompleted / progress.totalLessons) * 100)
                : 0;
              const isLocked = track.prerequisites &&
                track.prerequisites.some(prereq => {
                  const prereqProgress = tracks[prereq];
                  return !prereqProgress || prereqProgress.lessonsCompleted < prereqProgress.totalLessons * 0.5;
                });

              return (
                <div key={track.id}>
                  <Link
                    href={isLocked ? '#' : `/learn/${track.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      isLocked
                        ? 'opacity-50 cursor-not-allowed text-[var(--color-text-muted)]'
                        : pathname.startsWith(`/learn/${track.id}`)
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text)] hover:bg-white/10'
                    )}
                  >
                    <span className="text-xl">{track.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{track.name}</span>
                        {isLocked && <Lock className="h-4 w-4 ml-1" />}
                      </div>
                      {!isLocked && (
                        <div className="mt-1">
                          <Progress
                            value={percentage}
                            className="h-1.5 bg-white/20"
                          />
                        </div>
                      )}
                    </div>
                    {!isLocked && (
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {percentage}%
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">
            Quick Stats
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Lessons Completed</span>
              <span className="text-[var(--color-text)]">
                {Object.values(tracks).reduce((sum, t) => sum + t.lessonsCompleted, 0)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Total Lessons</span>
              <span className="text-[var(--color-text)]">
                {Object.values(tracks).reduce((sum, t) => sum + t.totalLessons, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
