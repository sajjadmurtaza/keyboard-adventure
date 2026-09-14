"use client";

import type { SpeechPriority, VoiceOption } from "@/lib/audio/audioTypes";
import { pickFriendlyVoice, preferredEnglishLang, rankVoices } from "@/lib/audio/voiceSelect";

type SpeakOptions = {
  priority: SpeechPriority;
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
  preferLocal: boolean;
  generation: number;
};

/** Browser SpeechSynthesis backend. A neural TTS provider can implement the same speak/cancel/list surface. */
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
    utterance.rate = Math.min(1.08, Math.max(0.9, options.rate));
    utterance.pitch = Math.min(1.08, Math.max(1, options.pitch));
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
    const chosen = pickFriendlyVoice(this.voices, uri, preferLocal);
    if (!chosen) return null;
    return this.voices.find((voice) => voice.voiceURI === chosen.voiceURI) ?? null;
  }
}

function stripForSpeech(text: string) {
  return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}
