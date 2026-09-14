import { displayKey, normalizeTarget } from "@/utils/keys";
import type { NameFrequency } from "@/utils/settings";

const SPOKEN_KEYS: Record<string, string> = {
  " ": "space bar",
  ";": "semicolon",
  ",": "comma",
  ".": "period",
  "/": "slash",
};

export function spokenKey(key: string): string {
  const normalized = normalizeTarget(key);
  return SPOKEN_KEYS[normalized] ?? displayKey(normalized);
}

function chance(percent: number) {
  return Math.random() < percent;
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
    return name ? `${name}, press the space bar.` : "Press the space bar.";
  }
  const options = name
    ? [
        `${name}, can you find ${label}?`,
        `Find ${label}, ${name}.`,
        `Can you find the letter ${label}?`,
      ]
    : [
        `Find ${label}.`,
        `Press ${label}.`,
        `Can you find the letter ${label}?`,
        `Type the letter ${label}.`,
      ];
  return options[Math.floor(Math.random() * options.length)] ?? `Find ${label}.`;
}

export function getWrongInstruction(
  key: string,
  attempts: number,
  name?: string,
): string | null {
  const label = spokenKey(key);
  if (attempts <= 1) return null;
  if (attempts === 2) return `Try ${label} again.`;
  if (attempts === 3) return `Find ${label}.`;
  if (attempts % 2 === 0) {
    return name
      ? `You can do it, ${name}. Find ${label}.`
      : `You can do it. Find ${label}.`;
  }
  return null;
}

export function getCorrectPhrase(name?: string): string {
  const options = name
    ? [
        `Great job, ${name}!`,
        `Nice work, ${name}!`,
        "You got it!",
        "Amazing!",
      ]
    : ["Great job!", "Amazing!", "Nice work!", "You got it!", "Fantastic!", "Super!", "Great typing!"];
  return options[Math.floor(Math.random() * options.length)] ?? "Great job!";
}

export function getStreakPhrase(streak: number, name?: string): string {
  if (streak >= 5) {
    return name ? `Super streak, ${name}!` : "Super streak!";
  }
  return name ? `Three in a row, ${name}!` : "Three in a row!";
}

export function getLessonCompletePhrase(name?: string): string {
  return name ? `Amazing work, ${name}!` : "You did it!";
}

export function getPreviewPhrase(name?: string): string {
  return name
    ? `Hello, ${name}! Let's go on a keyboard adventure!`
    : "Hello! Let's go on a keyboard adventure!";
}
