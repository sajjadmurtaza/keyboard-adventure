import type { LetterArtId } from "@/data/letterAssociations";
import {
  allAssociationArtIds,
  magicWorldForArt,
} from "@/data/magicWorldCatalog";

/**
 * Living Alphabet scene metadata.
 * Sourced from the Magic World catalog so every association has a named place.
 */
export type LivingCelebrateStyle =
  | "ripples"
  | "bubbles"
  | "petals"
  | "sparkles"
  | "wobble"
  | "stars";

export type LivingScene = {
  art: LetterArtId;
  /** Short place name shown above the picture (camera-off). */
  place: string;
  /** Soft card / stage tint (CSS color). */
  tint: string;
  border: string;
  celebrate: LivingCelebrateStyle;
  /** One-line invitation while waiting (camera-off chrome). */
  invite: string;
};

function buildLivingScenes(): Record<string, LivingScene> {
  const out: Record<string, LivingScene> = {};
  for (const art of allAssociationArtIds()) {
    const scene = livingSceneForArt(art);
    if (scene) out[art] = scene;
  }
  return out;
}

export function livingSceneForArt(art: LetterArtId | undefined): LivingScene | null {
  const world = magicWorldForArt(art);
  if (!world || !art) return null;
  return {
    art,
    place: world.place,
    tint: world.tint,
    border: world.border,
    celebrate: world.celebrate,
    invite: world.invite,
  };
}

/** Snapshot of every association scene (for tests / inventory). */
export const LIVING_SCENES: Record<string, LivingScene> = buildLivingScenes();

export function isLivingLetter(letter: string): boolean {
  const key = letter.toLowerCase();
  return key === "f" || key === "j";
}
