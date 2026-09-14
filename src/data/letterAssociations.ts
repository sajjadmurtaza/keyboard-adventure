export type LetterArtId =
  | "apple"
  | "ball"
  | "cat"
  | "dog"
  | "egg"
  | "fish"
  | "grapes"
  | "hat"
  | "ice-cream"
  | "juice"
  | "kite"
  | "lion"
  | "moon"
  | "nest"
  | "orange"
  | "panda"
  | "queen"
  | "rainbow"
  | "sun"
  | "turtle"
  | "umbrella"
  | "van"
  | "whale"
  | "xylophone"
  | "yo-yo"
  | "zebra";

export type LetterAssociation = {
  word: string;
  art: LetterArtId;
  motion: "swim" | "bounce" | "float" | "pulse" | "wiggle";
};

export const LETTER_ASSOCIATIONS: Record<string, LetterAssociation> = {
  a: { word: "Apple", art: "apple", motion: "bounce" },
  b: { word: "Ball", art: "ball", motion: "bounce" },
  c: { word: "Cat", art: "cat", motion: "wiggle" },
  d: { word: "Dog", art: "dog", motion: "wiggle" },
  e: { word: "Egg", art: "egg", motion: "bounce" },
  f: { word: "Fish", art: "fish", motion: "swim" },
  g: { word: "Grapes", art: "grapes", motion: "bounce" },
  h: { word: "Hat", art: "hat", motion: "float" },
  i: { word: "Ice cream", art: "ice-cream", motion: "bounce" },
  j: { word: "Juice", art: "juice", motion: "bounce" },
  k: { word: "Kite", art: "kite", motion: "float" },
  l: { word: "Lion", art: "lion", motion: "wiggle" },
  m: { word: "Moon", art: "moon", motion: "float" },
  n: { word: "Nest", art: "nest", motion: "bounce" },
  o: { word: "Orange", art: "orange", motion: "bounce" },
  p: { word: "Panda", art: "panda", motion: "wiggle" },
  q: { word: "Queen", art: "queen", motion: "float" },
  r: { word: "Rainbow", art: "rainbow", motion: "pulse" },
  s: { word: "Sun", art: "sun", motion: "pulse" },
  t: { word: "Turtle", art: "turtle", motion: "wiggle" },
  u: { word: "Umbrella", art: "umbrella", motion: "float" },
  v: { word: "Van", art: "van", motion: "wiggle" },
  w: { word: "Whale", art: "whale", motion: "swim" },
  x: { word: "Xylophone", art: "xylophone", motion: "bounce" },
  y: { word: "Yo-yo", art: "yo-yo", motion: "bounce" },
  z: { word: "Zebra", art: "zebra", motion: "wiggle" },
};

export function associationFor(key: string): LetterAssociation | null {
  const letter = key.toLowerCase();
  if (letter.length !== 1 || letter < "a" || letter > "z") return null;
  return LETTER_ASSOCIATIONS[letter] ?? null;
}
