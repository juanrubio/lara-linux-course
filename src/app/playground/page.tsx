'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { AppShell, Navigation } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import with SSR disabled - xterm.js uses browser APIs (self, window)
const Terminal = dynamic(
  () => import('@/components/terminal').then((mod) => mod.Terminal),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-[#1a1b26] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-4 w-48 mb-2 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    ),
  }
);

export default function PlaygroundPage() {
  return (
    <AppShell>
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <Navigation breadcrumbs={[{ label: 'Playground' }]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <TerminalIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Terminal Playground
                </h1>
                <p className="text-[var(--color-text-muted)]">
                  Practice freely and experiment with commands
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">+2 XP per minute</span>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
            <Terminal
              welcomeMessage={`\x1b[1;33m🎮 Welcome to the Terminal Playground!\x1b[0m

\x1b[1;36mThis is your space to experiment and practice commands freely.\x1b[0m
You earn XP just for spending time here!

\x1b[1;37mTry these commands:\x1b[0m
  \x1b[1;32mls -la\x1b[0m      List all files with details
  \x1b[1;32mpwd\x1b[0m         Show current directory
  \x1b[1;32mecho "Hi!"\x1b[0m  Display a message
  \x1b[1;32mhelp\x1b[0m        See available commands

\x1b[1;35m💡 Secret: Try 'cowsay' or 'figlet' for a surprise!\x1b[0m
`}
              className="h-full"
            />
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
