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

export { fingerHint } from "@/utils/keyboardLayouts";
