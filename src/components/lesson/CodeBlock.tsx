'use client';

import { useState, ReactNode } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
}

export function CodeBlock({
  children,
  language = 'bash',
  showLineNumbers = false,
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract text content from React nodes (same as TerminalDemo)
  const extractText = (node: ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object' && 'props' in node && node.props.children) {
      return extractText(node.props.children);
    }
    return '';
  };

  const content = extractText(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = content.trim().split('\n');

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface)] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span className="text-sm text-[var(--color-text-muted)]">
            {title || language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="bg-[var(--color-terminal-bg)] p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          {lines.map((line, index) => (
            <div key={index} className="flex">
              {showLineNumbers && (
                <span className="select-none pr-4 text-[var(--color-text-muted)] text-right w-8">
                  {index + 1}
                </span>
              )}
              <code className="text-[var(--color-terminal-text)]">
                {highlightLine(line, language)}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// Simple syntax highlighting
function highlightLine(line: string, language: string): React.ReactNode {
  if (language === 'bash' || language === 'shell') {
    // Highlight prompt
    if (line.startsWith('$')) {
      return (
        <>
          <span className="text-green-400">$</span>
          <span className="text-[var(--color-terminal-text)]">{line.slice(1)}</span>
        </>
      );
    }
    // Highlight comments
    if (line.trim().startsWith('#')) {
      return <span className="text-gray-500">{line}</span>;
    }
  }

  if (language === 'python') {
    // Highlight comments
    if (line.trim().startsWith('#')) {
      return <span className="text-gray-500">{line}</span>;
    }
    // Highlight strings
    const stringHighlighted = line.replace(
      /(["'])(.*?)\1/g,
      '<span class="text-yellow-400">$&</span>'
    );
    // Highlight keywords
    const keywords = ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'class', 'print'];
    let result = stringHighlighted;
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      result = result.replace(regex, `<span class="text-purple-400">${kw}</span>`);
    });
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  }

  return line;
}
