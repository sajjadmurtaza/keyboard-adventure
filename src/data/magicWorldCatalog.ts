import type { LetterArtId } from "@/data/letterAssociations";
import {
  LETTER_ASSOCIATIONS,
  PUNCTUATION_ASSOCIATIONS,
} from "@/data/letterAssociations";
import type { LivingCelebrateStyle } from "@/data/livingScenes";
import type { MirrorEffectType } from "@/data/lessonMirrorExperiences";
import type { LessonMirrorRenderStyle } from "@/data/lessonMirrorCostumes";

/**
 * Reusable Magic Learning environments — one renderer family, many associations.
 */
export type MagicEnvironment =
  | "ocean"
  | "woodland"
  | "garden"
  | "orchard"
  | "travel"
  | "sky"
  | "space"
  | "music"
  | "royal"
  | "kitchen"
  | "playroom"
  | "pond"
  | "cozy"
  | "rain"
  | "chill"
  | "special";

export type MagicAmbient =
  | "heat"
  | "sea"
  | "pond"
  | "garden"
  | "orchard"
  | "woodland"
  | "travel"
  | "cozy"
  | "snack"
  | "rain"
  | "space"
  | "sky"
  | "chill"
  | "music"
  | "royal"
  | "playroom"
  | "special";

/** How the live face should meet this object. */
export type MagicMirrorMode =
  /** Face / body / mouth-aligned accessory (Dress-Up tracking). */
  | "wearable"
  /** Head-relative companion beside the child (not worn). */
  | "companion"
  /** Clear face + animated world / independent object. */
  | "scene";

/** Explicit correct-answer reaction family (Canvas / CSS). */
export type MagicSuccessAction =
  | "basket-catch"
  | "swim-splash"
  | "bounce-pop"
  | "bloom"
  | "launch"
  | "sip-splash"
  | "drum-beat"
  | "glow-warm"
  | "sparkle"
  | "drive-zoom"
  | "flap-hoot"
  | "dance"
  | "rain-shelter"
  | "snow-fall"
  | "royal-sparkle"
  | "note-burst"
  | "celebrate";

export type MagicWorldEntry = {
  art: LetterArtId;
  word: string;
  environment: MagicEnvironment;
  place: string;
  tint: string;
  border: string;
  celebrate: LivingCelebrateStyle;
  invite: string;
  feelLine: string;
  ambient: MagicAmbient;
  effectType: MirrorEffectType;
  mirrorMode: MagicMirrorMode;
  /** Prefer this render style when synthesizing a costume. */
  style: LessonMirrorRenderStyle;
  /** Object-specific correct-answer reaction. */
  successAction: MagicSuccessAction;
  /** Gentle incorrect-answer behavior (always encourage). */
  failAction: "encourage";
  supportsCameraOff: true;
  supportsCameraOn: true;
};

type Draft = {
  environment: MagicEnvironment;
  place: string;
  tint: string;
  border: string;
  celebrate: LivingCelebrateStyle;
  invite: string;
  feelLine: string;
  ambient: MagicAmbient;
  effectType: MirrorEffectType;
  mirrorMode: MagicMirrorMode;
  style: LessonMirrorRenderStyle;
};

const ENV: Record<
  MagicEnvironment,
  Pick<Draft, "tint" | "border" | "celebrate" | "ambient">
> = {
  ocean: {
    tint: "#D9F3FF",
    border: "#3BA7E8",
    celebrate: "bubbles",
    ambient: "sea",
  },
  woodland: {
    tint: "#E8F5DC",
    border: "#689F38",
    celebrate: "sparkles",
    ambient: "woodland",
  },
  garden: {
    tint: "#FFE4EC",
    border: "#E5395B",
    celebrate: "petals",
    ambient: "garden",
  },
  orchard: {
    tint: "#FFF3D6",
    border: "#F57C00",
    celebrate: "sparkles",
    ambient: "orchard",
  },
  travel: {
    tint: "#E8EEFF",
    border: "#5C6BC0",
    celebrate: "stars",
    ambient: "travel",
  },
  sky: {
    tint: "#E3F2FD",
    border: "#42A5F5",
    celebrate: "sparkles",
    ambient: "sky",
  },
  space: {
    tint: "#E8E4FF",
    border: "#7E57C2",
    celebrate: "stars",
    ambient: "space",
  },
  music: {
    tint: "#FFE8E4",
    border: "#E53935",
    celebrate: "stars",
    ambient: "music",
  },
  royal: {
    tint: "#FFF6D0",
    border: "#F5A623",
    celebrate: "sparkles",
    ambient: "royal",
  },
  kitchen: {
    tint: "#FFF0D6",
    border: "#FB8C00",
    celebrate: "sparkles",
    ambient: "snack",
  },
  playroom: {
    tint: "#F3E8FF",
    border: "#8E24AA",
    celebrate: "stars",
    ambient: "playroom",
  },
  pond: {
    tint: "#E8F8D8",
    border: "#7BC83C",
    celebrate: "ripples",
    ambient: "pond",
  },
  cozy: {
    tint: "#EDE4FF",
    border: "#5E35B1",
    celebrate: "stars",
    ambient: "cozy",
  },
  rain: {
    tint: "#E3F2FD",
    border: "#546E7A",
    celebrate: "bubbles",
    ambient: "rain",
  },
  chill: {
    tint: "#E0F7FA",
    border: "#00ACC1",
    celebrate: "sparkles",
    ambient: "chill",
  },
  special: {
    tint: "#F5F0FF",
    border: "#7E57C2",
    celebrate: "sparkles",
    ambient: "special",
  },
};

function world(
  environment: MagicEnvironment,
  place: string,
  feelLine: string,
  effectType: MirrorEffectType,
  mirrorMode: MagicMirrorMode = "scene",
  style: LessonMirrorRenderStyle = mirrorMode === "wearable"
    ? "head-accessory"
    : mirrorMode === "companion"
      ? "companion"
      : "scene",
  invite = "Can you find my letter?",
  ambientOverride?: MagicAmbient,
): Draft {
  const base = ENV[environment];
  return {
    environment,
    place,
    tint: base.tint,
    border: base.border,
    celebrate: base.celebrate,
    ambient: ambientOverride ?? base.ambient,
    feelLine,
    effectType,
    mirrorMode,
    style,
    invite,
  };
}

/**
 * One entry per association art id — source of truth for Magic Learning Worlds.
 * Categories overlap intentionally (environment + ambient + mode).
 */
const DRAFTS: Record<LetterArtId, Draft> = {
  // A
  apple: world("orchard", "Fruit Orchard", "Catch the falling apple!", "food-drink"),
  ant: world(
    "woodland",
    "Leaf Trail",
    "March with the busy ant!",
    "animal",
    "wearable",
    "head-accessory",
  ),
  airplane: world("sky", "Cloudy Sky", "Fly through the clouds!", "vehicle"),
  // B
  ball: world("playroom", "Playroom", "Bounce the ball!", "object"),
  bear: world(
    "woodland",
    "Forest Den",
    "Wave with the friendly bear!",
    "animal",
    "wearable",
    "face-frame",
  ),
  bus: world("travel", "City Road", "Ride along the road!", "vehicle"),
  // C
  cat: world(
    "cozy",
    "Sunny Porch",
    "Meow — soft kitty!",
    "animal",
    "wearable",
    "face-frame",
  ),
  car: world("travel", "City Road", "Drive along the road!", "vehicle"),
  cake: world("kitchen", "Party Kitchen", "Candles glow on the cake!", "food-drink"),
  // D
  dog: world(
    "playroom",
    "Puppy Park",
    "Woof — wag that tail!",
    "animal",
    "wearable",
    "face-frame",
  ),
  duck: world(
    "pond",
    "Little Pond",
    "Swim with the duck!",
    "animal",
    "wearable",
    "face-frame",
  ),
  drum: world(
    "music",
    "Music Room",
    "Boom boom — play the drum!",
    "music",
    "wearable",
    "hand-prop",
  ),
  // E
  egg: world("garden", "Nest Garden", "Watch the egg hatch!", "nature"),
  elephant: world(
    "woodland",
    "Safari Grove",
    "Wave with the elephant!",
    "animal",
    "wearable",
    "face-frame",
  ),
  envelope: world("playroom", "Mail Desk", "Open a surprise letter!", "object"),
  // F
  fish: world(
    "ocean",
    "Underwater Discovery",
    "Swim and discover fish!",
    "underwater",
    "companion",
    "companion",
  ),
  frog: world(
    "pond",
    "Little Pond",
    "Hop around the lily pads!",
    "nature",
    "wearable",
    "face-frame",
  ),
  flower: world(
    "garden",
    "Magic Garden",
    "Bloom in the garden!",
    "nature",
    "wearable",
    "face-frame",
  ),
  // G
  grapes: world("orchard", "Fruit Orchard", "Catch the juicy grapes!", "food-drink"),
  goat: world(
    "woodland",
    "Hill Farm",
    "Jump with the goat!",
    "animal",
    "wearable",
    "face-frame",
  ),
  guitar: world("music", "Music Room", "Strum the guitar!", "music"),
  // H
  hat: world(
    "cozy",
    "Hat Stand",
    "Pop the hat on your head!",
    "clothing",
    "wearable",
    "head-accessory",
  ),
  house: world("cozy", "Home Street", "Windows light up!", "object"),
  horse: world(
    "woodland",
    "Meadow Path",
    "Trot with the horse!",
    "animal",
    "wearable",
    "face-frame",
  ),
  // I
  "ice-cream": world("kitchen", "Sweet Shop", "Brrr — cold ice cream!", "food-drink"),
  igloo: world("chill", "Snowy Land", "Snow falls on the igloo!", "weather"),
  insect: world(
    "garden",
    "Bug Garden",
    "Buzz with the insect!",
    "animal",
    "wearable",
    "head-accessory",
  ),
  // J
  juice: world(
    "kitchen",
    "Sunny Snack Time",
    "Sip sip — drinking juice!",
    "food-drink",
    "wearable",
    "hand-prop",
  ),
  jelly: world("kitchen", "Wiggle Party", "Wiggle like jelly!", "food-drink"),
  jacket: world(
    "cozy",
    "Cozy Closet",
    "Zip up — you're wearing the jacket!",
    "clothing",
    "wearable",
    "body-wear",
  ),
  // K
  kite: world(
    "sky",
    "Windy Hill",
    "Fly the kite high!",
    "object",
    "companion",
    "companion",
  ),
  key: world("royal", "Treasure Door", "Open the treasure box!", "object"),
  king: world(
    "royal",
    "Royal Kingdom",
    "Wear your crown, Your Majesty!",
    "royalty",
    "wearable",
    "head-accessory",
  ),
  // L
  lion: world(
    "woodland",
    "Golden Savanna",
    "Roar with the lion!",
    "animal",
    "wearable",
    "face-frame",
  ),
  leaf: world("woodland", "Windy Grove", "Float with the leaf!", "nature"),
  lamp: world("cozy", "Reading Nook", "Light up the lamp!", "object"),
  // M
  moon: world("space", "Night Sky", "Quiet moon glow!", "space"),
  mouse: world(
    "woodland",
    "Tiny Burrow",
    "Scurry with the mouse!",
    "animal",
    "wearable",
    "face-frame",
  ),
  milk: world(
    "kitchen",
    "Sunny Snack Time",
    "Mmm — cool milk!",
    "food-drink",
    "wearable",
    "hand-prop",
  ),
  // N
  nest: world("woodland", "Tree Nest", "Baby birds in the nest!", "nature"),
  nose: world("playroom", "Silly Face Lab", "Wiggle that funny nose!", "special"),
  nut: world("woodland", "Nut Path", "Roll the nut to the squirrel!", "nature"),
  // O — quality bar
  orange: world(
    "orchard",
    "Sunny Orchard",
    "Pick oranges into the basket!",
    "food-drink",
  ),
  owl: world(
    "woodland",
    "Moonlit Woods",
    "Hoot with the wise owl!",
    "animal",
    "wearable",
    "face-frame",
  ),
  octopus: world(
    "ocean",
    "Coral Reef",
    "Wave with the octopus!",
    "underwater",
    "companion",
    "companion",
  ),
  // P
  panda: world(
    "woodland",
    "Bamboo Grove",
    "Munch bamboo with panda!",
    "animal",
    "wearable",
    "face-frame",
  ),
  pig: world(
    "woodland",
    "Muddy Farm",
    "Play in the mud!",
    "animal",
    "wearable",
    "face-frame",
  ),
  pencil: world("playroom", "Art Desk", "Draw a bright star!", "object"),
  // Q
  queen: world(
    "royal",
    "Royal Kingdom",
    "Wear your crown, Your Majesty!",
    "royalty",
    "wearable",
    "head-accessory",
  ),
  quilt: world("playroom", "Cozy Quilt Shop", "Patches come together!", "object"),
  question: world("playroom", "Wonder Room", "Ask a playful question!", "special"),
  // R
  rainbow: world("sky", "After the Rain", "Colors across the sky!", "weather"),
  rocket: world("space", "Launch Pad", "3… 2… 1… blast off!", "space"),
  robot: world(
    "playroom",
    "Robot Lab",
    "Beep boop — robot mode!",
    "object",
    "wearable",
    "face-frame",
  ),
  // S
  sun: world(
    "sky",
    "Sunny Sky",
    "Feel the warm sunshine!",
    "weather",
    "wearable",
    "head-accessory",
    "Can you find my letter?",
    "heat",
  ),
  star: world(
    "space",
    "Star Field",
    "Twinkle like a star!",
    "space",
    "wearable",
    "face-frame",
  ),
  snake: world(
    "woodland",
    "Tall Grass",
    "Slither through the grass!",
    "animal",
    "wearable",
    "head-accessory",
  ),
  // T
  turtle: world("pond", "Slow Shore", "Walk slowly with turtle!", "animal"),
  tree: world("woodland", "Growing Grove", "Watch the tree grow!", "nature"),
  train: world("travel", "Train Tracks", "Choo choo along the tracks!", "vehicle"),
  // U
  umbrella: world(
    "rain",
    "Rainy Street",
    "Stay dry in the rain!",
    "weather",
    "wearable",
    "head-accessory",
  ),
  unicorn: world(
    "royal",
    "Sparkle Meadow",
    "Magic horn and sparkles!",
    "royalty",
    "wearable",
    "face-frame",
  ),
  ukulele: world("music", "Music Room", "Strum happy notes!", "music"),
  // V
  van: world("travel", "City Road", "Travel in the van!", "vehicle"),
  violin: world("music", "Music Room", "Draw the bow across strings!", "music"),
  volcano: world("travel", "Island Peak", "Gentle cartoon lava!", "nature"),
  // W
  whale: world("ocean", "Deep Blue", "Big splash with the whale!", "underwater"),
  watch: world("playroom", "Tick-Tock Shop", "Watch hands rotate!", "object"),
  wagon: world("travel", "Country Path", "Roll along the path!", "vehicle"),
  // X
  xylophone: world("music", "Music Room", "Tap the colorful bars!", "music"),
  "x-ray": world("playroom", "Science Lab", "Peek at playful bones!", "special"),
  "x-marks": world("royal", "Treasure Island", "X marks the treasure!", "object"),
  // Y
  "yo-yo": world("playroom", "Playroom", "Yo-yo up and down!", "object"),
  yarn: world("playroom", "Craft Corner", "Unroll the yarn!", "object"),
  yacht: world("ocean", "Harbor Bay", "Sail across the water!", "vehicle"),
  // Z
  zebra: world(
    "woodland",
    "Savanna Trail",
    "Trot with the zebra!",
    "animal",
    "wearable",
    "face-frame",
  ),
  zoo: world("woodland", "Friendly Zoo", "Meet animal friends!", "animal"),
  zipper: world("playroom", "Surprise Pocket", "Zip open a surprise!", "object"),
  // Special keys
  jump: world("playroom", "Jump Jungle", "Jump up high!", "special", "scene", "scene", "Can you find my key?"),
  "space-cloud": world("sky", "Sky Gap", "Float on a soft cloud!", "special", "scene", "scene", "Can you find my key?"),
  gap: world("special", "Open Space", "A bridge appears!", "special", "scene", "scene", "Can you find my key?"),
  "stop-sign": world("travel", "Pause Plaza", "Stop at the sign!", "special", "scene", "scene", "Can you find my key?"),
  pause: world("special", "Quiet Corner", "Pause for a moment!", "special", "scene", "scene", "Can you find my key?"),
  wink: world("playroom", "Smile Street", "Wink and smile!", "special", "scene", "scene", "Can you find my key?"),
  breath: world("sky", "Breeze Bridge", "Gentle floating bubbles!", "special", "scene", "scene", "Can you find my key?"),
  list: world("playroom", "List Lane", "Check things off!", "special", "scene", "scene", "Can you find my key?"),
  curve: world("special", "Comma Curve", "Follow the curved path!", "special", "scene", "scene", "Can you find my key?"),
  dot: world("playroom", "Dot Dock", "Bounce the little dot!", "special", "scene", "scene", "Can you find my key?"),
  bullseye: world("playroom", "Target Town", "Hit the star target!", "special", "scene", "scene", "Can you find my key?"),
  fullstop: world("travel", "End Station", "The vehicle stops!", "special", "scene", "scene", "Can you find my key?"),
  path: world("travel", "Trail Top", "Travel along the path!", "special", "scene", "scene", "Can you find my key?"),
  slide: world("playroom", "Slide Slope", "Whoosh down the slide!", "special", "scene", "scene", "Can you find my key?"),
  divide: world("special", "Split Spot", "Objects gently separate!", "special", "scene", "scene", "Can you find my key?"),
};

const WORD_BY_ART: Partial<Record<LetterArtId, string>> = (() => {
  const map: Partial<Record<LetterArtId, string>> = {};
  for (const items of [
    ...Object.values(LETTER_ASSOCIATIONS),
    ...Object.values(PUNCTUATION_ASSOCIATIONS),
  ]) {
    for (const item of items) {
      map[item.art] = item.word;
    }
  }
  return map;
})();

function wordForArt(art: LetterArtId): string {
  return WORD_BY_ART[art] ?? art;
}

function successActionFor(
  art: LetterArtId,
  draft: Draft,
): MagicSuccessAction {
  switch (art) {
    case "orange":
    case "apple":
    case "grapes":
      return "basket-catch";
    case "octopus":
    case "fish":
    case "whale":
    case "yacht":
    case "duck":
      return "swim-splash";
    case "owl":
      return "flap-hoot";
    case "sun":
      return "glow-warm";
    case "rocket":
    case "airplane":
    case "kite":
      return "launch";
    case "juice":
    case "milk":
    case "ice-cream":
      return "sip-splash";
    case "drum":
    case "guitar":
    case "ukulele":
    case "violin":
    case "xylophone":
      return "note-burst";
    case "flower":
      return "bloom";
    case "umbrella":
      return "rain-shelter";
    case "igloo":
      return "snow-fall";
    case "king":
    case "queen":
    case "unicorn":
      return "royal-sparkle";
    case "car":
    case "bus":
    case "train":
    case "van":
    case "wagon":
      return "drive-zoom";
    case "ball":
    case "yo-yo":
    case "dot":
      return "bounce-pop";
    case "jelly":
      return "dance";
    case "moon":
    case "star":
    case "rainbow":
    case "space-cloud":
      return "launch";
    case "cake":
      return "sip-splash";
    default:
      void draft;
      return "celebrate";
  }
}

function buildCatalog(): Record<LetterArtId, MagicWorldEntry> {
  const out = {} as Record<LetterArtId, MagicWorldEntry>;
  for (const [art, draft] of Object.entries(DRAFTS) as [LetterArtId, Draft][]) {
    out[art] = {
      art,
      word: wordForArt(art),
      environment: draft.environment,
      place: draft.place,
      tint: draft.tint,
      border: draft.border,
      celebrate: draft.celebrate,
      invite: draft.invite,
      feelLine: draft.feelLine,
      ambient: draft.ambient,
      effectType: draft.effectType,
      mirrorMode: draft.mirrorMode,
      style: draft.style,
      successAction: successActionFor(art, draft),
      failAction: "encourage",
      supportsCameraOff: true,
      supportsCameraOn: true,
    };
  }
  return out;
}

export const MAGIC_WORLD_CATALOG = buildCatalog();

export function magicWorldForArt(
  art: LetterArtId | undefined,
): MagicWorldEntry | null {
  if (!art) return null;
  return MAGIC_WORLD_CATALOG[art] ?? null;
}

/** Every association art id from the curriculum. */
export function allAssociationArtIds(): LetterArtId[] {
  const ids = new Set<LetterArtId>();
  for (const items of Object.values(LETTER_ASSOCIATIONS)) {
    for (const item of items) ids.add(item.art);
  }
  for (const items of Object.values(PUNCTUATION_ASSOCIATIONS)) {
    for (const item of items) ids.add(item.art);
  }
  return [...ids].sort();
}
