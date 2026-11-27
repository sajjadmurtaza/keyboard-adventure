import type { LetterArtId } from "@/data/letterAssociations";

/**
 * Living Alphabet scene metadata for the F/J experiment.
 * Extends association art with storybook scene chrome — does not change curriculum words.
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

export const LIVING_SCENES: Record<string, LivingScene> = {
  frog: {
    art: "frog",
    place: "Little Pond",
    tint: "#E8F8D8",
    border: "#7BC83C",
    celebrate: "ripples",
    invite: "Can you find my letter?",
  },
  fish: {
    art: "fish",
    place: "Underwater Discovery",
    tint: "#D9F3FF",
    border: "#3BA7E8",
    celebrate: "bubbles",
    invite: "Can you find my letter?",
  },
  flower: {
    art: "flower",
    place: "Magic Garden",
    tint: "#FFE4EC",
    border: "#E5395B",
    celebrate: "petals",
    invite: "Can you find my letter?",
  },
  juice: {
    art: "juice",
    place: "Sunny Snack Time",
    tint: "#FFF0D6",
    border: "#F57C00",
    celebrate: "sparkles",
    invite: "Can you find my letter?",
  },
  jelly: {
    art: "jelly",
    place: "Wiggle Party",
    tint: "#FFE0EE",
    border: "#EC407A",
    celebrate: "wobble",
    invite: "Can you find my letter?",
  },
  jacket: {
    art: "jacket",
    place: "Cozy Closet",
    tint: "#EDE4FF",
    border: "#5E35B1",
    celebrate: "stars",
    invite: "Can you find my letter?",
  },
  sun: {
    art: "sun",
    place: "Sunny Sky",
    tint: "#FFF6D0",
    border: "#F5A623",
    celebrate: "sparkles",
    invite: "Feel the warm sunshine!",
  },
  drum: {
    art: "drum",
    place: "Music Room",
    tint: "#FFE8E4",
    border: "#E53935",
    celebrate: "stars",
    invite: "Boom boom — play along!",
  },
  "stop-sign": {
    art: "stop-sign",
    place: "Pause Plaza",
    tint: "#FFE8E8",
    border: "#E53935",
    celebrate: "stars",
    invite: "Can you find my key?",
  },
  pause: {
    art: "pause",
    place: "Quiet Corner",
    tint: "#F3E8FF",
    border: "#7E57C2",
    celebrate: "sparkles",
    invite: "Can you find my key?",
  },
  wink: {
    art: "wink",
    place: "Smile Street",
    tint: "#FFF6D6",
    border: "#F9A825",
    celebrate: "sparkles",
    invite: "Can you find my key?",
  },
  breath: {
    art: "breath",
    place: "Breeze Bridge",
    tint: "#E3F7FF",
    border: "#29B6F6",
    celebrate: "bubbles",
    invite: "Can you find my key?",
  },
  list: {
    art: "list",
    place: "List Lane",
    tint: "#FFF4E0",
    border: "#FB8C00",
    celebrate: "stars",
    invite: "Can you find my key?",
  },
  curve: {
    art: "curve",
    place: "Comma Curve",
    tint: "#FFE4F0",
    border: "#EC407A",
    celebrate: "petals",
    invite: "Can you find my key?",
  },
  dot: {
    art: "dot",
    place: "Dot Dock",
    tint: "#E8ECFF",
    border: "#5C6BC0",
    celebrate: "sparkles",
    invite: "Can you find my key?",
  },
  bullseye: {
    art: "bullseye",
    place: "Target Town",
    tint: "#FFE8E4",
    border: "#E53935",
    celebrate: "stars",
    invite: "Can you find my key?",
  },
  fullstop: {
    art: "fullstop",
    place: "End Station",
    tint: "#E3F2FD",
    border: "#1565C0",
    celebrate: "sparkles",
    invite: "Can you find my key?",
  },
  path: {
    art: "path",
    place: "Trail Top",
    tint: "#E8F8E8",
    border: "#43A047",
    celebrate: "stars",
    invite: "Can you find my key?",
  },
  slide: {
    art: "slide",
    place: "Slide Slope",
    tint: "#E3F7FF",
    border: "#039BE5",
    celebrate: "bubbles",
    invite: "Can you find my key?",
  },
  divide: {
    art: "divide",
    place: "Split Spot",
    tint: "#F8E8FF",
    border: "#AB47BC",
    celebrate: "sparkles",
    invite: "Can you find my key?",
  },
  jump: {
    art: "jump",
    place: "Jump Jungle",
    tint: "#FFE8DC",
    border: "#FF7043",
    celebrate: "stars",
    invite: "Can you find my key?",
  },
  "space-cloud": {
    art: "space-cloud",
    place: "Sky Gap",
    tint: "#E8F4FF",
    border: "#42A5F5",
    celebrate: "bubbles",
    invite: "Can you find my key?",
  },
  gap: {
    art: "gap",
    place: "Open Space",
    tint: "#F0E8FF",
    border: "#7E57C2",
    celebrate: "sparkles",
    invite: "Can you find my key?",
  },
};

export function livingSceneForArt(art: LetterArtId | undefined): LivingScene | null {
  if (!art) return null;
  return LIVING_SCENES[art] ?? null;
}

export function isLivingLetter(letter: string): boolean {
  const key = letter.toLowerCase();
  return key === "f" || key === "j";
}
