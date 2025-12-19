export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type QuestStepType = 'command' | 'file_create' | 'code_write' | 'quiz' | 'explore';

export interface QuestStepValidation {
  type: 'command_match' | 'directory_change' | 'file_read' | 'file_exists' | 'file_content' | 'output_contains';
  pattern?: RegExp | string;
  target?: string;
  file?: string;
  content?: string;
}

export interface QuestStep {
  id: string;
  type: QuestStepType;
  description: string;
  objective: string;
  hint: string;
  validation: QuestStepValidation;
}

export interface QuestRewards {
  xp: number;
  badge?: string;
  unlocks?: string[]; // Lesson IDs that get unlocked
}

export interface QuestDefinition {
  id: string;
  chapter: number;
  title: string;
  description: string;
  storyline: string; // Narrative text
  character: string; // NPC giving the quest
  prerequisites: string[]; // Quest IDs
  requiredLevel: number;
  steps: QuestStep[];
  rewards: QuestRewards;
}

export interface QuestProgress {
  questId: string;
  status: QuestStatus;
  currentStep: number;
  totalSteps: number;
  startedAt?: Date;
  completedAt?: Date;
}

// NPC Characters for storytelling
export interface NPCCharacter {
  id: string;
  name: string;
  title: string;
  avatar: string;
  personality: string;
}

export const NPC_CHARACTERS: NPCCharacter[] = [
  {
    id: 'commander_byte',
    name: 'Commander Byte',
    title: 'Guardian of the Terminal Realm',
    avatar: '/images/avatars/commander-byte.png',
    personality: 'wise and encouraging',
  },
  {
    id: 'pixel_the_penguin',
    name: 'Pixel',
    title: 'The Linux Penguin Guide',
    avatar: '/images/avatars/pixel.png',
    personality: 'friendly and curious',
  },
  {
    id: 'python_pete',
    name: 'Python Pete',
    title: 'Master of the Snake Arts',
    avatar: '/images/avatars/python-pete.png',
    personality: 'calm and methodical',
  },
  {
    id: 'bash_betty',
    name: 'Bash Betty',
    title: 'Script Sorceress',
    avatar: '/images/avatars/bash-betty.png',
    personality: 'energetic and clever',
  },
  {
    id: 'pi_princess',
    name: 'Princess Pi',
    title: 'Ruler of the Raspberry Kingdom',
    avatar: '/images/avatars/pi-princess.png',
    personality: 'creative and adventurous',
  },
];
