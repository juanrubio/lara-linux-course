'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { StoryBox } from './StoryBox';
import { ExerciseCard } from './ExerciseCard';
import { Quiz } from './Quiz';
import { CodeBlock } from './CodeBlock';
import { FunFact } from './FunFact';
import { Challenge } from './Challenge';
import { NextLesson } from './NextLesson';
import { TerminalDemo } from './TerminalDemo';

// MDX Components mapping
const mdxComponents = {
  // Custom components
  StoryBox,
  ExerciseCard,
  Quiz,
  CodeBlock,
  FunFact,
  Challenge,
  NextLesson,
  TerminalDemo,
  Terminal: TerminalDemo,

  // Override default HTML elements
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl font-bold text-[var(--color-text)] mt-8 mb-4"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-bold text-[var(--color-text)] mt-6 mb-3 flex items-center gap-2"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl font-semibold text-[var(--color-text)] mt-4 mb-2"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-[var(--color-text)] leading-relaxed mb-4"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-inside text-[var(--color-text)] mb-4 space-y-2"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-inside text-[var(--color-text)] mb-4 space-y-2"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-[var(--color-text)]" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-accent)] font-mono text-sm"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="p-4 rounded-lg bg-[var(--color-terminal-bg)] overflow-x-auto mb-4"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-[var(--color-primary)] pl-4 py-2 mb-4 italic text-[var(--color-text-muted)]"
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="w-full border-collapse border border-white/10 rounded-lg"
        {...props}
      />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border border-white/10 px-4 py-2 bg-[var(--color-surface)] text-left font-semibold text-[var(--color-text)]"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="border border-white/10 px-4 py-2 text-[var(--color-text)]"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] underline"
      {...props}
    />
  ),
  hr: () => (
    <hr className="border-t border-white/10 my-8" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-[var(--color-accent)]" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-[var(--color-text)]" {...props} />
  ),
};

interface LessonContentProps {
  source: MDXRemoteSerializeResult;
  className?: string;
}

export function LessonContent({ source, className = '' }: LessonContentProps) {
  return (
    <article className={`prose prose-invert max-w-none ${className}`}>
      <MDXRemote {...source} components={mdxComponents} />
    </article>
  );
}
