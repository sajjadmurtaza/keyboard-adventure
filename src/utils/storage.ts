import { parseChildName } from "@/utils/childName";

const STORAGE_KEY = "keyboard-adventure-progress-v1";
const MAX_LESSON = 32;
const MAX_COMPLETED = 32;

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

function asCount(value: unknown, fallback = 0): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, 1_000_000);
}

function asLessonId(value: unknown, fallback = 1): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_LESSON, Math.max(1, n));
}

function asLessonIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const ids = value
    .map((item) => Math.floor(Number(item)))
    .filter((id) => Number.isInteger(id) && id >= 1 && id <= MAX_LESSON);
  return [...new Set(ids)].slice(0, MAX_COMPLETED);
}

function asBestResults(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, score] of Object.entries(value as Record<string, unknown>)) {
    if (!/^\d{1,2}$/.test(key)) continue;
    const n = Math.floor(Number(score));
    if (!Number.isFinite(n) || n < 0) continue;
    out[key] = Math.min(n, 10_000);
    if (Object.keys(out).length >= MAX_COMPLETED) break;
  }
  return out;
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyProgress();
    }
    const newly = parsed.newlyUnlocked;
    return {
      childName: parseChildName(parsed.childName) ?? "",
      completedLessons: asLessonIds(parsed.completedLessons),
      starsEarned: asCount(parsed.starsEarned),
      currentLesson: asLessonId(parsed.currentLesson),
      correctAttempts: asCount(parsed.correctAttempts),
      incorrectAttempts: asCount(parsed.incorrectAttempts),
      lessonBestResults: asBestResults(parsed.lessonBestResults),
      newlyUnlocked: typeof newly === "number" ? asLessonId(newly) : null,
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...emptyProgress(),
      ...progress,
      childName: parseChildName(progress.childName) ?? "",
      completedLessons: asLessonIds(progress.completedLessons),
    }),
  );
}

export function resetProgress(childName = ""): Progress {
  const next = { ...emptyProgress(), childName: parseChildName(childName) ?? "" };
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
