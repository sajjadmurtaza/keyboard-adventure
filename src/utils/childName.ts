export const CHILD_NAME_MAX = 40;

const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019\-][\p{L}\p{M}]+)*$/u;

export function parseChildName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (trimmed.length > CHILD_NAME_MAX) return null;
  if (/[\u0000-\u001F\u007F<>{}[\]\\/@:]/.test(trimmed)) return null;
  if (/\bhttps?\b|\bwww\./i.test(trimmed)) return null;
  if (!NAME_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function isValidChildName(raw: unknown): boolean {
  return parseChildName(raw) !== null;
}
