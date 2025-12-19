import type { Track, Difficulty } from '@/types';

export interface LessonFrontmatter {
  title: string;
  track: Track;
  chapter: number;
  lesson: number;
  slug: string;
  prerequisites: string[];
  estimatedTime: number;
  difficulty: Difficulty;
  xpReward: number;
  objectives: string[];
  nextLesson?: string;
  prevLesson?: string;
}

export interface LessonData {
  frontmatter: LessonFrontmatter;
  content: string;
  slug: string;
  track: Track;
}

export interface TrackLessons {
  track: Track;
  lessons: LessonData[];
  chapters: ChapterInfo[];
}

export interface ChapterInfo {
  number: number;
  title: string;
  lessons: string[]; // Lesson slugs
}

export interface ExerciseData {
  id: string;
  type: 'terminal' | 'code' | 'quiz' | 'file_create' | 'multiple_choice';
  title: string;
  instruction: string;
  hint?: string;
  solution?: string;
  xp: number;
  validation: {
    type: string;
    [key: string]: unknown;
  };
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}
