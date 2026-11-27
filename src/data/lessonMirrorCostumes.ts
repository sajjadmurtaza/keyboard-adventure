import type { LetterArtId } from "@/data/letterAssociations";
import { associationsFor } from "@/data/letterAssociations";
import type { DressUpAnchor } from "@/data/dressUpCostumes";
import { fallbackMirrorProp } from "@/lib/dressUp/fallbackMirrorProp";

/** Bump when replacing files under public/lesson-mirror/. */
export const LESSON_MIRROR_ASSET_VERSION = "12";

export type LessonMirrorRenderStyle =
  | "face-frame"
  | "head-accessory"
  | "eye-accessory"
  | "body-wear"
  | "hand-prop"
  | "companion"
  | "scene";

export type LessonMirrorCostume = {
  art: LetterArtId;
  name: string;
  /** Local asset path, or empty string for companion / scene LetterArt props. */
  assetPath: string;
  anchor: DressUpAnchor;
  scale: number;
  offsetY: number;
  /** Optional horizontal shift as a fraction of face width. */
  offsetX?: number;
  style: LessonMirrorRenderStyle;
  /** True when using LetterArt companion (no dedicated wearable yet). */
  fallback?: boolean;
};

function lessonAsset(file: string): string {
  return `/lesson-mirror/${file}?v=${LESSON_MIRROR_ASSET_VERSION}`;
}

function wearableAsset(file: string): string {
  return lessonAsset(`wearables/${file}`);
}

function objectAsset(file: string): string {
  return lessonAsset(`objects/${file}`);
}

/**
 * Dedicated face-centered wearables and head accessories.
 * Prefer punched AR-accessory PNGs from the object/wearable art sheets.
 */
export const LESSON_MIRROR_COSTUMES: readonly LessonMirrorCostume[] = [
  // Keep the apple hood SVG — no matching AR accessory on the wearable sheet.
  {
    art: "apple",
    name: "Apple",
    assetPath: lessonAsset("apple.svg"),
    anchor: "helmet",
    scale: 2.5,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "ant",
    name: "Ant",
    assetPath: wearableAsset("ant.png"),
    anchor: "hat",
    scale: 1.85,
    offsetY: -0.72,
    style: "head-accessory",
  },
  {
    art: "bear",
    name: "Bear",
    assetPath: wearableAsset("bear.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "cat",
    name: "Cat",
    assetPath: wearableAsset("cat.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.04,
    style: "face-frame",
  },
  {
    art: "dog",
    name: "Dog",
    assetPath: wearableAsset("dog.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "duck",
    name: "Duck",
    assetPath: wearableAsset("duck.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "drum",
    name: "Drum",
    // Musical prop in front of the child — not a face ring.
    assetPath: objectAsset("drum.png"),
    anchor: "torso",
    scale: 0.95,
    offsetY: 0.12,
    offsetX: 0.08,
    style: "hand-prop",
  },
  {
    art: "elephant",
    name: "Elephant",
    assetPath: wearableAsset("elephant.png"),
    anchor: "helmet",
    scale: 2.5,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "fish",
    name: "Fish",
    // Underwater world + LetterArt companions; ambient draws swimming fish.
    assetPath: "",
    anchor: "helmet",
    scale: 1,
    offsetY: 0,
    style: "scene",
    fallback: true,
  },
  {
    art: "frog",
    name: "Frog",
    assetPath: wearableAsset("frog.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.05,
    style: "face-frame",
  },
  {
    art: "flower",
    name: "Flower",
    assetPath: wearableAsset("flower.png"),
    anchor: "helmet",
    scale: 2.6,
    offsetY: 0,
    style: "face-frame",
  },
  {
    art: "goat",
    name: "Goat",
    assetPath: wearableAsset("goat.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "hat",
    name: "Hat",
    assetPath: wearableAsset("hat.png"),
    anchor: "hat",
    scale: 1.75,
    offsetY: -0.62,
    style: "head-accessory",
  },
  {
    art: "horse",
    name: "Horse",
    assetPath: wearableAsset("horse.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "insect",
    name: "Insect",
    assetPath: wearableAsset("insect.png"),
    anchor: "hat",
    scale: 1.8,
    offsetY: -0.7,
    style: "head-accessory",
  },
  {
    art: "juice",
    name: "Juice",
    // Carton near the mouth — pretend sip (eyes stay visible).
    assetPath: objectAsset("juice.png"),
    anchor: "mouth",
    scale: 1.05,
    offsetY: 0.06,
    offsetX: 0.05,
    style: "hand-prop",
  },
  {
    art: "jelly",
    name: "Jelly",
    assetPath: lessonAsset("jelly.svg"),
    anchor: "helmet",
    scale: 2.4,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "jacket",
    name: "Jacket",
    // Upper-body wearable via shoulder estimate (Pose Landmarker when local model exists).
    assetPath: objectAsset("jacket.png"),
    anchor: "torso",
    scale: 1.05,
    offsetY: -0.08,
    style: "body-wear",
  },
  {
    art: "kite",
    name: "Kite",
    assetPath: wearableAsset("kite.png"),
    anchor: "hat",
    scale: 1.7,
    offsetY: -0.95,
    style: "head-accessory",
  },
  {
    art: "king",
    name: "King",
    assetPath: wearableAsset("king.png"),
    anchor: "crown",
    scale: 1.7,
    offsetY: -0.88,
    style: "head-accessory",
  },
  {
    art: "lion",
    name: "Lion",
    assetPath: wearableAsset("lion.png"),
    anchor: "mane",
    scale: 2.45,
    offsetY: 0,
    style: "face-frame",
  },
  {
    art: "mouse",
    name: "Mouse",
    assetPath: wearableAsset("mouse.png"),
    anchor: "helmet",
    scale: 2.4,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "milk",
    name: "Milk",
    assetPath: objectAsset("milk.png"),
    anchor: "mouth",
    scale: 1.05,
    offsetY: 0.06,
    offsetX: 0.05,
    style: "hand-prop",
  },
  {
    art: "owl",
    name: "Owl",
    assetPath: wearableAsset("owl.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "octopus",
    name: "Octopus",
    // Underwater companion — face stays clear; ambient draws the sea world.
    assetPath: "",
    anchor: "helmet",
    scale: 1,
    offsetY: 0,
    style: "scene",
    fallback: true,
  },
  {
    art: "panda",
    name: "Panda",
    assetPath: wearableAsset("panda.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "pig",
    name: "Pig",
    assetPath: wearableAsset("pig.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
  {
    art: "queen",
    name: "Queen",
    assetPath: wearableAsset("queen.png"),
    anchor: "crown",
    scale: 1.7,
    offsetY: -0.88,
    style: "head-accessory",
  },
  {
    art: "robot",
    name: "Robot",
    assetPath: wearableAsset("robot.png"),
    anchor: "helmet",
    scale: 2.2,
    offsetY: -0.04,
    style: "face-frame",
  },
  {
    art: "sun",
    name: "Sun",
    // Warm environment + illustrated sun in-scene (face stays clear).
    assetPath: "",
    anchor: "helmet",
    scale: 1,
    offsetY: 0,
    style: "scene",
    fallback: true,
  },
  {
    art: "star",
    name: "Star",
    assetPath: wearableAsset("star.png"),
    anchor: "helmet",
    scale: 2.5,
    offsetY: 0,
    style: "face-frame",
  },
  {
    art: "snake",
    name: "Snake",
    assetPath: wearableAsset("snake.png"),
    anchor: "hat",
    scale: 1.85,
    offsetY: -0.7,
    style: "head-accessory",
  },
  {
    art: "unicorn",
    name: "Unicorn",
    assetPath: wearableAsset("unicorn.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.04,
    style: "face-frame",
  },
  {
    art: "zebra",
    name: "Zebra",
    assetPath: wearableAsset("zebra.png"),
    anchor: "helmet",
    scale: 2.45,
    offsetY: -0.02,
    style: "face-frame",
  },
] as const;

const DEDICATED = new Map(LESSON_MIRROR_COSTUMES.map((c) => [c.art, c]));

function titleFromArt(art: LetterArtId): string {
  for (const ch of "abcdefghijklmnopqrstuvwxyz;,./") {
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

/** True when the costume paints onto the face canvas (not LetterArt companion/scene). */
export function isCanvasLessonCostume(
  costume: LessonMirrorCostume | null | undefined,
): boolean {
  if (!costume) return false;
  if (!costume.assetPath) return false;
  if (costume.style === "companion" || costume.style === "scene") return false;
  return (
    costume.style === "face-frame" ||
    costume.style === "head-accessory" ||
    costume.style === "eye-accessory" ||
    costume.style === "body-wear" ||
    costume.style === "hand-prop"
  );
}

/** Scene / companion modes keep the face clear and use ambient + LetterArt. */
export function isSceneLessonCostume(
  costume: LessonMirrorCostume | null | undefined,
): boolean {
  return costume?.style === "scene" || costume?.style === "companion";
}

/**
 * Dedicated wearable when available; otherwise a LetterArt companion prop
 * so every association stays recognizable without a generic circle.
 */
export function lessonMirrorCostumeForArt(
  art: LetterArtId | undefined,
): LessonMirrorCostume | null {
  if (!art) return null;
  const dedicated = DEDICATED.get(art);
  if (dedicated) return dedicated;
  return fallbackMirrorProp(art, titleFromArt(art));
}

export function isLessonMirrorArt(art: string): boolean {
  return DEDICATED.has(art as LetterArtId);
}
