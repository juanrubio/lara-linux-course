import { NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { getLesson, getLessonNavigation } from '@/lib/content/loader';
import type { Track } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ track: string; slug: string }> }
) {
  try {
    const { track, slug } = await params;

    // Validate track
    const validTracks: Track[] = ['linux', 'python', 'bash', 'raspberry-pi'];
    if (!validTracks.includes(track as Track)) {
      return NextResponse.json(
        { error: 'Invalid track' },
        { status: 400 }
      );
    }

    // Get lesson content
    const lesson = await getLesson(track as Track, slug);

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Serialize MDX content with GFM support for tables
    const mdxSource = await serialize(lesson.content, {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    });

    // Get navigation
    const navigation = await getLessonNavigation(track as Track, slug);

    return NextResponse.json({
      frontmatter: lesson.frontmatter,
      source: mdxSource,
      navigation: {
        prev: navigation.prev ? {
          slug: navigation.prev.slug,
          title: navigation.prev.frontmatter.title,
        } : null,
        next: navigation.next ? {
          slug: navigation.next.slug,
          title: navigation.next.frontmatter.title,
        } : null,
      },
    });
  } catch (error) {
    console.error('Lesson API error:', error);
    return NextResponse.json(
      { error: 'Failed to load lesson' },
      { status: 500 }
    );
  }
}
