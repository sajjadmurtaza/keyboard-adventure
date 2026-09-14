const IGNORED_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Escape",
  "Tab",
  "Enter",
  "Backspace",
  "Delete",
  "Insert",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ContextMenu",
  "NumLock",
  "ScrollLock",
  "Pause",
  "PrintScreen",
]);

export function isIgnoredKey(event: KeyboardEvent): boolean {
  if (event.repeat) return true;
  if (event.ctrlKey || event.altKey || event.metaKey) return true;
  if (IGNORED_KEYS.has(event.key)) return true;
  if (/^F\d{1,2}$/.test(event.key)) return true;
  return false;
}

export function normalizeTarget(key: string): string {
  if (key === " " || key.toLowerCase() === "space") return " ";
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
}

export function eventToKey(event: KeyboardEvent): string | null {
  if (isIgnoredKey(event)) return null;
  if (event.key === " ") return " ";
  if (event.key.length !== 1) return null;
  return event.key.toLowerCase();
}

export function typedCharFromText(value: string): string | null {
  if (!value) return null;
  const last = [...value].at(-1);
  if (!last || last === "\n" || last === "\r") return null;
  return normalizeTarget(last);
}

export function keysMatch(pressed: string, target: string): boolean {
  return normalizeTarget(pressed) === normalizeTarget(target);
}

export function displayKey(key: string): string {
  const normalized = normalizeTarget(key);
  if (normalized === " ") return "SPACE";
  return normalized.toUpperCase();
}

export function tinyHint(key: string): string | null {
  const k = normalizeTarget(key);
  if (k === ";") return "Semicolon";
  if (k === ",") return "Comma";
  if (k === ".") return "Period";
  if (k === "/") return "Slash";
  return null;
}

export function instructionFor(key: string): string {
  const normalized = normalizeTarget(key);
  if (normalized === " ") return "Press the space bar";
  return `Press the ${displayKey(normalized)} key`;
}

export type Hand = "left" | "right" | "thumbs";

export function fingerHint(key: string): { hand: Hand; label: string } {
  const k = normalizeTarget(key);
  if (k === " ") return { hand: "thumbs", label: "Thumbs — space bar" };

  const left: Record<string, string> = {
    q: "Left pinky",
    a: "Left pinky",
    z: "Left pinky",
    w: "Left ring finger",
    s: "Left ring finger",
    x: "Left ring finger",
    e: "Left middle finger",
    d: "Left middle finger",
    c: "Left middle finger",
    r: "Left index finger",
    f: "Left index finger",
    v: "Left index finger",
    t: "Left index finger",
    g: "Left index finger",
    b: "Left index finger",
  };

  const right: Record<string, string> = {
    p: "Right pinky",
    ";": "Right pinky",
    "/": "Right pinky",
    o: "Right ring finger",
    l: "Right ring finger",
    ".": "Right ring finger",
    i: "Right middle finger",
    k: "Right middle finger",
    ",": "Right middle finger",
    u: "Right index finger",
    j: "Right index finger",
    m: "Right index finger",
    y: "Right index finger",
    h: "Right index finger",
    n: "Right index finger",
  };

  if (left[k]) return { hand: "left", label: left[k] };
  if (right[k]) return { hand: "right", label: right[k] };
  return { hand: "right", label: "Find this key" };
}

export const KEYBOARD_ROWS: string[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];
