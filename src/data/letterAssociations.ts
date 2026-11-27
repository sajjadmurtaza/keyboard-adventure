export type LetterArtId =
  | "apple"
  | "ant"
  | "airplane"
  | "ball"
  | "bear"
  | "bus"
  | "cat"
  | "car"
  | "cake"
  | "dog"
  | "duck"
  | "drum"
  | "egg"
  | "elephant"
  | "envelope"
  | "fish"
  | "frog"
  | "flower"
  | "grapes"
  | "goat"
  | "guitar"
  | "hat"
  | "house"
  | "horse"
  | "ice-cream"
  | "igloo"
  | "insect"
  | "juice"
  | "jelly"
  | "jacket"
  | "kite"
  | "key"
  | "king"
  | "lion"
  | "leaf"
  | "lamp"
  | "moon"
  | "mouse"
  | "milk"
  | "nest"
  | "nose"
  | "nut"
  | "orange"
  | "owl"
  | "octopus"
  | "panda"
  | "pig"
  | "pencil"
  | "queen"
  | "quilt"
  | "question"
  | "rainbow"
  | "rocket"
  | "robot"
  | "sun"
  | "star"
  | "snake"
  | "turtle"
  | "tree"
  | "train"
  | "umbrella"
  | "unicorn"
  | "ukulele"
  | "van"
  | "violin"
  | "volcano"
  | "whale"
  | "watch"
  | "wagon"
  | "xylophone"
  | "x-ray"
  | "x-marks"
  | "yo-yo"
  | "yarn"
  | "yacht"
  | "zebra"
  | "zoo"
  | "zipper"
  | "stop-sign"
  | "pause"
  | "wink"
  | "breath"
  | "list"
  | "curve"
  | "dot"
  | "bullseye"
  | "fullstop"
  | "path"
  | "slide"
  | "divide"
  | "jump"
  | "space-cloud"
  | "gap";

export type LetterAssociation = {
  word: string;
  art: LetterArtId;
  motion: "swim" | "bounce" | "float" | "pulse" | "wiggle";
};

/** Space + punctuation keys taught in later home-row lessons. */
export const PUNCTUATION_ASSOCIATIONS: Record<string, readonly LetterAssociation[]> = {
  " ": [
    { word: "Jump", art: "jump", motion: "bounce" },
    { word: "Cloud", art: "space-cloud", motion: "float" },
    { word: "Gap", art: "gap", motion: "pulse" },
  ],
  ";": [
    { word: "Stop", art: "stop-sign", motion: "bounce" },
    { word: "Pause", art: "pause", motion: "pulse" },
    { word: "Wink", art: "wink", motion: "wiggle" },
  ],
  ",": [
    { word: "Breath", art: "breath", motion: "float" },
    { word: "List", art: "list", motion: "bounce" },
    { word: "Curve", art: "curve", motion: "wiggle" },
  ],
  ".": [
    { word: "Dot", art: "dot", motion: "bounce" },
    { word: "Target", art: "bullseye", motion: "pulse" },
    { word: "Stop", art: "fullstop", motion: "bounce" },
  ],
  "/": [
    { word: "Path", art: "path", motion: "float" },
    { word: "Slide", art: "slide", motion: "wiggle" },
    { word: "Divide", art: "divide", motion: "pulse" },
  ],
};

export const LETTER_ASSOCIATIONS: Record<string, readonly LetterAssociation[]> = {
  a: [
    { word: "Apple", art: "apple", motion: "bounce" },
    { word: "Ant", art: "ant", motion: "wiggle" },
    { word: "Airplane", art: "airplane", motion: "float" },
  ],
  b: [
    { word: "Ball", art: "ball", motion: "bounce" },
    { word: "Bear", art: "bear", motion: "wiggle" },
    { word: "Bus", art: "bus", motion: "wiggle" },
  ],
  c: [
    { word: "Cat", art: "cat", motion: "wiggle" },
    { word: "Car", art: "car", motion: "wiggle" },
    { word: "Cake", art: "cake", motion: "bounce" },
  ],
  d: [
    { word: "Dog", art: "dog", motion: "wiggle" },
    { word: "Duck", art: "duck", motion: "wiggle" },
    { word: "Drum", art: "drum", motion: "pulse" },
  ],
  e: [
    { word: "Egg", art: "egg", motion: "bounce" },
    { word: "Elephant", art: "elephant", motion: "wiggle" },
    { word: "Envelope", art: "envelope", motion: "float" },
  ],
  f: [
    { word: "Fish", art: "fish", motion: "swim" },
    { word: "Frog", art: "frog", motion: "bounce" },
    { word: "Flower", art: "flower", motion: "pulse" },
  ],
  g: [
    { word: "Grapes", art: "grapes", motion: "bounce" },
    { word: "Goat", art: "goat", motion: "wiggle" },
    { word: "Guitar", art: "guitar", motion: "pulse" },
  ],
  h: [
    { word: "Hat", art: "hat", motion: "float" },
    { word: "House", art: "house", motion: "bounce" },
    { word: "Horse", art: "horse", motion: "wiggle" },
  ],
  i: [
    { word: "Ice cream", art: "ice-cream", motion: "bounce" },
    { word: "Igloo", art: "igloo", motion: "pulse" },
    { word: "Insect", art: "insect", motion: "wiggle" },
  ],
  j: [
    { word: "Juice", art: "juice", motion: "bounce" },
    { word: "Jelly", art: "jelly", motion: "wiggle" },
    { word: "Jacket", art: "jacket", motion: "float" },
  ],
  k: [
    { word: "Kite", art: "kite", motion: "float" },
    { word: "Key", art: "key", motion: "bounce" },
    { word: "King", art: "king", motion: "pulse" },
  ],
  l: [
    { word: "Lion", art: "lion", motion: "wiggle" },
    { word: "Leaf", art: "leaf", motion: "float" },
    { word: "Lamp", art: "lamp", motion: "pulse" },
  ],
  m: [
    { word: "Moon", art: "moon", motion: "float" },
    { word: "Mouse", art: "mouse", motion: "wiggle" },
    { word: "Milk", art: "milk", motion: "bounce" },
  ],
  n: [
    { word: "Nest", art: "nest", motion: "bounce" },
    { word: "Nose", art: "nose", motion: "wiggle" },
    { word: "Nut", art: "nut", motion: "bounce" },
  ],
  o: [
    { word: "Orange", art: "orange", motion: "bounce" },
    { word: "Owl", art: "owl", motion: "wiggle" },
    { word: "Octopus", art: "octopus", motion: "swim" },
  ],
  p: [
    { word: "Panda", art: "panda", motion: "wiggle" },
    { word: "Pig", art: "pig", motion: "wiggle" },
    { word: "Pencil", art: "pencil", motion: "bounce" },
  ],
  q: [
    { word: "Queen", art: "queen", motion: "float" },
    { word: "Quilt", art: "quilt", motion: "pulse" },
    { word: "Question", art: "question", motion: "bounce" },
  ],
  r: [
    { word: "Rainbow", art: "rainbow", motion: "pulse" },
    { word: "Rocket", art: "rocket", motion: "float" },
    { word: "Robot", art: "robot", motion: "wiggle" },
  ],
  s: [
    { word: "Sun", art: "sun", motion: "pulse" },
    { word: "Star", art: "star", motion: "pulse" },
    { word: "Snake", art: "snake", motion: "wiggle" },
  ],
  t: [
    { word: "Turtle", art: "turtle", motion: "wiggle" },
    { word: "Tree", art: "tree", motion: "float" },
    { word: "Train", art: "train", motion: "wiggle" },
  ],
  u: [
    { word: "Umbrella", art: "umbrella", motion: "float" },
    { word: "Unicorn", art: "unicorn", motion: "bounce" },
    { word: "Ukulele", art: "ukulele", motion: "pulse" },
  ],
  v: [
    { word: "Van", art: "van", motion: "wiggle" },
    { word: "Violin", art: "violin", motion: "wiggle" },
    { word: "Volcano", art: "volcano", motion: "pulse" },
  ],
  w: [
    { word: "Whale", art: "whale", motion: "swim" },
    { word: "Watch", art: "watch", motion: "pulse" },
    { word: "Wagon", art: "wagon", motion: "wiggle" },
  ],
  x: [
    { word: "Xylophone", art: "xylophone", motion: "bounce" },
    { word: "X-ray", art: "x-ray", motion: "pulse" },
    { word: "X marks", art: "x-marks", motion: "wiggle" },
  ],
  y: [
    { word: "Yo-yo", art: "yo-yo", motion: "bounce" },
    { word: "Yarn", art: "yarn", motion: "wiggle" },
    { word: "Yacht", art: "yacht", motion: "float" },
  ],
  z: [
    { word: "Zebra", art: "zebra", motion: "wiggle" },
    { word: "Zoo", art: "zoo", motion: "bounce" },
    { word: "Zipper", art: "zipper", motion: "wiggle" },
  ],
};

export function associationsFor(key: string): readonly LetterAssociation[] {
  if (key === " ") return PUNCTUATION_ASSOCIATIONS[" "] ?? [];
  if (key.length !== 1) return [];
  const letter = key.toLowerCase();
  if (letter >= "a" && letter <= "z") {
    return LETTER_ASSOCIATIONS[letter] ?? [];
  }
  return PUNCTUATION_ASSOCIATIONS[letter] ?? [];
}

export function associationFor(key: string): LetterAssociation | null {
  return associationsFor(key)[0] ?? null;
}
