'use client';

import { motion } from 'framer-motion';
import { NPC_CHARACTERS } from '@/types';

interface StoryBoxProps {
  character: string;
  children: React.ReactNode;
}

const characterEmojis: Record<string, string> = {
  commander_byte: '🎖️',
  pixel_the_penguin: '🐧',
  python_pete: '🐍',
  bash_betty: '⚡',
  pi_princess: '🍓',
};

const characterColors: Record<string, string> = {
  commander_byte: 'border-blue-500 bg-blue-900/20',
  pixel_the_penguin: 'border-orange-500 bg-orange-900/20',
  python_pete: 'border-green-500 bg-green-900/20',
  bash_betty: 'border-yellow-500 bg-yellow-900/20',
  pi_princess: 'border-pink-500 bg-pink-900/20',
};

export function StoryBox({ character, children }: StoryBoxProps) {
  const npc = NPC_CHARACTERS.find((c) => c.id === character);
  const emoji = characterEmojis[character] || '💬';
  const colorClass = characterColors[character] || 'border-purple-500 bg-purple-900/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border-2 p-4 mb-6 ${colorClass}`}
    >
      {/* Character avatar */}
      <div className="absolute -top-4 -left-2">
        <motion.div
          className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-2xl border-2 border-inherit shadow-lg"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>
      </div>

      {/* Character name */}
      <div className="ml-8 mb-2">
        <span className="text-sm font-bold text-[var(--color-text)]">
          {npc?.name || 'Guide'}
        </span>
        {npc?.title && (
          <span className="text-xs text-[var(--color-text-muted)] ml-2">
            {npc.title}
          </span>
        )}
      </div>

      {/* Speech bubble content */}
      <div className="ml-8 text-[var(--color-text)] italic leading-relaxed">
        {children}
      </div>

      {/* Speech bubble tail */}
      <div
        className="absolute top-8 -left-2 w-4 h-4 rotate-45 border-l-2 border-b-2 border-inherit"
        style={{ background: 'inherit' }}
      />
    </motion.div>
  );
}
