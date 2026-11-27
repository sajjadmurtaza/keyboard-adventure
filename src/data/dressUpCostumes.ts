/**
 * Magic Dress-Up roles — independent of typing lesson unlocks.
 * Overlays are face-tracked illustrated assets under /dress-up/*.svg.
 */

export const DRESS_UP_IDS = [
  "astronaut",
  "lion",
  "firefighter",
  "robot",
  "royal",
  "chef",
] as const;

export type DressUpId = (typeof DRESS_UP_IDS)[number];

export type DressUpAnchor =
  | "helmet"
  | "mane"
  | "hat"
  | "crown"
  | "mouth"
  | "torso"
  | "eyes";

/** Bump when replacing files under public/dress-up/ so browsers skip stale Cache-Control copies. */
export const DRESS_UP_ASSET_VERSION = "5";

export type DressUpCostume = {
  id: DressUpId;
  name: string;
  /** Card thumbnail (emoji kept as lightweight label fallback). */
  emoji: string;
  /** Local SVG path — never a CDN. Includes cache-bust query. */
  assetPath: string;
  voiceLine: string;
  anchor: DressUpAnchor;
  /** Multiplier vs face width */
  scale: number;
  /** Vertical shift as fraction of face height (negative = up) */
  offsetY: number;
};

function asset(id: DressUpId): string {
  return `/dress-up/${id}.svg?v=${DRESS_UP_ASSET_VERSION}`;
}

export const DRESS_UP_COSTUMES: readonly DressUpCostume[] = [
  {
    id: "astronaut",
    name: "Astronaut",
    emoji: "🧑‍🚀",
    assetPath: asset("astronaut"),
    voiceLine: "Wow! You are an astronaut!",
    anchor: "helmet",
    scale: 1.95,
    offsetY: -0.02,
  },
  {
    id: "lion",
    name: "Lion",
    emoji: "🦁",
    assetPath: asset("lion"),
    voiceLine: "Roar! You are a lion!",
    anchor: "mane",
    scale: 2.4,
    offsetY: 0,
  },
  {
    id: "firefighter",
    name: "Firefighter",
    emoji: "🧑‍🚒",
    assetPath: asset("firefighter"),
    voiceLine: "Wow! You are a firefighter!",
    anchor: "hat",
    scale: 2.05,
    offsetY: -0.48,
  },
  {
    id: "robot",
    name: "Robot",
    emoji: "🤖",
    assetPath: asset("robot"),
    voiceLine: "Beep boop! You are a robot!",
    anchor: "helmet",
    scale: 1.95,
    offsetY: -0.04,
  },
  {
    id: "royal",
    name: "Royal",
    emoji: "👑",
    assetPath: asset("royal"),
    voiceLine: "Wow! You are royalty!",
    anchor: "crown",
    scale: 1.7,
    offsetY: -0.88,
  },
  {
    id: "chef",
    name: "Chef",
    emoji: "🧑‍🍳",
    assetPath: asset("chef"),
    voiceLine: "Yum! You are a chef!",
    anchor: "hat",
    scale: 1.7,
    offsetY: -0.55,
  },
] as const;

export function getDressUpCostume(id: DressUpId): DressUpCostume {
  const found = DRESS_UP_COSTUMES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown dress-up costume: ${id}`);
  return found;
}

export function isDressUpId(value: string): value is DressUpId {
  return (DRESS_UP_IDS as readonly string[]).includes(value);
}
