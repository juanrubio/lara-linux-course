'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useGameStore } from '@/store/gameStore';
import { getTerminalConnection, ConnectionStatus } from '@/lib/terminalConnection';
import { checkCommandAchievements } from '@/lib/gamification/achievement-manager';

interface TerminalProps {
  onCommand?: (command: string, output: string) => void;
  welcomeMessage?: string;
  className?: string;
}

export function Terminal({
  onCommand,
  welcomeMessage,
  className = '',
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const onCommandRef = useRef<TerminalProps['onCommand']>(onCommand);
  const welcomeMessageRef = useRef(welcomeMessage);
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);

  const { preferences, trackCommand, unlockAchievement, showAchievement, addXP } = useGameStore();
  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  // Demo mode handlers
  const currentLineRef = useRef('');
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // Real terminal mode - track commands for achievements
  const realTerminalBufferRef = useRef('');

  const writePrompt = useCallback((term: XTerm) => {
    term.write('\x1b[1;32mlara\x1b[0m@\x1b[1;34mraspberrypi\x1b[0m:\x1b[1;36m~\x1b[0m$ ');
  }, []);

  const replaceCurrentLine = useCallback((term: XTerm, newLine: string) => {
    const clearLength = currentLineRef.current.length;
    term.write('\b'.repeat(clearLength) + ' '.repeat(clearLength) + '\b'.repeat(clearLength));
    currentLineRef.current = newLine;
    term.write(newLine);
  }, []);

  const executeDemoCommand = useCallback((term: XTerm, command: string) => {
    const [cmd, ...args] = command.split(' ');

    // Track the command for achievements
    const flags = args.filter(arg => arg.startsWith('-'));
    trackCommand(cmd, flags);

    switch (cmd) {
      case 'help':
        term.writeln('\x1b[1;36mDemo Mode Commands:\x1b[0m');
        term.writeln('  \x1b[1;32mls\x1b[0m, \x1b[1;32mpwd\x1b[0m, \x1b[1;32mcat\x1b[0m, \x1b[1;32mecho\x1b[0m, \x1b[1;32mwhoami\x1b[0m, \x1b[1;32mdate\x1b[0m, \x1b[1;32mclear\x1b[0m');
        break;
      case 'whoami': term.writeln('lara'); break;
      case 'pwd': term.writeln('/home/lara'); break;
      case 'date': term.writeln(new Date().toString()); break;
      case 'echo': term.writeln(args.join(' ')); break;
      case 'clear': term.clear(); break;
      case 'ls': term.writeln('\x1b[1;34mDocuments\x1b[0m  \x1b[1;34mDownloads\x1b[0m  welcome.txt'); break;
      case 'cat':
        if (args[0] === 'welcome.txt') term.writeln('Welcome to CodeQuest!');
        else term.writeln(`cat: ${args[0] || '(missing)'}: No such file`);
        break;
      default: term.writeln(`\x1b[1;33m${cmd}: not available in demo\x1b[0m`);
    }

    // Check for command achievements
    const newAchievements = checkCommandAchievements(useGameStore.getState());
    for (const { achievementId, xpReward } of newAchievements) {
      unlockAchievement(achievementId);
      showAchievement(achievementId);
      addXP(xpReward);
    }

    writePrompt(term);
  }, [writePrompt, trackCommand, unlockAchievement, showAchievement, addXP]);

  const handleDemoInput = useCallback((term: XTerm, data: string) => {
    if (data === '\r') {
      const cmd = currentLineRef.current.trim();
      term.writeln('');
      if (cmd) {
        commandHistoryRef.current = [...commandHistoryRef.current.slice(-99), cmd];
        historyIndexRef.current = -1;
        executeDemoCommand(term, cmd);
      } else writePrompt(term);
      currentLineRef.current = '';
    } else if (data === '\x7f') {
      if (currentLineRef.current.length > 0) {
        currentLineRef.current = currentLineRef.current.slice(0, -1);
        term.write('\b \b');
      }
    } else if (data === '\x1b[A' && commandHistoryRef.current.length > 0) {
      const idx = historyIndexRef.current === -1
        ? commandHistoryRef.current.length - 1
        : Math.max(0, historyIndexRef.current - 1);
      historyIndexRef.current = idx;
      replaceCurrentLine(term, commandHistoryRef.current[idx]);
    } else if (data === '\x1b[B' && historyIndexRef.current !== -1) {
      const idx = historyIndexRef.current + 1;
      if (idx >= commandHistoryRef.current.length) {
        historyIndexRef.current = -1;
        replaceCurrentLine(term, '');
      } else {
        historyIndexRef.current = idx;
        replaceCurrentLine(term, commandHistoryRef.current[idx]);
      }
    } else if (data === '\x03') {
      term.writeln('^C');
      currentLineRef.current = '';
      writePrompt(term);
    } else if (data === '\x0c') {
      term.clear();
      writePrompt(term);
    } else if (data >= ' ' || data === '\t') {
      currentLineRef.current += data;
      term.write(data);
    }
  }, [executeDemoCommand, replaceCurrentLine, writePrompt]);

  // Main effect - setup xterm and subscribe to connection
  useEffect(() => {
    if (!terminalRef.current) return;

    const mountId = Math.random().toString(36).slice(2, 8);
    console.log(`[Terminal] Setting up (${mountId})`);
    const connection = getTerminalConnection();
    const decoder = new TextDecoder('utf-8');

    // Create xterm
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: preferences.terminalFontSize,
      fontFamily: 'var(--font-geist-mono), monospace',
      scrollback: 500,
      convertEol: true,
      theme: {
        background: '#0a0a0a',
        foreground: '#22c55e',
        cursor: '#6366f1',
        black: '#000000', red: '#ef4444', green: '#22c55e', yellow: '#f59e0b',
        blue: '#3b82f6', magenta: '#8b5cf6', cyan: '#06b6d4', white: '#f1f5f9',
        brightBlack: '#475569', brightRed: '#f87171', brightGreen: '#4ade80',
        brightYellow: '#fbbf24', brightBlue: '#60a5fa', brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee', brightWhite: '#ffffff',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);
    try { fitAddon.fit(); } catch {}

    // Welcome message
    if (welcomeMessageRef.current) {
      welcomeMessageRef.current.split('\n').forEach(line => term.writeln(line));
    }

    // Subscribe to messages
    const unsubMsg = connection.onMessage((data) => {
      if (data instanceof ArrayBuffer) {
        term.write(decoder.decode(data));
        onCommandRef.current?.('', decoder.decode(data));
      } else if (typeof data === 'string') {
        try {
          const msg = JSON.parse(data);
          if (msg.type === 'exit') term.writeln('\r\n\x1b[1;31mSession ended.\x1b[0m');
        } catch {}
      }
    });

    // Subscribe to status
    const unsubStatus = connection.onStatus((status) => {
      setConnectionStatus(status);
      if (status === ConnectionStatus.CONNECTED) {
        setTimeout(() => {
          try {
            const dims = fitAddon.proposeDimensions();
            if (dims) connection.resize(dims.cols, dims.rows);
          } catch {}
        }, 100);
      }
    });

    // Input handler
    const inputDisp = term.onData((data) => {
      const status = connection.getStatus();
      if (status === ConnectionStatus.CONNECTED) {
        // Track commands in real terminal mode
        if (data === '\r') {
          // Enter pressed - track the command
          const command = realTerminalBufferRef.current.trim();
          if (command) {
            console.log('[Terminal] Command entered:', command);
            const [cmd, ...args] = command.split(' ');
            const flags = args.filter(arg => arg.startsWith('-'));
            trackCommand(cmd, flags);

            // Check for command achievements
            const newAchievements = checkCommandAchievements(useGameStore.getState());
            for (const { achievementId, xpReward } of newAchievements) {
              unlockAchievement(achievementId);
              showAchievement(achievementId);
              addXP(xpReward);
            }
          }
          realTerminalBufferRef.current = '';
        } else if (data === '\x7f') {
          // Backspace
          realTerminalBufferRef.current = realTerminalBufferRef.current.slice(0, -1);
        } else if (data >= ' ' || data === '\t') {
          // Regular character
          realTerminalBufferRef.current += data;
        } else if (data === '\x03') {
          // Ctrl+C - clear buffer
          realTerminalBufferRef.current = '';
        }

        connection.send(JSON.stringify({ type: 'input', data }));
      } else if (status === ConnectionStatus.DISCONNECTED) {
        handleDemoInput(term, data);
      }
    });

    // Resize observer
    let resizeTimer: NodeJS.Timeout | null = null;
    const resizeObs = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        try {
          fitAddon.fit();
          const dims = fitAddon.proposeDimensions();
          if (dims && connection.isConnected()) {
            connection.resize(dims.cols, dims.rows);
          }
        } catch {}
      }, 100);
    });
    resizeObs.observe(terminalRef.current);

    // Ensure connected
    connection.ensureConnected();

    return () => {
      console.log(`[Terminal] Cleanup (${mountId})`);
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeObs.disconnect();
      unsubMsg();
      unsubStatus();
      inputDisp.dispose();
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [handleDemoInput, preferences.terminalFontSize, trackCommand, unlockAchievement, showAchievement, addXP]);

  return (
    <div className={`terminal-container relative ${className}`}>
      {!isConnected && (
        <div
          className={`absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded ${
            connectionStatus === ConnectionStatus.CONNECTING
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {connectionStatus === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Demo Mode'}
        </div>
      )}
      <div
        ref={terminalRef}
        className="w-full h-full min-h-[300px]"
        style={{ padding: '12px', background: 'var(--color-terminal-bg)' }}
      />
    </div>
  );
}
