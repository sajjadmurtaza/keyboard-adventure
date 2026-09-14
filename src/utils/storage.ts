const STORAGE_KEY = "keyboard-adventure-progress-v1";

export type Progress = {
  completedLessons: number[];
  starsEarned: number;
  currentLesson: number;
  correctAttempts: number;
  incorrectAttempts: number;
};

const emptyProgress = (): Progress => ({
  completedLessons: [],
  starsEarned: 0,
  currentLesson: 1,
  correctAttempts: 0,
  incorrectAttempts: 0,
});

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...emptyProgress(),
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons
        : [],
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isLessonUnlocked(lessonId: number, completed: number[]) {
  if (lessonId <= 1) return true;
  return completed.includes(lessonId - 1);
}
