import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Track } from '@/types';
import type { LessonData, LessonFrontmatter, TrackLessons, ChapterInfo } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Get all lessons for a specific track
 */
export async function getTrackLessons(track: Track): Promise<TrackLessons> {
  const trackDir = path.join(CONTENT_DIR, track);

  if (!fs.existsSync(trackDir)) {
    return { track, lessons: [], chapters: [] };
  }

  const lessonDirs = fs.readdirSync(trackDir).filter((item) => {
    const itemPath = path.join(trackDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  const lessons: LessonData[] = [];
  const chapterMap = new Map<number, string[]>();

  for (const lessonDir of lessonDirs) {
    const mdxPath = path.join(trackDir, lessonDir, 'index.mdx');

    if (fs.existsSync(mdxPath)) {
      const fileContents = fs.readFileSync(mdxPath, 'utf8');
      const { data, content } = matter(fileContents);
      const frontmatter = data as LessonFrontmatter;

      lessons.push({
        frontmatter,
        content,
        slug: lessonDir,
        track,
      });

      // Group by chapter
      const chapterLessons = chapterMap.get(frontmatter.chapter) || [];
      chapterLessons.push(lessonDir);
      chapterMap.set(frontmatter.chapter, chapterLessons);
    }
  }

  // Sort lessons by chapter and lesson number
  lessons.sort((a, b) => {
    if (a.frontmatter.chapter !== b.frontmatter.chapter) {
      return a.frontmatter.chapter - b.frontmatter.chapter;
    }
    return a.frontmatter.lesson - b.frontmatter.lesson;
  });

  // Build chapter info
  const chapters: ChapterInfo[] = Array.from(chapterMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, lessonSlugs]) => ({
      number,
      title: getChapterTitle(track, number),
      lessons: lessonSlugs,
    }));

  return { track, lessons, chapters };
}

/**
 * Get a specific lesson by track and slug
 */
export async function getLesson(
  track: Track,
  slug: string
): Promise<LessonData | null> {
  const mdxPath = path.join(CONTENT_DIR, track, slug, 'index.mdx');

  if (!fs.existsSync(mdxPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(mdxPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    frontmatter: data as LessonFrontmatter,
    content,
    slug,
    track,
  };
}

/**
 * Get all lesson slugs for a track (for static generation)
 */
export async function getLessonSlugs(track: Track): Promise<string[]> {
  const trackDir = path.join(CONTENT_DIR, track);

  if (!fs.existsSync(trackDir)) {
    return [];
  }

  return fs.readdirSync(trackDir).filter((item) => {
    const itemPath = path.join(trackDir, item);
    const mdxPath = path.join(itemPath, 'index.mdx');
    return fs.statSync(itemPath).isDirectory() && fs.existsSync(mdxPath);
  });
}

/**
 * Get all tracks that have content
 */
export async function getAvailableTracks(): Promise<Track[]> {
  const tracks: Track[] = ['linux', 'python', 'bash', 'raspberry-pi'];

  return tracks.filter((track) => {
    const trackDir = path.join(CONTENT_DIR, track);
    return fs.existsSync(trackDir);
  });
}

/**
 * Get chapter title for a track
 */
function getChapterTitle(track: Track, chapter: number): string {
  const chapterTitles: Record<Track, Record<number, string>> = {
    linux: {
      1: 'Getting Started',
      2: 'Exploring the File System',
      3: 'File Content Mastery',
      4: 'System Explorer',
    },
    python: {
      1: 'First Steps',
      2: 'Making Decisions',
      3: 'Loops and Lists',
      4: 'Functions',
      5: 'Files and Projects',
    },
    bash: {
      1: 'Script Basics',
      2: 'Control Flow',
      3: 'Advanced Scripting',
    },
    'raspberry-pi': {
      1: 'Getting Started with Pi',
      2: 'GPIO Projects',
      3: 'Sensors and Data',
      4: 'Network Projects',
    },
  };

  return chapterTitles[track]?.[chapter] || `Chapter ${chapter}`;
}

/**
 * Get the next and previous lessons for navigation
 */
export async function getLessonNavigation(
  track: Track,
  currentSlug: string
): Promise<{ prev: LessonData | null; next: LessonData | null }> {
  const { lessons } = await getTrackLessons(track);
  const currentIndex = lessons.findIndex((l) => l.slug === currentSlug);

  return {
    prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
    next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
  };
}

/**
 * Count total lessons across all tracks
 */
export async function getTotalLessonCount(): Promise<number> {
  const tracks: Track[] = ['linux', 'python', 'bash', 'raspberry-pi'];
  let total = 0;

  for (const track of tracks) {
    const { lessons } = await getTrackLessons(track);
    total += lessons.length;
  }

  return total;
}
