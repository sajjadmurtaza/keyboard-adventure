export type CelebrationLevel = "correct" | "streak" | "streak5" | "complete";

export type PartyMotion = "float" | "pop" | "fall" | "balloon" | "still";

export type PartyBit = {
  id: string;
  emoji: string;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  kind: "sparkle" | "confetti" | "balloon";
  motion: PartyMotion;
  moveX: number;
  moveY: number;
  rotateStart: number;
  rotateEnd: number;
  scalePeak: number;
  x12: string;
  y12: string;
  x55: string;
  y55: string;
  x100: string;
  y100: string;
};

export const MIX = ["✨", "⭐", "🌟", "🌸", "🌼", "🌺", "👍", "👏", "🎉", "🎊"] as const;
const STREAK_MIX = [...MIX, "🥳", "💖"] as const;
const COMPLETE_MIX = [...STREAK_MIX, "🎈"] as const;

const REGIONS = [
  { left: 8, top: 10 },
  { left: 50, top: 6 },
  { left: 88, top: 12 },
  { left: 6, top: 46 },
  { left: 90, top: 48 },
  { left: 10, top: 78 },
  { left: 50, top: 84 },
  { left: 86, top: 80 },
] as const;

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function range(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

function cycle<T>(items: readonly T[], index: number): T {
  const first = items[0];
  if (first === undefined) {
    throw new Error("celebration mix is empty");
  }
  return items[index % items.length] ?? first;
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function px(value: number): string {
  return `${Math.round(value)}px`;
}

function motionFor(emoji: string, kind: PartyBit["kind"], still: boolean): PartyMotion {
  if (still) return "still";
  if (kind === "balloon") return "balloon";
  if (kind === "confetti") return "fall";
  if (emoji === "👏" || emoji === "👍" || emoji === "🥳") return "pop";
  return "float";
}

function distanceFor(emoji: string, compact: boolean, rng: Rng): number {
  const cap = compact ? 55 : 90;
  const floor = compact ? 22 : 36;
  if (emoji === "👏") return range(rng, compact ? 8 : 12, compact ? 18 : 24);
  if (emoji === "👍" || emoji === "🥳") return range(rng, compact ? 18 : 28, compact ? 32 : 44);
  if (emoji === "🎉") return range(rng, compact ? 40 : 62, cap);
  if (emoji === "✨") return range(rng, floor, compact ? 42 : 70);
  if (emoji === "🌟") return range(rng, floor, compact ? 40 : 62);
  return range(rng, floor, cap);
}

function pathFrom(moveX: number, moveY: number, curveX: number) {
  return {
    x12: px(moveX * 0.1),
    y12: px(moveY * 0.1),
    x55: px(moveX * 0.55 + curveX),
    y55: px(moveY * 0.5),
    x100: px(moveX),
    y100: px(moveY),
  };
}

function particle(
  id: string,
  emoji: string,
  left: number,
  top: number,
  size: number,
  delay: number,
  duration: number,
  kind: PartyBit["kind"],
  moveX: number,
  moveY: number,
  curveX: number,
  rng: Rng,
  still = false,
): PartyBit {
  const motion = motionFor(emoji, kind, still);
  const rotateStart = still ? 0 : range(rng, -12, 12);
  const rotateEnd = still ? 0 : rotateStart + range(rng, -22, 22);
  const scalePeak = emoji === "🌟" ? 1.22 : emoji === "👏" ? 1.18 : 1.12;
  const path = still ? pathFrom(0, 0, 0) : pathFrom(moveX, moveY, curveX);
  return {
    id,
    emoji,
    left: `${left}%`,
    top: `${top}%`,
    size,
    delay,
    duration,
    kind,
    motion,
    moveX: still ? 0 : Math.round(moveX),
    moveY: still ? 0 : Math.round(moveY),
    rotateStart,
    rotateEnd,
    scalePeak,
    ...path,
  };
}

function entranceDelay(index: number, start: number, step: number, rng: Rng): number {
  return Number((start + index * step + range(rng, 0, 0.05)).toFixed(3));
}

function floatUntil(delay: number, settleAt: number): number {
  return Number((settleAt - delay).toFixed(2));
}

function ringPoint(angleDeg: number, compact: boolean, rng: Rng): { left: number; top: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const rx = range(rng, compact ? 16 : 18, compact ? 26 : 32);
  const ry = range(rng, compact ? 14 : 16, compact ? 24 : 28);
  return {
    left: clamp(50 + Math.cos(rad) * rx, 8, 92),
    top: clamp(50 + Math.sin(rad) * ry, 24, 78),
  };
}

function vector(angleDeg: number, distance: number, rng: Rng): { x: number; y: number } {
  const jitter = range(rng, -16, 16);
  const rad = ((angleDeg + jitter) * Math.PI) / 180;
  return { x: Math.cos(rad) * distance, y: Math.sin(rad) * distance };
}

function compass(count: number): number[] {
  const dirs = [-125, -90, -55, 8, 55, 90, 125, 172, -20, 200, 40, -150];
  return dirs.slice(0, count);
}

function stillRing(emojis: readonly string[]): PartyBit[] {
  const rng = mulberry32(1);
  return emojis.map((emoji, index) => {
    const angle = (index / emojis.length) * 360 - 90;
    const slot = ringPoint(angle, false, rng);
    return particle(`still-${index}`, emoji, slot.left, slot.top, 22, 0, 0, "sparkle", 0, 0, 0, rng, true);
  });
}

export function celebrationLevelFor(streak: number): Exclude<CelebrationLevel, "complete"> {
  if (streak >= 5) return "streak5";
  if (streak >= 3) return "streak";
  return "correct";
}

export function celebrationPlan(
  level: CelebrationLevel,
  compact = false,
  reducedMotion = false,
  seed = 1,
): PartyBit[] {
  const rng = mulberry32(seed + level.length * 17);

  if (reducedMotion) {
    if (level === "complete") {
      return stillRing(["🌸", "✨", "⭐", "🎉", "🌟", "👍", "👏", "🌼", "🌺", "🎊", "🎈"]);
    }
    return stillRing(["🌸", "✨", "⭐", "🎉", "🌟", "👍", "👏", "🌼", "🌺"]);
  }

  if (level === "correct") {
    const count = compact ? 8 : 10;
    const settle = 4.15;
    const angles = shuffle(compass(count), rng);
    return Array.from({ length: count }, (_, index) => {
      const emoji = cycle(MIX, index);
      const angle = angles[index] ?? -90;
      const slot = ringPoint(angle, compact, rng);
      const delay = entranceDelay(index, 0.15, 0.15, rng);
      const move = vector(angle, distanceFor(emoji, compact, rng), rng);
      const curve = range(rng, -22, 22);
      return particle(
        `c-${index}`,
        emoji,
        slot.left,
        slot.top,
        compact ? 18 + (index % 3) * 2 : 20 + (index % 4) * 3,
        delay,
        floatUntil(delay, settle),
        "sparkle",
        move.x,
        move.y,
        curve,
        rng,
      );
    });
  }

  if (level === "streak" || level === "streak5") {
    const count = level === "streak5" ? (compact ? 18 : 22) : compact ? 14 : 18;
    const settle = level === "streak5" ? 4.75 : 4.45;
    const waveSplit = Math.ceil(count / 2);
    const boost = compact ? 1.15 : 1.35;
    return Array.from({ length: count }, (_, index) => {
      const region = cycle(REGIONS, index);
      const inSecond = level === "streak5" && index >= waveSplit;
      const local = inSecond ? index - waveSplit : index;
      const delay = inSecond
        ? entranceDelay(local, 1.5, 0.12, rng)
        : entranceDelay(local, level === "streak5" ? 0.2 : 0.15, 0.12, rng);
      const emoji = cycle(STREAK_MIX, index);
      const angle = (index * 47) % 360 - 180;
      const move = vector(angle, distanceFor(emoji, compact, rng) * boost, rng);
      const jitterL = range(rng, -4, 4);
      const jitterT = range(rng, -5, 5);
      return particle(
        `s-${index}`,
        emoji,
        clamp(region.left + jitterL, 4, 94),
        clamp(region.top + jitterT, 4, 90),
        compact ? 18 + (index % 3) * 2 : 22 + (index % 4) * 3,
        delay,
        floatUntil(delay, settle),
        "sparkle",
        move.x,
        move.y,
        range(rng, -28, 28),
        rng,
      );
    });
  }

  const confettiCount = compact ? 10 : 18;
  const balloonCount = compact ? 8 : 10;
  const sparkleCount = compact ? 10 : 14;
  const wave2Count = compact ? 6 : 8;
  const confetti = Array.from({ length: confettiCount }, (_, index) => {
    const region = cycle(REGIONS, index);
    const delay = entranceDelay(index, 0.5, 0.1, rng);
    const emoji = cycle(COMPLETE_MIX, index);
    return particle(
      `f-${index}`,
      emoji,
      region.left + (index % 4) * 3,
      4 + (index % 5) * 8,
      compact ? 16 + (index % 3) * 2 : 20 + (index % 4) * 4,
      delay,
      2.6 + (index % 4) * 0.2,
      "confetti",
      range(rng, -30, 30),
      range(rng, 80, 160),
      0,
      rng,
    );
  });
  const balloons = Array.from({ length: balloonCount }, (_, index) =>
    particle(
      `b-${index}`,
      "🎈",
      4 + ((index * 13) % 88),
      88 + (index % 3) * 4,
      compact ? 28 : 34 + (index % 4) * 6,
      entranceDelay(index, 0.7, 0.12, rng),
      4.2 + (index % 5) * 0.4,
      "balloon",
      range(rng, -18, 18),
      range(rng, -140, -90),
      0,
      rng,
    ),
  );
  const sparkles = Array.from({ length: sparkleCount }, (_, index) => {
    const region = cycle(REGIONS, index);
    const delay = entranceDelay(index, 0.2, 0.1, rng);
    const emoji = cycle(COMPLETE_MIX, index);
    const angle = (index * 51) % 360 - 180;
    const move = vector(angle, distanceFor(emoji, compact, rng), rng);
    return particle(
      `p-${index}`,
      emoji,
      region.left,
      region.top,
      compact ? 18 : 22 + (index % 3) * 2,
      delay,
      3.4,
      "sparkle",
      move.x,
      move.y,
      range(rng, -24, 24),
      rng,
    );
  });
  const wave2 = Array.from({ length: wave2Count }, (_, index) => {
    const region = cycle(REGIONS, index + 3);
    const delay = entranceDelay(index, 2, 0.14, rng);
    const emoji = cycle(STREAK_MIX, index + 2);
    const angle = (index * 73) % 360 - 180;
    const move = vector(angle, distanceFor(emoji, compact, rng), rng);
    return particle(
      `w2-${index}`,
      emoji,
      region.left + 4,
      region.top + 2,
      compact ? 18 : 24,
      delay,
      3.2,
      "sparkle",
      move.x,
      move.y,
      range(rng, -20, 20),
      rng,
    );
  });
  return [...sparkles, ...wave2, ...confetti, ...balloons];
}
