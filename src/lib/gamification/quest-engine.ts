import type { QuestDefinition, QuestStep, QuestStepValidation, QuestStatus } from '@/types';

// Quest Definitions - The main storyline
export const QUESTS: QuestDefinition[] = [
  {
    id: 'ch1_terminal_awakening',
    chapter: 1,
    title: 'Terminal Awakening',
    description: 'Begin your journey into the command line',
    storyline: `Welcome, young apprentice! I am Commander Byte, guardian of the Terminal Realm.

A great darkness has spread across the Digital Kingdom - files are lost, directories are in chaos, and only YOU can restore order!

But first, you must learn the ancient ways of the Command Line. Are you ready to begin your training?`,
    character: 'commander_byte',
    prerequisites: [],
    requiredLevel: 1,
    steps: [
      {
        id: 'step_1',
        type: 'command',
        description: 'Find out who you are in this digital world',
        objective: 'Use the whoami command to see your username',
        hint: 'Type: whoami',
        validation: { type: 'command_match', pattern: '^whoami$' },
      },
      {
        id: 'step_2',
        type: 'command',
        description: 'Look around you - what do you see?',
        objective: 'List the contents of the current directory with ls',
        hint: 'Type: ls',
        validation: { type: 'command_match', pattern: '^ls(\\s|$)' },
      },
      {
        id: 'step_3',
        type: 'command',
        description: 'Where exactly are you standing?',
        objective: 'Print your current location with pwd',
        hint: 'Type: pwd',
        validation: { type: 'command_match', pattern: '^pwd$' },
      },
    ],
    rewards: {
      xp: 100,
      badge: 'terminal_awakened',
      unlocks: ['linux/02-the-terminal'],
    },
  },
  {
    id: 'ch2_file_explorer',
    chapter: 2,
    title: 'The Lost Files',
    description: 'Navigate the file system to find hidden treasures',
    storyline: `Excellent work, apprentice! Commander Byte is impressed by your quick learning.

But trouble awaits... The Chaos Dragon has scattered important files across the kingdom's directories. You must navigate the lands and recover them before they are lost forever!

Remember: In the Terminal Realm, directories are like rooms in a castle. Use 'cd' to walk between them.`,
    character: 'commander_byte',
    prerequisites: ['ch1_terminal_awakening'],
    requiredLevel: 2,
    steps: [
      {
        id: 'step_1',
        type: 'command',
        description: 'Enter the mysterious Documents folder',
        objective: 'Change to the Documents directory',
        hint: 'Type: cd Documents',
        validation: { type: 'directory_change', target: 'Documents' },
      },
      {
        id: 'step_2',
        type: 'command',
        description: 'Search for hidden treasures',
        objective: 'List all files including hidden ones with ls -la',
        hint: 'Type: ls -la (the -a flag shows hidden files)',
        validation: { type: 'command_match', pattern: '^ls\\s+-[la]+' },
      },
      {
        id: 'step_3',
        type: 'command',
        description: 'Read the ancient scroll',
        objective: 'Display the contents of the secret-message.txt file',
        hint: 'Type: cat secret-message.txt',
        validation: { type: 'file_read', file: 'secret-message.txt' },
      },
      {
        id: 'step_4',
        type: 'command',
        description: 'Return to your home base',
        objective: 'Go back to your home directory',
        hint: 'Type: cd ~ or just cd',
        validation: { type: 'command_match', pattern: '^cd(\\s+~|\\s*$)' },
      },
    ],
    rewards: {
      xp: 150,
      badge: 'file_explorer',
      unlocks: ['linux/06-understanding-directories'],
    },
  },
  {
    id: 'ch3_secret_message',
    chapter: 3,
    title: 'The Secret Message',
    description: 'Master the art of reading and searching files',
    storyline: `Pixel the Penguin waddles up to you excitedly!

"Hey there, friend! I found a clue about where the Chaos Dragon is hiding, but it's scattered across multiple files!"

"We need to search through them to piece together the message. Do you know how to use 'grep'? It's like having super-powered eyes that can find any word in any file!"`,
    character: 'pixel_the_penguin',
    prerequisites: ['ch2_file_explorer'],
    requiredLevel: 3,
    steps: [
      {
        id: 'step_1',
        type: 'command',
        description: 'Look at the first part of a long file',
        objective: 'Use head to see the first 10 lines of clues.txt',
        hint: 'Type: head clues.txt',
        validation: { type: 'command_match', pattern: '^head\\s+clues\\.txt' },
      },
      {
        id: 'step_2',
        type: 'command',
        description: 'Check the end of the file for more clues',
        objective: 'Use tail to see the last 10 lines of clues.txt',
        hint: 'Type: tail clues.txt',
        validation: { type: 'command_match', pattern: '^tail\\s+clues\\.txt' },
      },
      {
        id: 'step_3',
        type: 'command',
        description: 'Search for the keyword "dragon"',
        objective: 'Use grep to find lines containing "dragon" in clues.txt',
        hint: 'Type: grep dragon clues.txt',
        validation: { type: 'command_match', pattern: '^grep\\s+dragon\\s+clues\\.txt' },
      },
    ],
    rewards: {
      xp: 150,
      badge: 'search_master',
      unlocks: ['linux/12-searching-content'],
    },
  },
  {
    id: 'ch4_python_begins',
    chapter: 4,
    title: 'The Python Awakens',
    description: 'Start your Python programming journey',
    storyline: `A wise snake named Python Pete slithers into view!

"Greetingsss, young one! I've been watching your progressss in the Terminal Realm. You've done well!"

"But now it'sss time to learn something even more powerful - the art of Python programming! With Python, you can create your own magic and make the computer do amazing thingsss!"

"Let'sss start with the most famous spell of all - Hello, World!"`,
    character: 'python_pete',
    prerequisites: ['ch3_secret_message'],
    requiredLevel: 4,
    steps: [
      {
        id: 'step_1',
        type: 'command',
        description: 'Start the Python interpreter',
        objective: 'Enter the Python world by typing python3',
        hint: 'Type: python3',
        validation: { type: 'command_match', pattern: '^python3$' },
      },
      {
        id: 'step_2',
        type: 'code_write',
        description: 'Cast your first spell',
        objective: 'Type print("Hello, World!") to display a message',
        hint: 'Type exactly: print("Hello, World!")',
        validation: { type: 'output_contains', content: 'Hello, World!' },
      },
      {
        id: 'step_3',
        type: 'code_write',
        description: 'Create a magical variable',
        objective: 'Store your name in a variable called my_name',
        hint: 'Type: my_name = "Lara" (use your own name!)',
        validation: { type: 'command_match', pattern: '^\\s*my_name\\s*=' },
      },
      {
        id: 'step_4',
        type: 'code_write',
        description: 'Introduce yourself',
        objective: 'Print a greeting using your name variable',
        hint: 'Type: print("Hello, " + my_name)',
        validation: { type: 'output_contains', content: 'Hello' },
      },
    ],
    rewards: {
      xp: 200,
      badge: 'python_initiate',
      unlocks: ['python/02-hello-world'],
    },
  },
  {
    id: 'ch5_script_wizard',
    chapter: 5,
    title: 'Becoming a Script Wizard',
    description: 'Write your first Bash script',
    storyline: `Bash Betty appears in a puff of terminal smoke!

"Hey there, code warrior! Ready to level up your powers? I'm gonna teach you how to write SCRIPTS!"

"A script is like a spell scroll - you write down a bunch of commands, and then you can run them all at once with a single word! How cool is that?"

"Let's create your first script together. We'll make one that greets you every time you run it!"`,
    character: 'bash_betty',
    prerequisites: ['ch4_python_begins'],
    requiredLevel: 5,
    steps: [
      {
        id: 'step_1',
        type: 'command',
        description: 'Create a new script file',
        objective: 'Create a file called greet.sh using touch',
        hint: 'Type: touch greet.sh',
        validation: { type: 'file_exists', file: 'greet.sh' },
      },
      {
        id: 'step_2',
        type: 'command',
        description: 'Open the file for editing',
        objective: 'Open greet.sh in the nano editor',
        hint: 'Type: nano greet.sh',
        validation: { type: 'command_match', pattern: '^nano\\s+greet\\.sh' },
      },
      {
        id: 'step_3',
        type: 'file_create',
        description: 'Write the script',
        objective: 'Add #!/bin/bash and echo "Hello, Code Warrior!" to the file',
        hint: 'Line 1: #!/bin/bash | Line 2: echo "Hello, Code Warrior!"',
        validation: { type: 'file_content', file: 'greet.sh', content: '#!/bin/bash' },
      },
      {
        id: 'step_4',
        type: 'command',
        description: 'Make it executable',
        objective: 'Give the script permission to run with chmod',
        hint: 'Type: chmod +x greet.sh',
        validation: { type: 'command_match', pattern: '^chmod\\s+\\+x\\s+greet\\.sh' },
      },
      {
        id: 'step_5',
        type: 'command',
        description: 'Run your creation!',
        objective: 'Execute your script',
        hint: 'Type: ./greet.sh',
        validation: { type: 'command_match', pattern: '^\\.\\/' },
      },
    ],
    rewards: {
      xp: 250,
      badge: 'script_wizard',
      unlocks: ['bash/02-first-script'],
    },
  },
];

/**
 * Get a quest by its ID
 */
export function getQuestById(questId: string): QuestDefinition | undefined {
  return QUESTS.find((q) => q.id === questId);
}

/**
 * Get quests for a specific chapter
 */
export function getQuestsByChapter(chapter: number): QuestDefinition[] {
  return QUESTS.filter((q) => q.chapter === chapter);
}

/**
 * Get the next available quest based on completed quests
 */
export function getNextAvailableQuest(
  completedQuests: string[],
  currentLevel: number
): QuestDefinition | null {
  for (const quest of QUESTS) {
    // Skip if already completed
    if (completedQuests.includes(quest.id)) continue;

    // Check level requirement
    if (currentLevel < quest.requiredLevel) continue;

    // Check prerequisites
    const hasPrereqs = quest.prerequisites.every((prereq) =>
      completedQuests.includes(prereq)
    );
    if (!hasPrereqs) continue;

    return quest;
  }
  return null;
}

/**
 * Validate a quest step completion
 */
export function validateQuestStep(
  step: QuestStep,
  input: string,
  context?: { currentDir?: string; fileContents?: Record<string, string> }
): boolean {
  const { validation } = step;

  switch (validation.type) {
    case 'command_match':
      const pattern = new RegExp(validation.pattern as string);
      return pattern.test(input.trim());

    case 'directory_change':
      return context?.currentDir?.includes(validation.target as string) || false;

    case 'file_read':
      return input.includes(`cat ${validation.file}`) ||
             input.includes(`less ${validation.file}`) ||
             input.includes(`more ${validation.file}`);

    case 'file_exists':
      return context?.fileContents?.[validation.file as string] !== undefined;

    case 'file_content':
      const fileContent = context?.fileContents?.[validation.file as string] || '';
      return fileContent.includes(validation.content as string);

    case 'output_contains':
      // This would need to check against actual command output
      return true; // Simplified for now

    default:
      return false;
  }
}

/**
 * Calculate quest progress percentage
 */
export function calculateQuestProgress(
  currentStep: number,
  totalSteps: number
): number {
  if (totalSteps === 0) return 0;
  return Math.round((currentStep / totalSteps) * 100);
}

/**
 * Get quest status based on progress
 */
export function getQuestStatus(
  questId: string,
  completedQuests: string[],
  inProgressQuests: string[],
  currentLevel: number
): QuestStatus {
  const quest = getQuestById(questId);
  if (!quest) return 'locked';

  if (completedQuests.includes(questId)) return 'completed';
  if (inProgressQuests.includes(questId)) return 'in_progress';

  // Check if available
  if (currentLevel < quest.requiredLevel) return 'locked';

  const hasPrereqs = quest.prerequisites.every((prereq) =>
    completedQuests.includes(prereq)
  );

  return hasPrereqs ? 'available' : 'locked';
}

/**
 * Get total number of quests
 */
export function getTotalQuests(): number {
  return QUESTS.length;
}

/**
 * Get all quest chapters
 */
export function getAllChapters(): number[] {
  const chapters = new Set(QUESTS.map((q) => q.chapter));
  return Array.from(chapters).sort((a, b) => a - b);
}
