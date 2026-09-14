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
    return this.voices.map((voice) => ({
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate;
    utterance.pitch = options.pitch;
    utterance.volume = Math.max(0, Math.min(1, options.volume));
    const voice = this.pickVoice(options.voiceURI, options.preferLocal);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    const generation = options.generation;
    utterance.onend = () => {
      if (generation !== options.generation) return;
    };
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
    const english = this.voices.filter((voice) => /^en(-|$)/i.test(voice.lang));
    const pool = english.length ? english : this.voices;
    const selected = uri ? this.voices.find((voice) => voice.voiceURI === uri) : null;
    if (selected) return selected;
    if (preferLocal) {
      const local = pool.find((voice) => voice.localService);
      if (local) return local;
    }
    return pool[0] ?? null;
  }
}
