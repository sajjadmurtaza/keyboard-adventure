export type CelebrationLevel = "correct" | "streak" | "complete";

export type PartyBit = {
  id: string;
  emoji: string;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  kind: "sparkle" | "confetti" | "balloon";
  spin: number;
};

const SPARKLES = ["✨", "⭐"];
const STREAK_BITS = ["✨", "⭐", "🎉", "👏"];
const PARTY_BITS = ["🎉", "🎊", "⭐", "✨", "👏", "🎈", "🥳"];
const BALLOONS = ["🎈", "🎈", "🎉"];

const REGIONS = [
  { left: 6, top: 8 },
  { left: 48, top: 6 },
  { left: 86, top: 10 },
  { left: 8, top: 44 },
  { left: 86, top: 46 },
  { left: 8, top: 78 },
  { left: 48, top: 84 },
  { left: 86, top: 76 },
] as const;

function bit(
  id: string,
  emoji: string,
  left: number,
  top: number,
  size: number,
  delay: number,
  duration: number,
  kind: PartyBit["kind"],
  spin: number,
): PartyBit {
  return {
    id,
    emoji,
    left: `${left}%`,
    top: `${top}%`,
    size,
    delay,
    duration,
    kind,
    spin,
  };
}

export function celebrationPlan(
  level: CelebrationLevel,
  compact = false,
  reducedMotion = false,
): PartyBit[] {
  if (reducedMotion) {
    if (level === "complete") {
      return ["🎉", "⭐", "🎈"].map((emoji, index) =>
        bit(`still-${index}`, emoji, 28 + index * 18, 18, 36, 0, 0, "sparkle", 0),
      );
    }
    return [];
  }

  if (level === "correct") {
    const count = compact ? 4 : 6;
    return Array.from({ length: count }, (_, index) =>
      bit(
        `c-${index}`,
        SPARKLES[index % SPARKLES.length]!,
        38 + (index % 3) * 10,
        28 + Math.floor(index / 3) * 16,
        compact ? 16 : 20,
        index * 0.04,
        0.9,
        "sparkle",
        index % 2 === 0 ? 12 : -12,
      ),
    );
  }

  if (level === "streak") {
    const count = compact ? 10 : 16;
    return Array.from({ length: count }, (_, index) => {
      const region = REGIONS[index % REGIONS.length]!;
      return bit(
        `s-${index}`,
        STREAK_BITS[index % STREAK_BITS.length]!,
        region.left + (index % 3) * 2,
        region.top + (index % 2) * 3,
        compact ? 20 : 26,
        (index % 6) * 0.05,
        1.4,
        "sparkle",
        (index % 2 === 0 ? 1 : -1) * 20,
      );
    });
  }

  const confettiCount = compact ? 16 : 28;
  const balloonCount = compact ? 8 : 12;
  const sparkleCount = compact ? 8 : 12;
  const confetti = Array.from({ length: confettiCount }, (_, index) => {
    const region = REGIONS[index % REGIONS.length]!;
    return bit(
      `f-${index}`,
      PARTY_BITS[index % PARTY_BITS.length]!,
      region.left + (index % 4) * 3,
      4 + (index % 5) * 8,
      compact ? 18 : 24 + (index % 3) * 4,
      0.4 + (index % 8) * 0.06,
      2.4 + (index % 4) * 0.2,
      "confetti",
      (index % 2 === 0 ? 1 : -1) * (40 + (index % 5) * 8),
    );
  });
  const balloons = Array.from({ length: balloonCount }, (_, index) =>
    bit(
      `b-${index}`,
      BALLOONS[index % BALLOONS.length]!,
      4 + ((index * 13) % 88),
      88 + (index % 3) * 4,
      compact ? 28 : 34 + (index % 4) * 6,
      0.7 + (index % 7) * 0.12,
      3.6 + (index % 5) * 0.4,
      "balloon",
      (index % 2 === 0 ? 1 : -1) * (8 + (index % 4) * 4),
    ),
  );
  const sparkles = Array.from({ length: sparkleCount }, (_, index) => {
    const region = REGIONS[index % REGIONS.length]!;
    return bit(
      `p-${index}`,
      index % 2 === 0 ? "✨" : "👏",
      region.left,
      region.top,
      compact ? 18 : 22,
      0.2 + index * 0.05,
      1.6,
      "sparkle",
      10,
    );
  });
  return [...sparkles, ...confetti, ...balloons];
}
