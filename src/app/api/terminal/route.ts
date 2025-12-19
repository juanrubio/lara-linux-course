import { NextResponse } from 'next/server';

// Note: Full WebSocket support requires a custom server setup
// This API route provides a REST fallback for command execution

export async function POST(request: Request) {
  try {
    const { command, context } = await request.json();

    // Validate command
    const { validateCommand } = await import('@/lib/terminal/validator');
    const validation = validateCommand(command);

    if (!validation.allowed) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    // For now, return a simulated response
    // In production, this would execute in a sandboxed environment
    const output = executeCommand(command);

    return NextResponse.json({ output });
  } catch (error) {
    console.error('Terminal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function executeCommand(command: string): string {
  const parts = command.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      return `Available Commands:
  ls       - List files and directories
  cd       - Change directory
  pwd      - Print working directory
  cat      - Display file contents
  echo     - Display text
  whoami   - Print username
  date     - Display date and time
  clear    - Clear terminal
  help     - Show this help

Tip: Use the up/down arrows to navigate command history!`;
    case 'whoami':
      return 'lara';
    case 'pwd':
      return '/home/lara';
    case 'date':
      return new Date().toString();
    case 'echo':
      return args.join(' ');
    case 'ls':
      return 'Documents  Downloads  workspace  welcome.txt';
    case 'cat':
      if (args[0] === 'welcome.txt') {
        return 'Welcome to CodeQuest Academy!\nStart your learning journey by exploring the lessons.';
      }
      return `cat: ${args[0] || '(missing file)'}: No such file or directory`;
    default:
      return `${cmd}: command simulation not implemented`;
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Terminal WebSocket endpoint. Use POST for REST API or connect via WebSocket.',
    status: 'ready',
  });
}
