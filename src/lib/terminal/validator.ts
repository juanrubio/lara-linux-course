import {
  ALLOWED_COMMANDS,
  BLOCKED_PATTERNS,
  CommandConfig,
} from './whitelist';

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  warning?: string;
  sanitizedCommand?: string;
}

/**
 * Parse a command line into command and arguments
 */
function parseCommand(commandLine: string): { command: string; args: string[]; fullLine: string } {
  const trimmed = commandLine.trim();

  // Handle empty input
  if (!trimmed) {
    return { command: '', args: [], fullLine: '' };
  }

  // Simple parsing - split on spaces, handling basic quoting
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (!inQuote && (char === '"' || char === "'")) {
      inQuote = true;
      quoteChar = char;
    } else if (inQuote && char === quoteChar) {
      inQuote = false;
      quoteChar = '';
    } else if (!inQuote && char === ' ') {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  const [command, ...args] = parts;
  return { command: command || '', args, fullLine: trimmed };
}

/**
 * Check if a path is within the allowed restriction
 */
function isPathAllowed(path: string, restriction?: string): boolean {
  if (!restriction) return true;

  // Normalize paths
  const normalizedPath = path.replace(/\/+/g, '/');
  const normalizedRestriction = restriction.replace(/\/+/g, '/');

  // Check if path starts with restriction or is relative
  return (
    normalizedPath.startsWith(normalizedRestriction) ||
    normalizedPath.startsWith('./') ||
    normalizedPath.startsWith('../') ||
    !normalizedPath.startsWith('/')
  );
}

/**
 * Check for dangerous flags in arguments
 */
function hasBlockedFlags(args: string[], blockedFlags?: string[]): string | null {
  if (!blockedFlags || blockedFlags.length === 0) return null;

  for (const arg of args) {
    for (const blocked of blockedFlags) {
      if (arg === blocked || arg.startsWith(blocked)) {
        return blocked;
      }
    }
  }

  return null;
}

/**
 * Validate a command line input
 */
export function validateCommand(commandLine: string): ValidationResult {
  const { command, args, fullLine } = parseCommand(commandLine);

  // Empty command is allowed (just pressing enter)
  if (!command) {
    return { allowed: true };
  }

  // Check against blocked patterns first
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(fullLine)) {
      return {
        allowed: false,
        reason: `This command pattern is not allowed for safety reasons.`,
      };
    }
  }

  // Check if command is in whitelist
  const config = ALLOWED_COMMANDS[command];
  if (!config) {
    // Check if it's a script execution or path
    if (command.includes('/') || command.startsWith('./')) {
      return {
        allowed: false,
        reason: `Running scripts directly is not allowed. Use 'bash scriptname.sh' or 'python3 script.py' instead.`,
      };
    }

    return {
      allowed: false,
      reason: `Command '${command}' is not available in this learning environment. Try 'help' to see available commands.`,
    };
  }

  // Check argument count
  if (config.maxArgs !== undefined && args.length > config.maxArgs) {
    return {
      allowed: false,
      reason: `Too many arguments for '${command}'. Maximum allowed: ${config.maxArgs}`,
    };
  }

  // Check for blocked flags
  const blockedFlag = hasBlockedFlags(args, config.blockedFlags);
  if (blockedFlag) {
    return {
      allowed: false,
      reason: `The flag '${blockedFlag}' is not allowed with '${command}' for safety reasons.`,
    };
  }

  // Check path restrictions for file arguments
  if (config.pathRestriction) {
    for (const arg of args) {
      // Skip flags
      if (arg.startsWith('-')) continue;

      // Check if it looks like a path
      if (arg.includes('/') || arg === '..') {
        if (!isPathAllowed(arg, config.pathRestriction)) {
          return {
            allowed: false,
            reason: `Access to paths outside your workspace is restricted. Stay within ${config.pathRestriction}`,
          };
        }
      }
    }
  }

  // Check for pipes and redirects
  if (fullLine.includes('|') && !config.allowPipe) {
    return {
      allowed: true, // Allow but warn
      warning: `Piping output may be limited for this command.`,
    };
  }

  if ((fullLine.includes('>') || fullLine.includes('<')) && !config.allowRedirect) {
    return {
      allowed: true, // Allow but warn
      warning: `Redirection may be limited for this command.`,
    };
  }

  return {
    allowed: true,
    sanitizedCommand: fullLine,
  };
}

/**
 * Validate a Python code snippet for safety
 */
export function validatePythonCode(code: string): ValidationResult {
  const dangerousPatterns = [
    /import\s+os/,
    /import\s+subprocess/,
    /import\s+sys/,
    /from\s+os\s+import/,
    /exec\s*\(/,
    /eval\s*\(/,
    /open\s*\([^)]*['"](\/(?!home\/lara\/workspace))/,
    /__import__/,
    /compile\s*\(/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        allowed: false,
        reason: 'This Python code contains patterns that are not allowed in the learning environment.',
      };
    }
  }

  return { allowed: true };
}

/**
 * Validate a Bash script for safety
 */
export function validateBashScript(script: string): ValidationResult {
  // Use the same blocked patterns as command validation
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(script)) {
      return {
        allowed: false,
        reason: 'This script contains commands that are not allowed for safety.',
      };
    }
  }

  // Additional script-specific checks
  const dangerousPatterns = [
    /\$\{[^}]*:-.*\}.*rm/, // Dangerous parameter expansion with rm
    /while\s+true\s*;\s*do.*done/, // Infinite loops without break (basic check)
    /fork\s*\(\)/, // Fork bombs
    /:\s*\(\)\s*{\s*:\s*\|\s*:\s*&\s*}\s*;/, // Fork bomb pattern
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(script)) {
      return {
        allowed: false,
        reason: 'This script contains potentially dangerous patterns.',
      };
    }
  }

  return { allowed: true };
}

/**
 * Get a friendly list of available commands
 */
export function getAvailableCommands(): { command: string; description: string }[] {
  return Object.entries(ALLOWED_COMMANDS)
    .filter(([_, config]) => config.description)
    .map(([command, config]) => ({
      command,
      description: config.description!,
    }))
    .sort((a, b) => a.command.localeCompare(b.command));
}
