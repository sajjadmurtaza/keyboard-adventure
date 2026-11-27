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
};

export function livingSceneForArt(art: LetterArtId | undefined): LivingScene | null {
  if (!art) return null;
  return LIVING_SCENES[art] ?? null;
}

export function isLivingLetter(letter: string): boolean {
  const key = letter.toLowerCase();
  return key === "f" || key === "j";
}
