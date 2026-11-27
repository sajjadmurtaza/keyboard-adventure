import type { LetterArtId } from "@/data/letterAssociations";
import type { DressUpAnchor } from "@/data/dressUpCostumes";

/** Bump when replacing files under public/lesson-mirror/. */
export const LESSON_MIRROR_ASSET_VERSION = "2";

export type LessonMirrorCostume = {
  art: LetterArtId;
  name: string;
  assetPath: string;
  anchor: DressUpAnchor;
  scale: number;
  offsetY: number;
};

/** F/J living-alphabet associations only — auto-worn in Learning Mirror. */
export const LESSON_MIRROR_COSTUMES: readonly LessonMirrorCostume[] = [
  {
    art: "frog",
    name: "Frog",
    assetPath: `/lesson-mirror/frog.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "hat",
    scale: 2.1,
    offsetY: -0.42,
  },
  {
    art: "fish",
    name: "Fish",
    assetPath: `/lesson-mirror/fish.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "hat",
    scale: 2.05,
    offsetY: -0.4,
  },
  {
    art: "flower",
    name: "Flower",
    assetPath: `/lesson-mirror/flower.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "crown",
    scale: 1.85,
    offsetY: -0.72,
  },
  {
    art: "juice",
    name: "Juice",
    assetPath: `/lesson-mirror/juice.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "hat",
    scale: 1.9,
    offsetY: -0.5,
  },
  {
    art: "jelly",
    name: "Jelly",
    assetPath: `/lesson-mirror/jelly.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "hat",
    scale: 2.0,
    offsetY: -0.38,
  },
  {
    art: "jacket",
    name: "Jacket",
    assetPath: `/lesson-mirror/jacket.svg?v=${LESSON_MIRROR_ASSET_VERSION}`,
    anchor: "helmet",
    scale: 2.15,
    offsetY: 0.12,
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
