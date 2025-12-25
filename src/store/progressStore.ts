import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, LessonStatus } from '@/types';

interface LessonProgressState {
  lessonId: string;
  status: LessonStatus;
  exercisesCompleted: string[];
  bestScore: number;
  attempts: number;
}

interface TrackProgressState {
  trackId: Track;
  lessonsCompleted: number;
  totalLessons: number;
  currentLesson: string | null;
}

interface ProgressState {
  // Track progress
  tracks: Record<Track, TrackProgressState>;

  // Lesson progress (keyed by `${trackId}/${lessonSlug}`)
  lessons: Record<string, LessonProgressState>;

  // Current session
  currentTrack: Track | null;
  currentLesson: string | null;

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  setCurrentTrack: (track: Track | null) => void;
  setCurrentLesson: (trackId: Track, lessonSlug: string) => void;
  startLesson: (trackId: Track, lessonSlug: string) => void; // Simplified start for lesson page
  updateLessonStatus: (trackId: Track, lessonSlug: string, status: LessonStatus) => void;
  completeExercise: (trackId: Track, lessonSlug: string, exerciseId: string) => void;
  completeLesson: (trackId: Track, lessonSlug: string, score?: number) => void; // score is optional
  unlockNextLesson: (trackId: Track, currentLessonSlug: string, nextLessonSlug: string) => void;
  getTrackProgress: (trackId: Track) => TrackProgressState;
  getLessonProgress: (trackId: Track, lessonSlug: string) => LessonProgressState | undefined;
  isLessonCompleted: (trackId: Track, lessonSlug: string) => boolean;
  isLessonAvailable: (trackId: Track, lessonSlug: string) => boolean;
  reset: () => void;
}

const initialTracks: Record<Track, TrackProgressState> = {
  linux: { trackId: 'linux', lessonsCompleted: 0, totalLessons: 20, currentLesson: null },
  python: { trackId: 'python', lessonsCompleted: 0, totalLessons: 25, currentLesson: null },
  bash: { trackId: 'bash', lessonsCompleted: 0, totalLessons: 15, currentLesson: null },
  'raspberry-pi': { trackId: 'raspberry-pi', lessonsCompleted: 0, totalLessons: 10, currentLesson: null },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      tracks: initialTracks,
      lessons: {},
      currentTrack: null,
      currentLesson: null,
      _hasHydrated: false,

      setCurrentTrack: (track) => set({ currentTrack: track }),

      setCurrentLesson: (trackId, lessonSlug) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        set({
          currentTrack: trackId,
          currentLesson: lessonKey,
        });

        // Initialize lesson progress if not exists
        const state = get();
        if (!state.lessons[lessonKey]) {
          set({
            lessons: {
              ...state.lessons,
              [lessonKey]: {
                lessonId: lessonKey,
                status: 'in_progress',
                exercisesCompleted: [],
                bestScore: 0,
                attempts: 0,
              },
            },
          });
        } else if (state.lessons[lessonKey].status === 'available') {
          set({
            lessons: {
              ...state.lessons,
              [lessonKey]: {
                ...state.lessons[lessonKey],
                status: 'in_progress',
              },
            },
          });
        }
      },

      updateLessonStatus: (trackId, lessonSlug, status) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        const state = get();
        set({
          lessons: {
            ...state.lessons,
            [lessonKey]: {
              ...state.lessons[lessonKey],
              lessonId: lessonKey,
              status,
              exercisesCompleted: state.lessons[lessonKey]?.exercisesCompleted || [],
              bestScore: state.lessons[lessonKey]?.bestScore || 0,
              attempts: state.lessons[lessonKey]?.attempts || 0,
            },
          },
        });
      },

      completeExercise: (trackId, lessonSlug, exerciseId) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        const state = get();
        const lessonProgress = state.lessons[lessonKey];

        if (!lessonProgress) return;

        if (!lessonProgress.exercisesCompleted.includes(exerciseId)) {
          set({
            lessons: {
              ...state.lessons,
              [lessonKey]: {
                ...lessonProgress,
                exercisesCompleted: [...lessonProgress.exercisesCompleted, exerciseId],
              },
            },
          });
        }
      },

      // Simplified startLesson for use in lesson page
      startLesson: (trackId, lessonSlug) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        const state = get();

        if (!state.lessons[lessonKey]) {
          set({
            lessons: {
              ...state.lessons,
              [lessonKey]: {
                lessonId: lessonKey,
                status: 'in_progress',
                exercisesCompleted: [],
                bestScore: 0,
                attempts: 0,
              },
            },
          });
        } else if (state.lessons[lessonKey].status !== 'completed') {
          set({
            lessons: {
              ...state.lessons,
              [lessonKey]: {
                ...state.lessons[lessonKey],
                status: 'in_progress',
              },
            },
          });
        }
      },

      completeLesson: (trackId, lessonSlug, score = 100) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        const state = get();
        const lessonProgress = state.lessons[lessonKey];
        const trackProgress = state.tracks[trackId];

        // Validate track exists
        if (!trackProgress) {
          console.error(`[Progress] Invalid track ID: "${trackId}". Available tracks:`, Object.keys(state.tracks));
          return;
        }

        // Don't increment if already completed
        const wasCompleted = lessonProgress?.status === 'completed';

        console.log(`[Progress] Completing lesson: ${lessonKey}`);
        console.log(`[Progress] Track progress before:`, trackProgress);

        set({
          lessons: {
            ...state.lessons,
            [lessonKey]: {
              ...lessonProgress,
              lessonId: lessonKey,
              status: 'completed',
              bestScore: Math.max(score, lessonProgress?.bestScore || 0),
              attempts: (lessonProgress?.attempts || 0) + 1,
              exercisesCompleted: lessonProgress?.exercisesCompleted || [],
            },
          },
          tracks: trackProgress && !wasCompleted ? {
            ...state.tracks,
            [trackId]: {
              ...trackProgress,
              lessonsCompleted: trackProgress.lessonsCompleted + 1,
            },
          } : state.tracks,
        });

        const updatedTrack = get().tracks[trackId];
        console.log(`[Progress] Lesson completed! Track "${trackId}" now has ${updatedTrack.lessonsCompleted}/${updatedTrack.totalLessons} lessons`);
      },

      unlockNextLesson: (trackId, currentLessonSlug, nextLessonSlug) => {
        const nextLessonKey = `${trackId}/${nextLessonSlug}`;
        const state = get();

        if (!state.lessons[nextLessonKey] || state.lessons[nextLessonKey].status === 'locked') {
          set({
            lessons: {
              ...state.lessons,
              [nextLessonKey]: {
                lessonId: nextLessonKey,
                status: 'available',
                exercisesCompleted: [],
                bestScore: 0,
                attempts: 0,
              },
            },
          });
        }
      },

      getTrackProgress: (trackId) => {
        return get().tracks[trackId];
      },

      getLessonProgress: (trackId, lessonSlug) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        return get().lessons[lessonKey];
      },

      isLessonCompleted: (trackId, lessonSlug) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        return get().lessons[lessonKey]?.status === 'completed';
      },

      isLessonAvailable: (trackId, lessonSlug) => {
        const lessonKey = `${trackId}/${lessonSlug}`;
        const status = get().lessons[lessonKey]?.status;
        return status === 'available' || status === 'in_progress' || status === 'completed';
      },

      reset: () =>
        set({
          tracks: initialTracks,
          lessons: {},
          currentTrack: null,
          currentLesson: null,
        }),
    }),
    {
      name: 'codequest-progress',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          console.log('[ProgressStore] Hydration complete');
        }
      },
    }
  )
);
