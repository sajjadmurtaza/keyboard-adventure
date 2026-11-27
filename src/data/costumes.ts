/**
 * Magic Mirror wardrobe — Phase 1 (no camera).
 * Unlocks tie to first letter introductions, never to “looks cute” scoring.
 */

export const COSTUME_IDS = [
  "fish-hat",
  "cat-ears",
  "rocket-cape",
  "star-crown",
  "dino-spikes",
] as const;

export type CostumeId = (typeof COSTUME_IDS)[number];

export type CostumeSlot = "hat" | "ears" | "cape" | "crown" | "spikes";

export type Costume = {
  id: CostumeId;
  name: string;
  emoji: string;
  /** First correct press that introduces this letter unlocks the costume. */
  unlockLetter: string;
  slot: CostumeSlot;
  blurb: string;
};

export const COSTUMES: readonly Costume[] = [
  {
    id: "fish-hat",
    name: "Fish Hat",
    emoji: "🐠",
    unlockLetter: "f",
    slot: "hat",
    blurb: "A splashy hat for letter F!",
  },
  {
    id: "cat-ears",
    name: "Cat Ears",
    emoji: "🐱",
    unlockLetter: "c",
    slot: "ears",
    blurb: "Soft ears for letter C!",
  },
  {
    id: "rocket-cape",
    name: "Rocket Cape",
    emoji: "🚀",
    unlockLetter: "r",
    slot: "cape",
    blurb: "Zoom power for letter R!",
  },
  {
    id: "star-crown",
    name: "Star Crown",
    emoji: "⭐",
    unlockLetter: "s",
    slot: "crown",
    blurb: "Sparkle for letter S!",
  },
  {
    id: "dino-spikes",
    name: "Dino Spikes",
    emoji: "🦕",
    unlockLetter: "d",
    slot: "spikes",
    blurb: "Roar-ready for letter D!",
  },
] as const;

const BY_ID = Object.fromEntries(COSTUMES.map((c) => [c.id, c])) as Record<
  CostumeId,
  Costume
>;

const BY_LETTER = Object.fromEntries(
  COSTUMES.map((c) => [c.unlockLetter, c]),
) as Record<string, Costume>;

export function isCostumeId(value: string): value is CostumeId {
  return (COSTUME_IDS as readonly string[]).includes(value);
}

export function getCostume(id: CostumeId): Costume {
  return BY_ID[id];
}

export function costumeForLetter(letter: string): Costume | undefined {
  const key = letter.trim().toLowerCase();
  if (key === " " || key.length !== 1) return undefined;
  return BY_LETTER[key];
}

/** Normalize / sanitize a stored id list (max one of each, catalog only). */
export function parseCostumeIds(value: unknown, max = 16): CostumeId[] {
  if (!Array.isArray(value)) return [];
  const out: CostumeId[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !isCostumeId(item)) continue;
    if (out.includes(item)) continue;
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * If `letter` was just introduced for the first time and maps to a costume
 * not yet unlocked, return that costume. Otherwise null.
 */
export function grantOnLetterIntro(
  letter: string,
  alreadyUnlocked: readonly string[],
): Costume | null {
  const costume = costumeForLetter(letter);
  if (!costume) return null;
  if (alreadyUnlocked.includes(costume.id)) return null;
  return costume;
}

export function unlockedFromLetters(
  introducedKeys: readonly string[],
): CostumeId[] {
  const ids: CostumeId[] = [];
  for (const key of introducedKeys) {
    const costume = costumeForLetter(key);
    if (costume && !ids.includes(costume.id)) ids.push(costume.id);
  }
  return ids;
}
