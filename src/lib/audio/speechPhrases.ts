import { displayKey, normalizeTarget } from "@/utils/keys";
import type { NameFrequency } from "@/utils/settings";

const SPOKEN_KEYS: Record<string, string> = {
  " ": "space bar",
  ";": "semicolon",
  ",": "comma",
  ".": "period",
  "/": "slash",
};

const BIG_SUCCESS_PHRASES = [
  "Wow! You're on a roll!",
  "Woohoo! Super typing!",
  "Fantastic job!",
  "That was awesome!",
  "Amazing work!",
];

let lastPhrase = "";

export function spokenKey(key: string): string {
  const normalized = normalizeTarget(key);
  return SPOKEN_KEYS[normalized] ?? displayKey(normalized);
}

function chance(percent: number) {
  return Math.random() < percent;
}

export function pickFresh(options: string[]): string {
  const unique = options.filter((line) => line !== lastPhrase);
  const pool = unique.length ? unique : options;
  const chosen = pool[Math.floor(Math.random() * pool.length)] ?? options[0] ?? "";
  lastPhrase = chosen;
  return chosen;
}

export function shouldSayName(
  frequency: NameFrequency,
  kind: "target" | "celebrate",
  name: string,
): boolean {
  if (!name || frequency === "never") return false;
  if (frequency === "celebrations") return kind === "celebrate";
  if (frequency === "sometimes") {
    return kind === "celebrate" ? chance(0.35) : chance(0.25);
  }
  return chance(0.5);
}

export function getTargetInstruction(key: string, name?: string): string {
  const label = spokenKey(key);
  if (label === "space bar") {
    return name ? `${name}, can you find the space bar?` : "Can you find the space bar?";
  }
  const named = name
    ? [`${name}, can you find ${label}?`, `Let's find ${label}, ${name}!`]
    : [];
  return pickFresh([
    ...named,
    `Can you find ${label}?`,
    `Find ${label}!`,
    `Let's find ${label}!`,
    `Where's ${label}?`,
    `Find the letter ${label}!`,
  ]);
}

export function getWrongInstruction(key: string, attempts: number): string | null {
  const label = spokenKey(key);
  if (attempts <= 1) return null;
  if (attempts === 2) return `Almost! Find ${label}.`;
  if (attempts === 3) return `You can do it! Find ${label}.`;
  if (attempts % 3 === 0) return `Try ${label} again.`;
  return null;
}

export function getStreakPhrase(streak: number, name?: string): string {
  if (streak >= 5) {
    return pickFresh(
      name
        ? [`Woohoo, ${name}! Super streak!`, "Wow! You're on a roll!", "Super typing!"]
        : ["Woohoo! Super streak!", "Wow! You're on a roll!", "Super typing!"],
    );
  }
  return pickFresh(
    name
      ? [`Woohoo, ${name}! Three in a row!`, ...BIG_SUCCESS_PHRASES]
      : ["Woohoo! Three in a row!", ...BIG_SUCCESS_PHRASES],
  );
}

export function getLessonCompletePhrase(name?: string): string {
  return pickFresh(
    name
      ? [
          `Woohoo, ${name}! You did it!`,
          `Amazing work, ${name}!`,
          "Woohoo! You did it!",
          "Fantastic job! Adventure complete!",
        ]
      : ["Woohoo! You did it!", "Fantastic job! Adventure complete!", "Amazing typing!"],
  );
}

export function getPreviewPhrase(): string {
  return "Woohoo! Fantastic! You found F!";
}
