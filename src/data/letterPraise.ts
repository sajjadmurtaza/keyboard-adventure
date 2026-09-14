import { associationFor } from "@/data/letterAssociations";
import { pickFreshItem } from "@/lib/random";
import { normalizeTarget } from "@/utils/keys";

export const LETTER_PRAISE: Record<string, string[]> = {
  a: ["Amazing!", "Awesome job!"],
  b: ["Brilliant!", "Beautiful work!"],
  c: ["Cool! You got it!", "Clever typing!"],
  d: ["Doing great!", "Dazzling work!"],
  e: ["Excellent!", "Excellent typing!"],
  f: ["Fantastic!", "Fantastic job!"],
  g: ["Great work!", "Great job!"],
  h: ["Hooray! You got it!"],
  i: ["Impressive!"],
  j: ["Just right!"],
  k: ["Keep it up!"],
  l: ["Lovely!", "Lovely typing!"],
  m: ["Magnificent!", "Marvelous!"],
  n: ["Nice work!", "Nicely done!"],
  o: ["Outstanding!"],
  p: ["Perfect!", "Perfect typing!"],
  q: ["Quick thinking!", "Quite amazing!"],
  r: ["Remarkable!", "Really great!"],
  s: ["Super!", "Super typing!"],
  t: ["Terrific!", "Terrific job!"],
  u: ["Unbelievable!"],
  v: ["Very good!", "Victory!"],
  w: ["Wonderful!", "Wonderful work!"],
  x: ["Extra awesome!"],
  y: ["Yes! You got it!"],
  z: ["Zoom! You got it!", "Zippy work!"],
};

const FALLBACK_PRAISE = ["Great job!", "Amazing!", "You got it!", "Super!"];

let lastPraise = "";

export function resetLetterPraiseMemory() {
  lastPraise = "";
}

type Rng = () => number;

function pickFresh(options: string[], rng: Rng): string {
  const chosen = pickFreshItem(options, lastPraise, rng);
  lastPraise = chosen;
  return chosen;
}

export type SuccessPraise = {
  banner: string;
  spoken: string;
  speak: boolean;
  showObject: boolean;
  teachLine?: string;
  speakTeach: boolean;
};

function shortPraise(letter: string, rng: Rng): string {
  const pool = LETTER_PRAISE[letter] ?? FALLBACK_PRAISE;
  return pickFresh(pool, rng);
}

function bannerFrom(spoken: string): string {
  const first = spoken.split("!")[0]?.trim() ?? spoken;
  return `${first.toUpperCase()}!`;
}

export function getSuccessPraise(
  key: string,
  options: { firstLook: boolean; streak: number; random?: Rng },
): SuccessPraise {
  const rng = options.random ?? Math.random;
  const letter = normalizeTarget(key);
  if (letter === " ") {
    const spoken = pickFresh(["Great! That's the space bar!", "You found the space bar!"], rng);
    const milestone = options.streak === 3 || options.streak === 5;
    return {
      banner: "SUPER!",
      spoken,
      speak: !milestone,
      showObject: false,
      speakTeach: false,
    };
  }

  const short = shortPraise(letter, rng);
  const milestone = options.streak === 3 || options.streak === 5;
  const assoc = associationFor(letter);
  const teachLine = assoc ? `${letter.toUpperCase()} is for ${assoc.word}!` : undefined;
  const speakTeach = Boolean(
    teachLine && !milestone && (options.firstLook || rng() < 0.35),
  );

  return {
    banner: bannerFrom(short),
    spoken: short,
    speak: !milestone,
    showObject: Boolean(assoc),
    teachLine,
    speakTeach,
  };
}
