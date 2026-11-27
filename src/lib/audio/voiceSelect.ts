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

/**
 * When preferLocal is true, remote/cloud voices are excluded (privacy: child's name).
 * Ranking among local voices still prefers friendly English labels.
 */
export function voicesForPrivacy(
  voices: RankableVoice[],
  preferLocal: boolean,
): RankableVoice[] {
  if (!preferLocal) return voices;
  return voices.filter((voice) => voice.localService);
}

export function rankVoices(voices: RankableVoice[], preferLocal: boolean, locale = preferredEnglishLang()) {
  const lang = locale.toLowerCase();
  const pool = voicesForPrivacy(voices, preferLocal);
  return [...pool].sort(
    (a, b) => scoreVoice(b, lang, preferLocal) - scoreVoice(a, lang, preferLocal),
  );
}

export function pickFriendlyVoice(
  voices: RankableVoice[],
  uri: string,
  preferLocal: boolean,
): RankableVoice | null {
  const pool = voicesForPrivacy(voices, preferLocal);
  if (!pool.length) return null;
  if (uri) {
    const selected = pool.find((voice) => voice.voiceURI === uri);
    // Parent may have saved a remote URI — ignore it when preferLocal is on
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
  // Do not boost cloud/neural labels when enforcing local-only privacy
  if (!preferLocal && /enhanced|premium|neural|natural|online \(natural\)/.test(name)) {
    score += 12;
  } else if (preferLocal && /enhanced|premium/.test(name) && !/online|neural|cloud/.test(name)) {
    score += 6;
  }
  if (/\bgoogle\b/.test(name) && /us|uk|english/.test(name)) score += 6;
  if (FRIENDLY_VOICE_HINTS.some((hint) => name.includes(hint))) score += 16;
  if (/female/.test(name)) score += 10;
  if (lang.startsWith("en-us") || lang === "en_us") score += 4;
  if (/\bmale\b/.test(name) && !/female/.test(name)) score -= 8;
  if (NOVELTY_VOICE.test(name)) score -= 18;
  return score;
}
