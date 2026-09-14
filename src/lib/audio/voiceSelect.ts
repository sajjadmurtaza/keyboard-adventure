export type RankableVoice = {
  name: string;
  lang: string;
  localService: boolean;
  voiceURI: string;
};

export const FRIENDLY_VOICE_HINTS = [
  "samantha",
  "ava",
  "allison",
  "susan",
  "zira",
  "sonia",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "victoria",
  "kate",
  "nicky",
  "google uk english female",
  "microsoft zira",
  "microsoft aria",
  "microsoft jenny",
] as const;

const NOVELTY_VOICE = /compact|eloquence|novelty|whisper|zarvox|bad news|good news|boing|bubbles|cellos|bells|trinoids/;

export function preferredEnglishLang(locale = typeof navigator !== "undefined" ? navigator.language : "en-US") {
  return /^en/i.test(locale) ? locale : "en-US";
}

export function rankVoices(voices: RankableVoice[], preferLocal: boolean, locale = preferredEnglishLang()) {
  const lang = locale.toLowerCase();
  return [...voices].sort(
    (a, b) => scoreVoice(b, lang, preferLocal) - scoreVoice(a, lang, preferLocal),
  );
}

export function pickFriendlyVoice(
  voices: RankableVoice[],
  uri: string,
  preferLocal: boolean,
): RankableVoice | null {
  if (!voices.length) return null;
  if (uri) {
    const selected = voices.find((voice) => voice.voiceURI === uri);
    if (selected) return selected;
  }
  return rankVoices(voices, preferLocal)[0] ?? null;
}

export function scoreVoice(voice: RankableVoice, locale: string, preferLocal: boolean) {
  let score = 0;
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  if (lang.startsWith("en")) score += 12;
  if (lang === locale) score += 6;
  else if (lang.startsWith("en")) score += 3;
  if (preferLocal && voice.localService) score += 8;
  if (/enhanced|premium|neural|natural|online \(natural\)|google/.test(name)) score += 4;
  if (FRIENDLY_VOICE_HINTS.some((hint) => name.includes(hint))) score += 16;
  if (/female/.test(name)) score += 10;
  if (/\bmale\b/.test(name) && !/female/.test(name)) score -= 8;
  if (NOVELTY_VOICE.test(name)) score -= 10;
  return score;
}
