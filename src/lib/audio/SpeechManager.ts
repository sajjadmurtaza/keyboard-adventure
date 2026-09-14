"use client";

import type { SpeechPriority, VoiceOption } from "@/lib/audio/audioTypes";

type SpeakOptions = {
  priority: SpeechPriority;
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
  preferLocal: boolean;
  generation: number;
};

export class SpeechManager {
  private voices: SpeechSynthesisVoice[] = [];
  private lastSpokeAt = 0;
  private listeners: Array<(voices: VoiceOption[]) => void> = [];
  private onVoices: (() => void) | null = null;

  available(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  start(onChange: (voices: VoiceOption[]) => void) {
    this.listeners.push(onChange);
    if (!this.available()) {
      onChange([]);
      return;
    }
    this.refreshVoices();
    this.onVoices = () => this.refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", this.onVoices);
  }

  stop() {
    this.listeners = [];
    if (this.onVoices && this.available()) {
      window.speechSynthesis.removeEventListener("voiceschanged", this.onVoices);
    }
    this.onVoices = null;
    this.cancel();
  }

  list(): VoiceOption[] {
    return rankVoices(this.voices, true).map((voice) => ({
      uri: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      local: voice.localService,
    }));
  }

  cancel() {
    if (!this.available()) return;
    window.speechSynthesis.cancel();
  }

  speak(text: string, options: SpeakOptions, cooldownMs = 0): boolean {
    if (!this.available() || !text.trim()) return false;
    const now = Date.now();
    if (options.priority !== "high" && now - this.lastSpokeAt < cooldownMs) {
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripForSpeech(text));
    utterance.rate = options.rate;
    utterance.pitch = Math.min(1.25, Math.max(1, options.pitch));
    utterance.volume = Math.max(0, Math.min(1, options.volume));
    const voice = this.pickVoice(options.voiceURI, options.preferLocal);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? preferredEnglishLang();
    this.lastSpokeAt = now;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  private refreshVoices() {
    if (!this.available()) return;
    this.voices = window.speechSynthesis.getVoices();
    const listed = this.list();
    for (const listener of this.listeners) listener(listed);
  }

  private pickVoice(uri: string, preferLocal: boolean): SpeechSynthesisVoice | null {
    if (!this.voices.length) return null;
    const selected = uri ? this.voices.find((voice) => voice.voiceURI === uri) : null;
    if (selected) return selected;
    return rankVoices(this.voices, preferLocal)[0] ?? null;
  }
}

function preferredEnglishLang() {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  return /^en/i.test(locale) ? locale : "en-US";
}

function stripForSpeech(text: string) {
  return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}

function rankVoices(voices: SpeechSynthesisVoice[], preferLocal: boolean) {
  const locale = preferredEnglishLang().toLowerCase();
  return [...voices].sort((a, b) => scoreVoice(b, locale, preferLocal) - scoreVoice(a, locale, preferLocal));
}

function scoreVoice(voice: SpeechSynthesisVoice, locale: string, preferLocal: boolean) {
  let score = 0;
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  if (lang.startsWith("en")) score += 12;
  if (lang === locale || lang.startsWith(locale.split("-")[0] ?? "en")) score += 6;
  if (lang === locale) score += 4;
  if (preferLocal && voice.localService) score += 8;
  if (/enhanced|premium|neural|natural|online \(natural\)|google/.test(name)) score += 4;
  if (/compact|eloquence|novelty|whisper|zarvox|bad news|good news|boing|bubbles|cellos/.test(name)) {
    score -= 10;
  }
  return score;
}
