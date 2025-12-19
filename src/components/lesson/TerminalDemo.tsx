'use client';

interface TerminalDemoProps {
  children: string;
}

export function TerminalDemo({ children }: TerminalDemoProps) {
  const lines = children.trim().split('\n');

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-white/10">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-400 ml-2">Terminal</span>
      </div>

      {/* Terminal content */}
      <div className="bg-[var(--color-terminal-bg)] p-4 font-mono text-sm">
        {lines.map((line, index) => (
          <div key={index} className="leading-relaxed">
            {formatTerminalLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTerminalLine(line: string): React.ReactNode {
  // Command prompt
  if (line.startsWith('$')) {
    return (
      <>
        <span className="text-green-400">$</span>
        <span className="text-[var(--color-text)]">{line.slice(1)}</span>
      </>
    );
  }

  // Output
  return <span className="text-gray-300">{line}</span>;
}
