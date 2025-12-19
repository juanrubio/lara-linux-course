'use client';

import Link from 'next/link';
import { Menu, Settings, Trophy, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGameStore, selectXpProgress } from '@/store/gameStore';

const LEVEL_TITLES = [
  'Terminal Newbie',
  'Command Cadet',
  'File Explorer',
  'Script Apprentice',
  'Code Warrior',
  'System Navigator',
  'Terminal Tactician',
  'Bash Baron',
  'Python Pioneer',
  'Linux Legend',
  'Tech Titan',
  'Code Commander',
  'System Sage',
  'Digital Deity',
  'Master Hacker',
];

export function Header() {
  const { displayName, avatarId, stats, toggleSidebar } = useGameStore();
  const xpProgress = useGameStore(selectXpProgress);

  const levelTitle = LEVEL_TITLES[stats.currentLevel - 1] || 'Master Hacker';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[var(--color-surface)]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-[var(--color-text)]"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--color-accent)]" />
            <span className="text-xl font-bold text-[var(--color-text)]">
              CodeQuest Academy
            </span>
          </Link>
        </div>

        {/* Right side - Stats and user */}
        <div className="flex items-center gap-6">
          {/* Streak */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{stats.currentStreak}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {stats.currentStreak} day streak! Best: {stats.longestStreak} days
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* XP Progress */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-[var(--color-text)]">
                Level {stats.currentLevel}
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {levelTitle}
              </div>
            </div>
            <div className="w-32">
              <Progress
                value={xpProgress.percentage}
                className="h-2 bg-white/10"
              />
              <div className="text-xs text-[var(--color-text-muted)] mt-1 text-center">
                {xpProgress.current} / {xpProgress.required} XP
              </div>
            </div>
          </div>

          {/* Achievements link */}
          <Link href="/achievements">
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--color-text)]"
            >
              <Trophy className="h-5 w-5" />
            </Button>
          </Link>

          {/* Settings */}
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--color-text)]"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          {/* User avatar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border-2 border-[var(--color-primary)]">
                    <AvatarImage
                      src={`/images/avatars/${avatarId}.png`}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-[var(--color-primary)] text-white">
                      {displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium text-[var(--color-text)]">
                    {displayName}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total XP: {stats.totalXp}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
