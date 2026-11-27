import type { LetterArtId } from "@/data/letterAssociations";

/**
 * How the mirror should *feel* for an association — ambient world + body action.
 * Keeps curriculum words unchanged; only changes sensory presentation.
 */
export type MirrorExperienceId =
  | "sun-heat"
  | "wear-jacket"
  | "drink-juice"
  | "sea-hunt"
  | "pond-hop"
  | "garden-bloom"
  | "drum-beat"
  | "jelly-wiggle"
  | "apple-crunch"
  | "pup-play"
  | "kitty-play"
  | "royal-pose"
  | "hat-wear"
  | "robot-beep"
  | "lion-roar"
  | "umbrella-rain"
  | "rocket-launch"
  | "ice-chill"
  | "default-play";

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
  /** Short line under the mirror while live. */
  feelLine: string;
  /** Soft ambient world tint drawn every frame (even idle). */
  ambient:
    | "heat"
    | "sea"
    | "pond"
    | "garden"
    | "cozy"
    | "snack"
    | "rain"
    | "space"
    | "chill"
    | "music"
    | "none";
  effectType: MirrorEffectType;
};

const BY_ART: Partial<Record<LetterArtId, MirrorExperience>> = {
  sun: {
    id: "sun-heat",
    feelLine: "Feel the warm sunshine!",
    ambient: "heat",
    effectType: "weather",
  },
  jacket: {
    id: "wear-jacket",
    feelLine: "Zip up — you're wearing the jacket!",
    ambient: "cozy",
    effectType: "clothing",
  },
  juice: {
    id: "drink-juice",
    feelLine: "Sip sip — drinking juice!",
    ambient: "snack",
    effectType: "food-drink",
  },
  milk: {
    id: "drink-juice",
    feelLine: "Mmm — cool milk!",
    ambient: "snack",
    effectType: "food-drink",
  },
  fish: {
    id: "sea-hunt",
    feelLine: "Swim and discover fish!",
    ambient: "sea",
    effectType: "underwater",
  },
  octopus: {
    id: "sea-hunt",
    feelLine: "Wave with the octopus!",
    ambient: "sea",
    effectType: "underwater",
  },
  whale: {
    id: "sea-hunt",
    feelLine: "Big splash with the whale!",
    ambient: "sea",
    effectType: "underwater",
  },
  frog: {
    id: "pond-hop",
    feelLine: "Hop around the little pond!",
    ambient: "pond",
    effectType: "nature",
  },
  flower: {
    id: "garden-bloom",
    feelLine: "Bloom in the magic garden!",
    ambient: "garden",
    effectType: "nature",
  },
  drum: {
    id: "drum-beat",
    feelLine: "Boom boom — play the drum!",
    ambient: "music",
    effectType: "music",
  },
  jelly: {
    id: "jelly-wiggle",
    feelLine: "Wiggle like jelly!",
    ambient: "snack",
    effectType: "food-drink",
  },
  apple: {
    id: "apple-crunch",
    feelLine: "Crunchy apple time!",
    ambient: "garden",
    effectType: "food-drink",
  },
  dog: {
    id: "pup-play",
    feelLine: "Woof — playful pup!",
    ambient: "none",
    effectType: "animal",
  },
  cat: {
    id: "kitty-play",
    feelLine: "Meow — soft kitty!",
    ambient: "none",
    effectType: "animal",
  },
  king: {
    id: "royal-pose",
    feelLine: "Wear your crown, Your Majesty!",
    ambient: "cozy",
    effectType: "royalty",
  },
  queen: {
    id: "royal-pose",
    feelLine: "Wear your crown, Your Majesty!",
    ambient: "cozy",
    effectType: "royalty",
  },
  hat: {
    id: "hat-wear",
    feelLine: "Pop the hat on your head!",
    ambient: "none",
    effectType: "clothing",
  },
  robot: {
    id: "robot-beep",
    feelLine: "Beep boop — robot mode!",
    ambient: "none",
    effectType: "object",
  },
  lion: {
    id: "lion-roar",
    feelLine: "Roar with your lion mane!",
    ambient: "none",
    effectType: "animal",
  },
  umbrella: {
    id: "umbrella-rain",
    feelLine: "Stay dry in the rain!",
    ambient: "rain",
    effectType: "weather",
  },
  rainbow: {
    id: "garden-bloom",
    feelLine: "Colors across the sky!",
    ambient: "garden",
    effectType: "weather",
  },
  rocket: {
    id: "rocket-launch",
    feelLine: "3… 2… 1… blast off!",
    ambient: "space",
    effectType: "space",
  },
  moon: {
    id: "rocket-launch",
    feelLine: "Quiet moon glow!",
    ambient: "space",
    effectType: "space",
  },
  star: {
    id: "rocket-launch",
    feelLine: "Twinkle like a star!",
    ambient: "space",
    effectType: "space",
  },
  "ice-cream": {
    id: "ice-chill",
    feelLine: "Brrr — cold ice cream!",
    ambient: "chill",
    effectType: "food-drink",
  },
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
  if (!art) return DEFAULT;
  return BY_ART[art] ?? DEFAULT;
}
