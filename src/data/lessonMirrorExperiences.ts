import type { LetterArtId } from "@/data/letterAssociations";
import {
  magicWorldForArt,
  type MagicAmbient,
} from "@/data/magicWorldCatalog";

/**
 * How the mirror should *feel* for an association — ambient world + body action.
 * Keeps curriculum words unchanged; only changes sensory presentation.
 */
export type MirrorExperienceId = string;

/** Reusable semantic effect families for Magic Learning Worlds. */
export type MirrorEffectType =
  | "weather"
  | "space"
  | "clothing"
  | "animal"
  | "underwater"
  | "food-drink"
  | "music"
  | "vehicle"
  | "nature"
  | "royalty"
  | "object"
  | "special"
  | "play";

export type MirrorExperience = {
  id: MirrorExperienceId;
  art?: LetterArtId;
  /** Short line under the mirror while live. */
  feelLine: string;
  /** Soft ambient world tint drawn every frame (even idle). */
  ambient: MagicAmbient | "none";
  effectType: MirrorEffectType;
};

const DEFAULT: MirrorExperience = {
  id: "default-play",
  feelLine: "Looking magical!",
  ambient: "none",
  effectType: "play",
};

export function mirrorExperienceForArt(
  art: LetterArtId | undefined,
): MirrorExperience {
  const world = magicWorldForArt(art);
  if (!world) return DEFAULT;
  return {
    id: `${world.environment}-${world.art}`,
    art: world.art,
    feelLine: world.feelLine,
    ambient: world.ambient,
    effectType: world.effectType,
  };
}
