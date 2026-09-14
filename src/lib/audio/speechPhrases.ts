import { associationFor } from "@/data/letterAssociations";
import { displayKey, normalizeTarget, tinyHint } from "@/utils/keys";
import { parseChildName } from "@/utils/childName";
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
  if (!parseChildName(name)) return false;
  if (frequency === "never") return false;
  if (frequency === "celebrations") return kind === "celebrate";
  if (frequency === "sometimes") {
    return kind === "celebrate" ? chance(0.35) : chance(0.25);
  }
  return true;
}

export function getTargetInstruction(
  key: string,
  name?: string,
  options?: { shortened?: boolean },
): string {
  const who = parseChildName(name ?? "") ?? "";
  const label = spokenKey(key);
  const letter = displayKey(key);
  const assoc = associationFor(key);

  if (normalizeTarget(key) === " ") {
    return who ? `${who}, press the space bar.` : "Press the space bar.";
  }

  if (tinyHint(key)) {
    return who ? `${who}, type the ${label}.` : `Type the ${label}.`;
  }

  if (assoc) {
    const word = assoc.word;
    if (options?.shortened) {
      return `${letter}, ${letter}, ${word}!`;
    }
    return who
      ? `${letter} is for ${word}! ${who}, type ${letter} for ${word}.`
      : `${letter} is for ${word}! Type ${letter} for ${word}.`;
  }

  return who ? `${who}, type ${letter}.` : `Type ${letter}.`;
}

export function getWrongInstruction(
  key: string,
  attempts: number,
  name?: string,
): string | null {
  const label = spokenKey(key);
  const who = parseChildName(name ?? "") ?? "";
  if (attempts <= 1) return null;
  if (attempts === 2) {
    return who ? `Almost, ${who}. Find ${label}.` : `Almost! Find ${label}.`;
  }
  if (attempts === 3) {
    return who
      ? `You can do it, ${who}. Find ${label}.`
      : `You can do it! Find ${label}.`;
  }
  if (attempts % 3 === 0) return `Try ${label} again.`;
  return null;
}

export function getStreakPhrase(streak: number, name?: string): string {
  const who = parseChildName(name ?? "") ?? "";
  if (streak >= 5) {
    return pickFresh(
      who
        ? [`Woohoo, ${who}! Super streak!`, "Wow! You're on a roll!", "Super typing!"]
        : ["Woohoo! Super streak!", "Wow! You're on a roll!", "Super typing!"],
    );
  }
  return pickFresh(
    who
      ? [`Woohoo, ${who}! Three in a row!`, ...BIG_SUCCESS_PHRASES]
      : ["Woohoo! Three in a row!", ...BIG_SUCCESS_PHRASES],
  );
}

export function getLessonCompletePhrase(name?: string): string {
  const who = parseChildName(name ?? "") ?? "";
  return pickFresh(
    who
      ? [
          `Fantastic, ${who}! You finished the adventure!`,
          `You did it, ${who}!`,
          `Amazing work, ${who}!`,
          "Adventure complete!",
        ]
      : ["Woohoo! You did it!", "Fantastic job! Adventure complete!", "Amazing typing!"],
  );
}

export function getPreviewPhrase(): string {
  return "Woohoo! Fantastic! You found F!";
}

export function getNameTestPhrase(name: string): string {
  const who = parseChildName(name);
  return who ? `Hello, ${who}! Let's start typing!` : "Hello! Let's start typing!";
}
