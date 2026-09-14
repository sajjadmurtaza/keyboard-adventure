import { associationFor } from "@/data/letterAssociations";
import { pickFreshItem } from "@/lib/random";
import { parseChildName } from "@/utils/childName";
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

function namedPraise(letter: string, name: string): string | null {
  const lines: Record<string, string> = {
    a: `Amazing job, ${name}!`,
    b: `Brilliant, ${name}!`,
    c: `Cool work, ${name}!`,
    d: `Doing great, ${name}!`,
    e: `Excellent, ${name}!`,
    f: `Fantastic job, ${name}!`,
    g: `Great work, ${name}!`,
    h: `Hooray, ${name}!`,
    i: `Impressive, ${name}!`,
    j: `Just right, ${name}!`,
    k: `Keep it up, ${name}!`,
    l: `Lovely work, ${name}!`,
    m: `Marvelous, ${name}!`,
    n: `Nice work, ${name}!`,
    o: `Outstanding, ${name}!`,
    p: `Perfect, ${name}!`,
    r: `Remarkable, ${name}!`,
    s: `Super, ${name}!`,
    t: `Terrific, ${name}!`,
    v: `Very good, ${name}!`,
    w: `Wonderful, ${name}!`,
    y: `Yes! You got it, ${name}!`,
  };
  return lines[letter] ?? `You got it, ${name}!`;
}

export function getSuccessPraise(
  key: string,
  options: { firstLook: boolean; streak: number; random?: Rng; name?: string },
): SuccessPraise {
  const rng = options.random ?? Math.random;
  const letter = normalizeTarget(key);
  const who = parseChildName(options.name ?? "") ?? "";
  if (letter === " ") {
    const spoken = who
      ? `Great work, ${who}!`
      : pickFresh(["Great! That's the space bar!", "You found the space bar!"], rng);
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
  const spoken = who ? namedPraise(letter, who) ?? short : short;
  const milestone = options.streak === 3 || options.streak === 5;
  const assoc = associationFor(letter);
  const teachLine = assoc ? `${letter.toUpperCase()} is for ${assoc.word}!` : undefined;
  const speakTeach = Boolean(
    !who && teachLine && !milestone && (options.firstLook || rng() < 0.35),
  );

  return {
    banner: bannerFrom(short),
    spoken,
    speak: !milestone,
    showObject: Boolean(assoc),
    teachLine,
    speakTeach,
  };
}
