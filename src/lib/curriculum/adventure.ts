import { lessons } from "@/data/lessons";
import { normalizeTarget } from "@/utils/keys";
import type { LessonRun } from "@/lib/curriculum/sequence";

export type KeyStat = {
  hits: number;
  misses: number;
  /** Monotonic session counter when last shown */
  lastShown: number;
};

export type KeyPractice = Record<string, KeyStat>;

export type PlaySession = LessonRun & {
  /** Informational only — adventure mode does not gate on lesson ids */
  focusLessonId: number;
};

const SESSION_TURNS = 8;
/** How many distinct curriculum keys a brand-new child may meet in one session. */
const FIRST_SESSION_CAP = 4;

/** Ordered unique keys from the existing curriculum (discovery order). */
export function curriculumKeys(): string[] {
  const out: string[] = [];
  for (const lesson of lessons) {
    for (const key of lesson.keys) {
      const normalized = normalizeTarget(key);
      if (!out.includes(normalized)) out.push(normalized);
    }
  }
  return out;
}

export function emptyKeyStat(): KeyStat {
  return { hits: 0, misses: 0, lastShown: 0 };
}

export function recordKeyResult(
  practice: KeyPractice,
  key: string,
  result: "hit" | "miss",
  shownAt: number,
): KeyPractice {
  const normalized = normalizeTarget(key);
  const prev = practice[normalized] ?? emptyKeyStat();
  return {
    ...practice,
    [normalized]: {
      hits: prev.hits + (result === "hit" ? 1 : 0),
      misses: prev.misses + (result === "miss" ? 1 : 0),
      lastShown: shownAt,
    },
  };
}

/**
 * Adaptive play session: mix new + review + struggle keys.
 * Deterministic for a given seed. Never permanently locks the child on F/J.
 */
export function planPlaySession(input: {
  introducedKeys: readonly string[];
  keyPractice: KeyPractice;
  seed: number;
  turnCount?: number;
}): PlaySession {
  const catalog = curriculumKeys();
  const turnCount = input.turnCount ?? SESSION_TURNS;
  const introduced = unique(
    input.introducedKeys.map(normalizeTarget).filter((key) => catalog.includes(key)),
  );
  const frontier = discoveryFrontier(catalog, introduced, input.seed);
  const eligible = unique([...introduced, ...frontier]);
  const pool = eligible.length > 0 ? eligible : catalog.slice(0, 2);

  const turns: string[] = [];
  let state = Math.abs(input.seed) * 2654435761 + 17;
  const recent: string[] = [];

  for (let index = 0; index < turnCount; index += 1) {
    state = nextRand(state);
    const pick = pickNextKey({
      pool,
      introduced,
      frontier,
      practice: input.keyPractice,
      recent,
      rand: state,
      turn: index,
    });
    turns.push(pick);
    recent.push(pick);
    if (recent.length > 3) recent.shift();
  }

  const newKeys = unique(turns.filter((key) => !introduced.includes(key)));
  const reviewVisits = unique(turns.filter((key) => introduced.includes(key)));
  const focusLessonId = lessonForKey(turns.find((key) => newKeys.includes(key)) ?? turns[0]!) ?? 1;

  return {
    turns,
    newKeys,
    reviewPool: introduced,
    reviewVisits,
    focusLessonId,
  };
}

/** Soft-complete curriculum lessons whose keys are all introduced with practice. */
export function lessonsReadyToComplete(
  completed: readonly number[],
  introduced: readonly string[],
  practice: KeyPractice,
): number[] {
  const known = new Set(introduced.map(normalizeTarget));
  const ready: number[] = [];
  for (const lesson of lessons) {
    if (completed.includes(lesson.id)) continue;
    const keys = lesson.keys.map(normalizeTarget);
    if (keys.length === 0) continue;
    const allKnown = keys.every((key) => known.has(key));
    if (!allKnown) continue;
    const practiced = keys.every((key) => (practice[key]?.hits ?? 0) >= 1);
    if (practiced) ready.push(lesson.id);
  }
  return ready;
}

function discoveryFrontier(
  catalog: readonly string[],
  introduced: readonly string[],
  seed: number,
): string[] {
  if (introduced.length === 0) {
    // New child: start with the first curriculum keys (home-row friends), not only one pair forever.
    const cap = Math.min(FIRST_SESSION_CAP, catalog.length);
    const start = Math.abs(seed) % Math.max(1, Math.min(2, catalog.length));
    return catalog.slice(0, cap).length
      ? rotate(catalog.slice(0, Math.max(cap, 2)), start).slice(0, cap)
      : catalog.slice(0, 2);
  }

  const nextIndex = catalog.findIndex((key) => !introduced.includes(key));
  if (nextIndex < 0) return [];

  // Always keep the next unseen key eligible, plus one more ahead so kids never starve.
  const ahead = catalog.slice(nextIndex, nextIndex + 2);
  return ahead;
}

function pickNextKey(input: {
  pool: readonly string[];
  introduced: readonly string[];
  frontier: readonly string[];
  practice: KeyPractice;
  recent: readonly string[];
  rand: number;
  turn: number;
}): string {
  const { pool, introduced, frontier, practice, recent, rand, turn } = input;
  // Brand-new child: first press starts on the easiest home-row key.
  if (introduced.length === 0 && turn === 0 && pool.length > 0) {
    return pool[0]!;
  }
  const candidates = pool.filter((key) => key !== recent[recent.length - 1] || pool.length === 1);
  // Prefer a remembered letter every third turn so sessions mix old + new.
  const preferReview = turn % 3 === 2 && introduced.length > 0;
  const scored = candidates.map((key) => {
    const stat = practice[key] ?? emptyKeyStat();
    const isNew = !introduced.includes(key);
    const isFrontier = frontier.includes(key);
    const struggle = stat.misses - stat.hits;
    const freshness = turn - stat.lastShown;
    let score = 10;
    if (isNew || isFrontier) score += 16;
    if (!isNew) score += 8;
    if (preferReview && !isNew) score += 14;
    if (preferReview && isNew) score -= 8;
    if (struggle > 0) score += 12 + struggle * 4;
    if (freshness > 2) score += Math.min(10, freshness);
    if (recent.includes(key)) score -= 20;
    if (stat.hits >= 3 && struggle < 0) score -= 4;
    score += (rand + key.charCodeAt(0) * 17) % 7;
    return { key, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.key ?? pool[0]!;
}

function lessonForKey(key: string): number | null {
  const normalized = normalizeTarget(key);
  for (const lesson of lessons) {
    if (lesson.keys.map(normalizeTarget).includes(normalized)) return lesson.id;
  }
  return null;
}

function rotate(keys: readonly string[], start: number): string[] {
  if (keys.length === 0) return [];
  const at = ((start % keys.length) + keys.length) % keys.length;
  return [...keys.slice(at), ...keys.slice(0, at)];
}

function unique(keys: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of keys) {
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function nextRand(state: number): number {
  return (Math.imul(state, 1664525) + 1013904223) >>> 0;
}
