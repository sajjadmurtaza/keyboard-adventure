const STORAGE_KEY = "keyboard-adventure-progress-v1";

export type Progress = {
  childName: string;
  completedLessons: number[];
  starsEarned: number;
  currentLesson: number;
  correctAttempts: number;
  incorrectAttempts: number;
  lessonBestResults: Record<string, number>;
  newlyUnlocked: number | null;
};

const emptyProgress = (): Progress => ({
  childName: "",
  completedLessons: [],
  starsEarned: 0,
  currentLesson: 1,
  correctAttempts: 0,
  incorrectAttempts: 0,
  lessonBestResults: {},
  newlyUnlocked: null,
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
      lessonBestResults:
        parsed.lessonBestResults && typeof parsed.lessonBestResults === "object"
          ? parsed.lessonBestResults
          : {},
      newlyUnlocked: parsed.newlyUnlocked ?? null,
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(childName = ""): Progress {
  const next = { ...emptyProgress(), childName };
  saveProgress(next);
  return next;
}

export function isLessonUnlocked(
  lessonId: number,
  completed: number[],
  unlockAll = false,
) {
  if (unlockAll || lessonId <= 1) return true;
  return completed.includes(lessonId - 1);
}
