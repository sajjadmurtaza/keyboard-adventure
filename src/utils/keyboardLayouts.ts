export type KeyboardLayoutId = "en-us" | "de-de" | "fr-fr";
export type LayoutHand = "left" | "right" | "thumbs";

export type KeyboardLayout = {
  id: KeyboardLayoutId;
  label: string;
  rows: string[][];
};

const FINGERS: { hand: "left" | "right" | "thumbs"; label: string }[] = [
  { hand: "left", label: "Left pinky" },
  { hand: "left", label: "Left ring finger" },
  { hand: "left", label: "Left middle finger" },
  { hand: "left", label: "Left index finger" },
  { hand: "left", label: "Left index finger" },
  { hand: "right", label: "Right index finger" },
  { hand: "right", label: "Right index finger" },
  { hand: "right", label: "Right middle finger" },
  { hand: "right", label: "Right ring finger" },
  { hand: "right", label: "Right pinky" },
];

export const KEYBOARD_LAYOUTS: KeyboardLayout[] = [
  {
    id: "en-us",
    label: "English",
    rows: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
      ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    ],
  },
  {
    id: "de-de",
    label: "German",
    rows: [
      ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"],
      ["y", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
    ],
  },
  {
    id: "fr-fr",
    label: "French",
    rows: [
      ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
      ["w", "x", "c", "v", "b", "n", ",", ";", ":", "!"],
    ],
  },
];

export function parseKeyboardLayout(value: unknown): KeyboardLayoutId {
  if (value === "en-us" || value === "de-de" || value === "fr-fr") return value;
  return "en-us";
}

export function keyboardLayout(id: KeyboardLayoutId): KeyboardLayout {
  return KEYBOARD_LAYOUTS.find((item) => item.id === id) ?? KEYBOARD_LAYOUTS[0]!;
}

export function keyboardRows(id: KeyboardLayoutId = "en-us"): string[][] {
  return keyboardLayout(id).rows;
}

function fingerForColumn(index: number): { hand: "left" | "right" | "thumbs"; label: string } {
  return FINGERS[Math.min(index, FINGERS.length - 1)] ?? FINGERS[FINGERS.length - 1]!;
}

export function fingerHint(
  key: string,
  layout: KeyboardLayoutId = "en-us",
): { hand: LayoutHand; label: string } {
  const k = key === " " || key.toLowerCase() === "space" ? " " : key.toLowerCase();
  if (k === " ") return { hand: "thumbs", label: "Thumbs — space bar" };
  for (const row of keyboardRows(layout)) {
    const index = row.indexOf(k);
    if (index >= 0) return fingerForColumn(index);
  }
  return { hand: "right", label: "Find this key" };
}
