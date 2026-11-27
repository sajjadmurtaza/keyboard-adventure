import {
  isCostumeId,
  parseCostumeIds,
  unlockedFromLetters,
  type CostumeId,
} from "@/data/costumes";
import type { KeyPractice, KeyStat } from "@/lib/curriculum/adventure";
import { keysFromLessons } from "@/lib/curriculum/sequence";
import { parseChildName } from "@/utils/childName";
import { normalizeTarget } from "@/utils/keys";

const STORAGE_KEY = "keyboard-adventure-progress-v1";
const MAX_LESSON = 32;
const MAX_COMPLETED = 32;
const MAX_EQUIPPED = 3;
const MAX_KEY_STATS = 64;

export type Progress = {
  childName: string;
  completedLessons: number[];
  starsEarned: number;
  currentLesson: number;
  correctAttempts: number;
  incorrectAttempts: number;
  lessonBestResults: Record<string, number>;
  newlyUnlocked: number | null;
  introducedKeys: string[];
  /** Lightweight per-key practice for adaptive play. */
  keyPractice: KeyPractice;
  /** Wardrobe unlocks (letter intros) — device-local only. */
  unlockedCostumes: CostumeId[];
  /** Worn accessories on the mascot (subset of unlocked). */
  equippedCostumes: CostumeId[];
  /** One-shot wardrobe celebration after a new unlock. */
  newlyUnlockedCostume: CostumeId | null;
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
  introducedKeys: [],
  keyPractice: {},
  unlockedCostumes: [],
  equippedCostumes: [],
  newlyUnlockedCostume: null,
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

function asKeyList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const keys = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => normalizeTarget(item))
    .filter((item) => item === " " || item.length === 1);
  return [...new Set(keys)].slice(0, 64);
}

function asKeyPractice(value: unknown): KeyPractice {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: KeyPractice = {};
  for (const [rawKey, rawStat] of Object.entries(value as Record<string, unknown>)) {
    const key = normalizeTarget(rawKey);
    if (key !== " " && key.length !== 1) continue;
    if (!rawStat || typeof rawStat !== "object" || Array.isArray(rawStat)) continue;
    const stat = rawStat as Partial<KeyStat>;
    const hits = Math.floor(Number(stat.hits));
    const misses = Math.floor(Number(stat.misses));
    const lastShown = Math.floor(Number(stat.lastShown));
    if (![hits, misses, lastShown].every((n) => Number.isFinite(n) && n >= 0)) continue;
    out[key] = {
      hits: Math.min(hits, 1_000_000),
      misses: Math.min(misses, 1_000_000),
      lastShown: Math.min(lastShown, 1_000_000),
    };
    if (Object.keys(out).length >= MAX_KEY_STATS) break;
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
    const completedLessons = asLessonIds(parsed.completedLessons);
    const introduced = asKeyList(parsed.introducedKeys);
    const introducedKeys = introduced ?? keysFromLessons(completedLessons);
    const unlockedCostumes = mergeUnlocked(
      parseCostumeIds(parsed.unlockedCostumes),
      unlockedFromLetters(introducedKeys),
    );
    const newlyCostume =
      typeof parsed.newlyUnlockedCostume === "string" &&
      isCostumeId(parsed.newlyUnlockedCostume) &&
      unlockedCostumes.includes(parsed.newlyUnlockedCostume)
        ? parsed.newlyUnlockedCostume
        : null;
    const equippedCostumes = parseCostumeIds(parsed.equippedCostumes, MAX_EQUIPPED).filter(
      (id) => unlockedCostumes.includes(id),
    );
    return {
      childName: parseChildName(parsed.childName) ?? "",
      completedLessons,
      starsEarned: asCount(parsed.starsEarned),
      currentLesson: asLessonId(parsed.currentLesson),
      correctAttempts: asCount(parsed.correctAttempts),
      incorrectAttempts: asCount(parsed.incorrectAttempts),
      lessonBestResults: asBestResults(parsed.lessonBestResults),
      newlyUnlocked: typeof newly === "number" ? asLessonId(newly) : null,
      introducedKeys,
      keyPractice: asKeyPractice(parsed.keyPractice),
      unlockedCostumes,
      equippedCostumes,
      newlyUnlockedCostume: newlyCostume,
    };
  } catch {
    return emptyProgress();
  }
}

function mergeUnlocked(stored: CostumeId[], fromLetters: CostumeId[]): CostumeId[] {
  return [...new Set([...stored, ...fromLetters])];
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
  // Soft gate: keep a couple of adventures open ahead so kids never feel
  // walled behind "Lesson 1" — curriculum still advances behind the scenes.
  const furthest = completed.reduce((max, id) => Math.max(max, id), 0);
  return lessonId <= furthest + 2;
}
