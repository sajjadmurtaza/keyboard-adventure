import type { LetterArtId } from "@/data/letterAssociations";
import type { DressUpAnchor } from "@/data/dressUpCostumes";

/** Bump when replacing files under public/lesson-mirror/. */
export const LESSON_MIRROR_ASSET_VERSION = "3";

export type LessonMirrorCostume = {
  art: LetterArtId;
  name: string;
  assetPath: string;
  anchor: DressUpAnchor;
  scale: number;
  offsetY: number;
};

/**
 * F/J living-alphabet associations — face-centered wearables.
 * Prefer helmet/mane anchors so rings and hoods frame the real face
 * (crown + large negative offsetY caused clipping above the mirror).
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
] as const;

export function lessonMirrorCostumeForArt(
  art: LetterArtId | undefined,
): LessonMirrorCostume | null {
  if (!art) return null;
  return LESSON_MIRROR_COSTUMES.find((c) => c.art === art) ?? null;
}

export function isLessonMirrorArt(art: string): boolean {
  return LESSON_MIRROR_COSTUMES.some((c) => c.art === art);
}
