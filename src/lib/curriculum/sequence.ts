import { associationsFor } from "@/data/letterAssociations";
import { getLesson, lessons, type Lesson } from "@/data/lessons";
import { normalizeTarget } from "@/utils/keys";

export type LessonRun = {
  turns: readonly string[];
  newKeys: readonly string[];
  reviewPool: readonly string[];
  reviewVisits: readonly string[];
};

export type VisitTone = "introduce" | "new" | "review";

const PAIR_TURNS = 8;
const SINGLE_TURNS = 9;

export function lessonRun(
  lessonId: number,
  completedIds: readonly number[],
  seed = 0,
): LessonRun {
  const lesson = getLesson(lessonId);
  if (!lesson) return { turns: [], newKeys: [], reviewPool: [], reviewVisits: [] };
  return planLesson(lesson, completedIds, seed);
}

export function planLesson(
  lesson: Lesson,
  completedIds: readonly number[],
  seed = 0,
): LessonRun {
  const newKeys = freshKeys(lesson);
  const reviewPool = reviewPoolFor(lesson, completedIds, newKeys);

  if (newKeys.length === 0) {
    return {
      turns: repairDuplicates(lesson.sequence.map(normalizeTarget), lesson.keys.map(normalizeTarget)),
      newKeys,
      reviewPool: [],
      reviewVisits: [],
    };
  }

  if (newKeys.length === 1) {
    const fresh = newKeys[0]!;
    const turns = reviewPool.length
      ? alternate(fresh, reviewPool, SINGLE_TURNS, seed)
      : Array.from({ length: PAIR_TURNS }, () => fresh);
    return {
      turns,
      newKeys,
      reviewPool,
      reviewVisits: unique(turns.filter((key) => key !== fresh)),
    };
  }

  const visits = takeDistinct(reviewPool, reviewCountFor(lesson.id, reviewPool.length), seed);
  return {
    turns: weave(newKeys, visits, PAIR_TURNS),
    newKeys,
    reviewPool,
    reviewVisits: visits,
  };
}

export function keysFromLessons(ids: readonly number[]): string[] {
  const keys: string[] = [];
  for (const id of ids) {
    const lesson = getLesson(id);
    if (!lesson) continue;
    for (const key of lesson.keys) {
      const normalized = normalizeTarget(key);
      if (!keys.includes(normalized)) keys.push(normalized);
    }
  }
  return keys;
}

export function visitTone(
  key: string,
  newKeys: readonly string[],
  introduced: readonly string[],
): VisitTone {
  const normalized = normalizeTarget(key);
  if (!introduced.includes(normalized)) return "introduce";
  if (newKeys.length === 0 || !newKeys.includes(normalized)) return "review";
  return "new";
}

export function recallWord(key: string, turn: number): string | undefined {
  const items = associationsFor(key);
  if (items.length === 0) return undefined;
  if (items.length === 1) return items[0]?.word;
  const offset = (Math.abs(turn) % (items.length - 1)) + 1;
  return items[offset]?.word;
}

function freshKeys(lesson: Lesson): string[] {
  const earlier = keysBefore(lesson.id);
  return unique(
    lesson.keys.map(normalizeTarget).filter((key) => !earlier.has(key)),
  );
}

function reviewPoolFor(
  lesson: Lesson,
  completedIds: readonly number[],
  newKeys: readonly string[],
): string[] {
  const earlier = keysBefore(lesson.id);
  const owned = unique(
    lesson.keys
      .map(normalizeTarget)
      .filter((key) => earlier.has(key) && !newKeys.includes(key)),
  );
  const external = keysFromLessons(completedIds.filter((id) => id < lesson.id)).filter(
    (key) => !newKeys.includes(key) && !owned.includes(key),
  );
  return unique([...owned, ...external]);
}

function keysBefore(lessonId: number): Set<string> {
  const set = new Set<string>();
  for (const lesson of lessons) {
    if (lesson.id >= lessonId) continue;
    for (const key of lesson.keys) set.add(normalizeTarget(key));
  }
  return set;
}

function reviewCountFor(lessonId: number, poolSize: number): number {
  if (poolSize <= 0) return 0;
  const wanted = lessonId >= 7 ? 3 : 2;
  return Math.min(wanted, poolSize);
}

function takeDistinct(pool: readonly string[], count: number, seed: number): string[] {
  if (pool.length === 0 || count <= 0) return [];
  const start = Math.abs(seed) % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  return rotated.slice(0, Math.min(count, rotated.length));
}

function alternate(
  fresh: string,
  partners: readonly string[],
  length: number,
  seed: number,
): string[] {
  const turns: string[] = [];
  let partner = Math.abs(seed) % partners.length;
  for (let index = 0; index < length; index += 1) {
    if (index % 2 === 0) {
      turns.push(fresh);
      continue;
    }
    turns.push(partners[partner % partners.length]!);
    partner += 1;
  }
  return turns;
}

function weave(newKeys: readonly string[], visits: readonly string[], length: number): string[] {
  const slots = reviewSlots(length, visits.length);
  const turns = Array.from({ length }, () => newKeys[0]!);
  let fresh = 0;
  for (let index = 0; index < length; index += 1) {
    if (slots.includes(index)) continue;
    turns[index] = newKeys[fresh % newKeys.length]!;
    fresh += 1;
  }
  slots.forEach((slot, index) => {
    const visit = visits[index];
    if (visit) turns[slot] = visit;
  });
  return turns;
}

function reviewSlots(length: number, reviewCount: number): number[] {
  if (reviewCount <= 0 || length < 3) return [];
  const preferred =
    reviewCount === 1 ? [Math.floor(length / 2)] : reviewCount === 2 ? [2, 5] : [1, 3, 5];
  return preferred.filter((index) => index > 0 && index < length - 1);
}

function repairDuplicates(turns: readonly string[], allowed: readonly string[]): string[] {
  const next = [...turns];
  for (let index = 1; index < next.length; index += 1) {
    if (next[index] !== next[index - 1]) continue;
    const swap = allowed.find((key) => key !== next[index] && key !== next[index + 1]);
    if (swap) next[index] = swap;
  }
  return next;
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
