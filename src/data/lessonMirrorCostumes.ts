import type { LetterArtId } from "@/data/letterAssociations";
import { associationsFor } from "@/data/letterAssociations";
import type { DressUpAnchor } from "@/data/dressUpCostumes";
import { livingSceneForArt } from "@/data/livingScenes";
import { fallbackMirrorProp } from "@/lib/dressUp/fallbackMirrorProp";

/** Bump when replacing files under public/lesson-mirror/. */
export const LESSON_MIRROR_ASSET_VERSION = "5";

export type LessonMirrorCostume = {
  art: LetterArtId;
  name: string;
  assetPath: string;
  anchor: DressUpAnchor;
  scale: number;
  offsetY: number;
  /** True when using a generated ring prop (no dedicated SVG yet). */
  fallback?: boolean;
};

/**
 * Dedicated face-centered wearables. Prefer helmet anchors so rings/hoods
 * frame the real face without clipping above the mirror.
 */
export const LESSON_MIRROR_COSTUMES: readonly LessonMirrorCostume[] = [
  {
    art: "frog",
    name: "Frog",
    assetPath: `/lesson-mirror/frog.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.35,
    offsetY: -0.05,
  },
  {
    art: "fish",
    name: "Fish",
    assetPath: `/lesson-mirror/fish.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.3,
    offsetY: -0.04,
  },
  {
    art: "flower",
    name: "Flower",
    assetPath: `/lesson-mirror/flower.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.55,
    offsetY: 0,
  },
  {
    art: "juice",
    name: "Juice",
    assetPath: `/lesson-mirror/juice.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.2,
    offsetY: -0.02,
  },
  {
    art: "jelly",
    name: "Jelly",
    assetPath: `/lesson-mirror/jelly.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.35,
    offsetY: -0.02,
  },
  {
    art: "jacket",
    name: "Jacket",
    assetPath: `/lesson-mirror/jacket.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.4,
    offsetY: 0.08,
  },
  {
    art: "sun",
    name: "Sun",
    assetPath: `/lesson-mirror/sun.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.5,
    offsetY: 0,
  },
] as const;

const DEDICATED = new Map(LESSON_MIRROR_COSTUMES.map((c) => [c.art, c]));

function titleFromArt(art: LetterArtId): string {
  for (const ch of "abcdefghijklmnopqrstuvwxyz ;,./") {
    const hit = associationsFor(ch).find((item) => item.art === art);
    if (hit) return hit.word;
  }
  const spaceHit = associationsFor(" ").find((item) => item.art === art);
  if (spaceHit) return spaceHit.word;
  return art
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Dedicated costume when available; otherwise a colored face-ring prop so
 * every association stays magical without blocking learning.
 */
export function lessonMirrorCostumeForArt(
  art: LetterArtId | undefined,
): LessonMirrorCostume | null {
  if (!art) return null;
  const dedicated = DEDICATED.get(art);
  if (dedicated) return dedicated;
  const scene = livingSceneForArt(art);
  return fallbackMirrorProp(art, titleFromArt(art), scene?.border ?? "#FFD85A");
}

export function isLessonMirrorArt(art: string): boolean {
  return DEDICATED.has(art as LetterArtId);
}
