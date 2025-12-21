export type Track = 'linux' | 'raspberry-pi' | 'python' | 'bash';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface LessonMeta {
  title: string;
  track: Track;
  chapter: number;
  lesson: number;
  slug: string;
  prerequisites: string[];
  estimatedTime: number; // minutes
  difficulty: Difficulty;
  xpReward: number;
  objectives: string[];
}

export interface Lesson {
  meta: LessonMeta;
  content: string; // MDX content
}

export interface Exercise {
  id: string;
  type: 'terminal' | 'code' | 'quiz' | 'file_create';
  title: string;
  instruction: string;
  validation: ValidationRule;
  hint?: string;
  xp: number;
}

export interface ValidationRule {
  type: 'exact' | 'starts_with' | 'contains' | 'regex' | 'output_match' | 'file_exists' | 'code_output';
  command?: string;
  pattern?: string;
  expectedOutput?: string;
  file?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface TrackInfo {
  id: Track;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
  prerequisites?: Track[];
}

export const TRACKS: TrackInfo[] = [
  {
    id: 'linux',
    name: 'Linux Fundamentals',
    description: 'Master the command line and explore the Linux file system',
    icon: '🐧',
    color: '#f97316',
    totalLessons: 20,
  },
  {
    id: 'python',
    name: 'Python Programming',
    description: 'Learn to code with Python, the friendly programming language',
    icon: '🐍',
    color: '#3b82f6',
    totalLessons: 25,
  },
  {
    id: 'bash',
    name: 'Bash Scripting',
    description: 'Automate tasks and write powerful shell scripts',
    icon: '📜',
    color: '#22c55e',
    totalLessons: 15,
  },
  {
    id: 'raspberry-pi',
    name: 'Raspberry Pi Projects',
    description: 'Build cool projects with the Raspberry Pi',
    icon: '🍓',
    color: '#ec4899',
    totalLessons: 10,
  },
];
