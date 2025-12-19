'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useGameStore } from '@/store/gameStore';
import { validateCommand } from '@/lib/terminal/validator';

interface TerminalProps {
  onCommand?: (command: string, output: string) => void;
  welcomeMessage?: string;
  className?: string;
  lessonContext?: string;
}

export function Terminal({
  onCommand,
  welcomeMessage,
  className = '',
  lessonContext,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentLineRef = useRef('');

  const { preferences } = useGameStore();

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: preferences.terminalFontSize,
      fontFamily: 'var(--font-geist-mono), monospace',
      theme: {
        background: 'var(--color-terminal-bg, #0a0a0a)',
        foreground: 'var(--color-terminal-text, #22c55e)',
        cursor: 'var(--color-primary, #6366f1)',
        cursorAccent: '#000000',
        selectionBackground: 'rgba(99, 102, 241, 0.3)',
        black: '#000000',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#f1f5f9',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Delay fit until DOM has rendered with dimensions
    requestAnimationFrame(() => {
      if (terminalRef.current && terminalRef.current.offsetWidth > 0) {
        fitAddon.fit();
      }
    });

    // Write welcome message
    if (welcomeMessage) {
      term.writeln(welcomeMessage);
    } else {
      term.writeln('\x1b[1;36m╔════════════════════════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;33m🚀 Welcome to CodeQuest Academy Terminal!\x1b[0m              \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m                                                          \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m  Type \x1b[1;32mhelp\x1b[0m to see available commands                    \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m  Type \x1b[1;32mclear\x1b[0m to clear the screen                        \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m╚════════════════════════════════════════════════════════╝\x1b[0m');
      term.writeln('');
    }

    // Write initial prompt
    writePrompt(term);

    // Handle resize
    const handleResize = () => {
      if (terminalRef.current && terminalRef.current.offsetWidth > 0) {
        try {
          fitAddon.fit();
        } catch {
          // Ignore fit errors if terminal isn't ready
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, [welcomeMessage, preferences.terminalFontSize]);

  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/terminal`);

    ws.onopen = () => {
      setIsConnected(true);
      if (lessonContext) {
        ws.send(JSON.stringify({ type: 'context', context: lessonContext }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'output' && xtermRef.current) {
        xtermRef.current.write(data.data);
      } else if (data.type === 'error' && xtermRef.current) {
        xtermRef.current.writeln(`\x1b[1;31mError: ${data.message}\x1b[0m`);
        writePrompt(xtermRef.current);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [lessonContext]);

  // Handle terminal input
  useEffect(() => {
    const term = xtermRef.current;
    if (!term) return;

    const handleData = (data: string) => {
      const ws = wsRef.current;

      // Handle special keys
      if (data === '\r') {
        // Enter key
        const command = currentLineRef.current.trim();
        term.writeln('');

        if (command) {
          // Add to history
          setCommandHistory((prev) => [...prev.slice(-99), command]);
          setHistoryIndex(-1);

          // Validate command locally first
          const validation = validateCommand(command);
          if (!validation.allowed) {
            term.writeln(`\x1b[1;31m✗ ${validation.reason}\x1b[0m`);
            writePrompt(term);
          } else {
            if (validation.warning) {
              term.writeln(`\x1b[1;33m⚠ ${validation.warning}\x1b[0m`);
            }
            // Send to server
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'command', command }));
              onCommand?.(command, '');
            } else {
              // Fallback: execute locally for demo purposes
              executeLocalCommand(term, command);
            }
          }
        } else {
          writePrompt(term);
        }

        currentLineRef.current = '';
      } else if (data === '\x7f') {
        // Backspace
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === '\x1b[A') {
        // Up arrow - history
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          replaceCurrentLine(term, commandHistory[newIndex]);
        }
      } else if (data === '\x1b[B') {
        // Down arrow - history
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            replaceCurrentLine(term, '');
          } else {
            setHistoryIndex(newIndex);
            replaceCurrentLine(term, commandHistory[newIndex]);
          }
        }
      } else if (data === '\x03') {
        // Ctrl+C
        term.writeln('^C');
        currentLineRef.current = '';
        writePrompt(term);
      } else if (data === '\x0c') {
        // Ctrl+L - clear
        term.clear();
        writePrompt(term);
      } else if (data >= ' ' || data === '\t') {
        // Regular character
        currentLineRef.current += data;
        term.write(data);
      }
    };

    const disposable = term.onData(handleData);
    return () => disposable.dispose();
  }, [commandHistory, historyIndex, onCommand]);

  const writePrompt = (term: XTerm) => {
    term.write('\x1b[1;32mlara\x1b[0m@\x1b[1;34mcodequest\x1b[0m:\x1b[1;36m~\x1b[0m$ ');
  };

  const replaceCurrentLine = (term: XTerm, newLine: string) => {
    // Clear current line
    const clearLength = currentLineRef.current.length;
    term.write('\b'.repeat(clearLength) + ' '.repeat(clearLength) + '\b'.repeat(clearLength));
    // Write new line
    currentLineRef.current = newLine;
    term.write(newLine);
  };

  // Local command execution for demo/offline mode
  const executeLocalCommand = (term: XTerm, command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        term.writeln('\x1b[1;36mAvailable Commands:\x1b[0m');
        term.writeln('  \x1b[1;32mls\x1b[0m       - List files and directories');
        term.writeln('  \x1b[1;32mcd\x1b[0m       - Change directory');
        term.writeln('  \x1b[1;32mpwd\x1b[0m      - Print working directory');
        term.writeln('  \x1b[1;32mcat\x1b[0m      - Display file contents');
        term.writeln('  \x1b[1;32mecho\x1b[0m     - Display text');
        term.writeln('  \x1b[1;32mwhoami\x1b[0m   - Print username');
        term.writeln('  \x1b[1;32mdate\x1b[0m     - Display date and time');
        term.writeln('  \x1b[1;32mclear\x1b[0m    - Clear terminal');
        term.writeln('  \x1b[1;32mhelp\x1b[0m     - Show this help');
        term.writeln('');
        term.writeln('\x1b[1;33mTip:\x1b[0m Use the up/down arrows to navigate command history!');
        break;
      case 'whoami':
        term.writeln('lara');
        break;
      case 'pwd':
        term.writeln('/home/lara');
        break;
      case 'date':
        term.writeln(new Date().toString());
        break;
      case 'echo':
        term.writeln(args.join(' '));
        break;
      case 'clear':
        term.clear();
        break;
      case 'ls':
        term.writeln('\x1b[1;34mDocuments\x1b[0m  \x1b[1;34mDownloads\x1b[0m  \x1b[1;34mworkspace\x1b[0m  welcome.txt');
        break;
      case 'cat':
        if (args[0] === 'welcome.txt') {
          term.writeln('Welcome to CodeQuest Academy!');
          term.writeln('Start your learning journey by exploring the lessons.');
        } else {
          term.writeln(`cat: ${args[0] || '(missing file)'}: No such file or directory`);
        }
        break;
      default:
        term.writeln(`\x1b[1;33m${cmd}: command not found in demo mode\x1b[0m`);
        term.writeln('Connect to the server for full terminal access.');
    }
    writePrompt(term);
  };

  return (
    <div className={`terminal-container relative ${className}`}>
      {!isConnected && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
          Demo Mode
        </div>
      )}
      <div
        ref={terminalRef}
        className="w-full h-full min-h-[300px]"
        style={{
          padding: '12px',
          background: 'var(--color-terminal-bg)',
        }}
      />
    </div>
  );
}
