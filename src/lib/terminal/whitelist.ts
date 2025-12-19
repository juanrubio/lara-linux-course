// Command whitelist for safe execution in the learning environment

export interface CommandConfig {
  maxArgs?: number;
  blockedFlags?: string[];
  pathRestriction?: string;
  maxFileSize?: number;
  allowPipe?: boolean;
  allowRedirect?: boolean;
  description?: string;
}

// Commands allowed in the sandbox environment
export const ALLOWED_COMMANDS: Record<string, CommandConfig> = {
  // Navigation & Directory
  ls: {
    maxArgs: 10,
    blockedFlags: [],
    allowPipe: true,
    description: 'List directory contents',
  },
  cd: {
    maxArgs: 1,
    pathRestriction: '/home/learner',
    description: 'Change directory',
  },
  pwd: {
    maxArgs: 0,
    description: 'Print working directory',
  },
  tree: {
    maxArgs: 3,
    pathRestriction: '/home/learner',
    description: 'Display directory tree',
  },

  // File Reading
  cat: {
    maxArgs: 5,
    maxFileSize: 50000,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Concatenate and display files',
  },
  head: {
    maxArgs: 5,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Display first lines of file',
  },
  tail: {
    maxArgs: 5,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Display last lines of file',
  },
  less: {
    maxArgs: 1,
    pathRestriction: '/home/learner',
    description: 'View file with pagination',
  },
  more: {
    maxArgs: 1,
    pathRestriction: '/home/learner',
    description: 'View file with pagination',
  },

  // File Operations (restricted to sandbox)
  touch: {
    maxArgs: 3,
    pathRestriction: '/home/learner/workspace',
    description: 'Create empty file',
  },
  mkdir: {
    maxArgs: 2,
    pathRestriction: '/home/learner/workspace',
    description: 'Create directory',
  },
  rmdir: {
    maxArgs: 1,
    pathRestriction: '/home/learner/workspace',
    description: 'Remove empty directory',
  },
  cp: {
    maxArgs: 3,
    pathRestriction: '/home/learner/workspace',
    blockedFlags: ['-r', '-R', '--recursive'],
    description: 'Copy files',
  },
  mv: {
    maxArgs: 3,
    pathRestriction: '/home/learner/workspace',
    description: 'Move/rename files',
  },
  rm: {
    maxArgs: 2,
    pathRestriction: '/home/learner/workspace',
    blockedFlags: ['-rf', '-fr', '-r', '-R', '--recursive', '-f', '--force'],
    description: 'Remove files (carefully!)',
  },

  // Text Processing
  echo: {
    maxArgs: 20,
    allowRedirect: true,
    description: 'Display text',
  },
  grep: {
    maxArgs: 5,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Search for patterns',
  },
  sort: {
    maxArgs: 5,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Sort lines',
  },
  wc: {
    maxArgs: 5,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Word, line, character count',
  },
  cut: {
    maxArgs: 5,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Remove sections from lines',
  },
  uniq: {
    maxArgs: 3,
    pathRestriction: '/home/learner',
    allowPipe: true,
    description: 'Report or omit repeated lines',
  },
  tr: {
    maxArgs: 4,
    allowPipe: true,
    description: 'Translate characters',
  },

  // File Info
  file: {
    maxArgs: 3,
    pathRestriction: '/home/learner',
    description: 'Determine file type',
  },
  stat: {
    maxArgs: 2,
    pathRestriction: '/home/learner',
    description: 'Display file status',
  },

  // System Info (read-only)
  whoami: {
    maxArgs: 0,
    description: 'Print username',
  },
  date: {
    maxArgs: 3,
    description: 'Display date and time',
  },
  cal: {
    maxArgs: 3,
    description: 'Display calendar',
  },
  uptime: {
    maxArgs: 0,
    description: 'System uptime',
  },
  df: {
    maxArgs: 2,
    description: 'Disk space usage',
  },
  free: {
    maxArgs: 2,
    description: 'Memory usage',
  },
  uname: {
    maxArgs: 2,
    description: 'System information',
  },
  hostname: {
    maxArgs: 0,
    description: 'Display hostname',
  },
  id: {
    maxArgs: 0,
    description: 'Print user identity',
  },
  env: {
    maxArgs: 0,
    description: 'Display environment',
  },

  // Python
  python3: {
    maxArgs: 3,
    pathRestriction: '/home/learner/workspace',
    description: 'Run Python 3',
  },
  python: {
    maxArgs: 3,
    pathRestriction: '/home/learner/workspace',
    description: 'Run Python',
  },

  // Help
  man: {
    maxArgs: 1,
    description: 'Manual pages',
  },
  help: {
    maxArgs: 1,
    description: 'Display help',
  },
  type: {
    maxArgs: 1,
    description: 'Display command type',
  },
  which: {
    maxArgs: 1,
    description: 'Locate command',
  },

  // Bash built-ins for scripting
  export: {
    maxArgs: 3,
    description: 'Set environment variable',
  },
  read: {
    maxArgs: 3,
    description: 'Read input',
  },
  test: {
    maxArgs: 5,
    description: 'Evaluate expression',
  },
  '[': {
    maxArgs: 6,
    description: 'Test expression',
  },
  true: {
    maxArgs: 0,
    description: 'Return true',
  },
  false: {
    maxArgs: 0,
    description: 'Return false',
  },
  exit: {
    maxArgs: 1,
    description: 'Exit shell',
  },

  // Text editors (safe ones)
  nano: {
    maxArgs: 1,
    pathRestriction: '/home/learner/workspace',
    description: 'Simple text editor',
  },

  // Basic utilities
  clear: {
    maxArgs: 0,
    description: 'Clear terminal',
  },
  history: {
    maxArgs: 1,
    description: 'Command history',
  },
  alias: {
    maxArgs: 2,
    description: 'Create command alias',
  },

  // Fun commands for engagement
  cowsay: {
    maxArgs: 5,
    description: 'Speaking cow',
  },
  figlet: {
    maxArgs: 5,
    description: 'ASCII art text',
  },
  sl: {
    maxArgs: 0,
    description: 'Steam locomotive',
  },
  fortune: {
    maxArgs: 0,
    description: 'Random fortune',
  },
};

// Patterns that are always blocked regardless of command
export const BLOCKED_PATTERNS: RegExp[] = [
  /rm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+|--recursive|--force)/i, // rm -rf, rm -r, rm -f variants
  />\s*\/(?!home\/learner\/workspace)/, // Writing outside workspace
  /sudo/, // No sudo
  /su\s+/, // No su
  /chmod\s+[0-7]*7/, // No world-writable
  /\|\s*(bash|sh|zsh)/, // No piping to shell
  /curl|wget|nc|netcat|ncat/, // No network tools
  /eval\s/, // No eval
  /exec\s/, // No exec
  /source\s+(?!\/home\/learner)/, // Restrict source command
  /\.\s+(?!\/home\/learner)/, // Restrict . command
  /`[^`]*`/, // Backtick command substitution (limit)
  /\$\([^)]*\)/, // $() command substitution (limit for complex cases)
  /;\s*sudo/, // Chained sudo
  /&&\s*sudo/, // Conditional sudo
  /\|\|\s*sudo/, // OR sudo
  />\s*\/dev\//, // Writing to devices
  /mkfs/, // No filesystem creation
  /dd\s/, // No dd command
  /reboot|shutdown|poweroff|halt/, // No system control
  /kill\s+-9/, // No force kill
  /pkill|killall/, // No process killing
  /crontab/, // No cron manipulation
  /systemctl|service/, // No service control
  /iptables|firewall/, // No firewall changes
  /useradd|userdel|usermod/, // No user management
  /passwd/, // No password changes
  /chown/, // No ownership changes
  /mount|umount/, // No mount operations
  /fdisk|parted/, // No disk partition
];

// Commands that can run scripts/files - need extra validation
export const EXECUTABLE_COMMANDS = ['python', 'python3', 'bash', 'sh', 'node'];

// Maximum output size in bytes
export const MAX_OUTPUT_SIZE = 100000;

// Maximum execution time in milliseconds
export const MAX_EXECUTION_TIME = 30000;
