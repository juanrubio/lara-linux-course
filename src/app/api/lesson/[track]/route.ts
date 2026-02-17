import { NextResponse } from 'next/server';
import { getTrackLessons } from '@/lib/content/loader';
import type { Track } from '@/types';
import type { Difficulty } from '@/types/lesson';

interface LessonSummary {
  slug: string;
  title: string;
  time: number;
  xp: number;
  difficulty: Difficulty;
  lessonNumber: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ track: string }> }
) {
  try {
    const { track } = await params;
    const validTracks: Track[] = ['linux', 'python', 'bash', 'raspberry-pi'];

    if (!validTracks.includes(track as Track)) {
      return NextResponse.json({ error: 'Invalid track' }, { status: 400 });
    }

    const { lessons, chapters } = await getTrackLessons(track as Track);
    const lessonMap = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
    const totalMinutes = lessons.reduce(
      (sum, lesson) => sum + (lesson.frontmatter.estimatedTime || 0),
      0
    );

    return NextResponse.json({
      track,
      totalLessons: lessons.length,
      totalMinutes,
      chapters: chapters.map((chapter) => {
        const lessonsForChapter = chapter.lessons
          .map((slug) => {
            const lesson = lessonMap.get(slug);
            if (!lesson) return null;
            return {
              slug: lesson.slug,
              title: lesson.frontmatter.title,
              time: lesson.frontmatter.estimatedTime,
              xp: lesson.frontmatter.xpReward,
              difficulty: lesson.frontmatter.difficulty,
              lessonNumber: lesson.frontmatter.lesson,
            };
          })
          .filter((lesson): lesson is LessonSummary => lesson !== null);

        lessonsForChapter.sort((a, b) => a.lessonNumber - b.lessonNumber);

        return {
          number: chapter.number,
          title: chapter.title,
          lessons: lessonsForChapter,
        };
      }),
    });
  } catch (error) {
    console.error('Track lessons API error:', error);
    return NextResponse.json({ error: 'Failed to load track lessons' }, { status: 500 });
  }
}
