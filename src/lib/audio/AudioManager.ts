"use client";

import { AUDIO_TIMING } from "@/lib/audio/audioTypes";
import type { AudioGameEvent, VoiceOption } from "@/lib/audio/audioTypes";
import { SoundManager } from "@/lib/audio/SoundManager";
import { SpeechManager } from "@/lib/audio/SpeechManager";
import {
  getCorrectPhrase,
  getLessonCompletePhrase,
  getPreviewPhrase,
  getStreakPhrase,
  getTargetInstruction,
  getWrongInstruction,
  shouldSayName,
} from "@/lib/audio/speechPhrases";
import type { ParentSettings } from "@/utils/settings";

export class AudioManager {
  readonly speech = new SpeechManager();
  readonly sounds = new SoundManager();
  private settings: ParentSettings | null = null;
  private generation = 0;
  private timers = new Set<number>();
  private lastTargetKey = "";

  configure(settings: ParentSettings) {
    this.settings = settings;
    const muted = !settings.sound;
    this.sounds.setMuted(muted);
    this.sounds.setGameSounds(settings.gameSounds);
    this.sounds.setMaster(settings.masterVolume);
    if (muted) this.stopSpeech();
  }

  unlock() {
    this.sounds.unlock();
  }

  stopSpeech() {
    this.bump();
    this.speech.cancel();
    this.sounds.setDuck(1);
  }

  leaveScreen() {
    this.stopSpeech();
    this.sounds.stopLong();
  }

  preview() {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.stopSpeech();
    this.say(getPreviewPhrase(settings.childName.trim() || undefined), "high", 0);
  }

  repeatTarget(key: string) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.say(getTargetInstruction(key), "high", 0);
  }

  notify(event: AudioGameEvent) {
    const settings = this.settings;
    if (!settings?.sound) return;

    switch (event.type) {
      case "BUTTON_TAP":
        this.sounds.play("button");
        return;
      case "LESSON_UNLOCKED":
        this.sounds.play("unlock");
        return;
      case "TARGET_SHOWN":
        this.bump();
        this.lastTargetKey = event.key;
        this.speech.cancel();
        this.scheduleTargetSpeech(event.key);
        return;
      case "TARGET_WRONG":
        this.sounds.play("wrong");
        this.maybeWrongSpeech(event.key, event.attempts);
        return;
      case "TARGET_CORRECT":
        if (event.streak !== 3 && event.streak !== 5) {
          this.sounds.play("correct");
          window.setTimeout(() => this.sounds.play("star"), 160);
          this.maybeCorrectSpeech(event.streak);
        }
        return;
      case "STREAK_3":
        this.sounds.play("streak3");
        this.later(() => {
          this.say(
            getStreakPhrase(3, this.celebrateName()),
            "medium",
            AUDIO_TIMING.streakSpeechDelay,
          );
        }, AUDIO_TIMING.streakSpeechDelay);
        return;
      case "STREAK_5":
        this.sounds.play("streak5");
        this.later(() => {
          this.say(
            getStreakPhrase(5, this.celebrateName()),
            "medium",
            AUDIO_TIMING.streakSpeechDelay,
          );
        }, AUDIO_TIMING.streakSpeechDelay);
        return;
      case "LESSON_COMPLETE":
        this.stopSpeech();
        this.sounds.play("lessonComplete");
        this.later(() => {
          this.say(getLessonCompletePhrase(this.celebrateName()), "high", 0);
        }, AUDIO_TIMING.lessonCompleteSpeechDelay);
        return;
      default:
        return;
    }
  }

  onVoices(listener: (voices: VoiceOption[]) => void) {
    this.speech.start(listener);
    return () => this.speech.stop();
  }

  speechAvailable() {
    return this.speech.available();
  }

  private scheduleTargetSpeech(key: string) {
    const settings = this.settings;
    if (!settings?.autoSpeakTarget || !settings.voiceGuidance) return;
    const gen = this.generation;
    this.later(() => {
      if (gen !== this.generation || this.lastTargetKey !== key) return;
      const name = shouldSayName(settings.nameFrequency, "target", settings.childName.trim())
        ? settings.childName.trim()
        : undefined;
      this.say(getTargetInstruction(key, name), "medium", 400);
    }, AUDIO_TIMING.targetSpeechDelay);
  }

  private maybeWrongSpeech(key: string, attempts: number) {
    const settings = this.settings;
    if (!settings?.voiceGuidance || !settings.wrongVoiceHelp) return;
    const line = getWrongInstruction(key, attempts);
    if (!line) return;
    this.say(line, "medium", AUDIO_TIMING.wrongSpeechCooldown);
  }

  private maybeCorrectSpeech(streak: number) {
    const settings = this.settings;
    if (!settings?.voiceGuidance) return;
    if (streak === 3 || streak === 5) return;
    if (Math.random() > 0.28) return;
    this.later(() => {
      this.say(getCorrectPhrase(this.celebrateName()), "low", 900);
    }, AUDIO_TIMING.encouragementDelay);
  }

  private celebrateName(): string | undefined {
    const settings = this.settings;
    if (!settings) return undefined;
    const name = settings.childName.trim();
    return shouldSayName(settings.nameFrequency, "celebrate", name) ? name : undefined;
  }

  private say(
    text: string,
    priority: "high" | "medium" | "low",
    cooldown: number,
  ) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.sounds.setDuck(0.5);
    const ok = this.speech.speak(text, {
      priority,
      rate: settings.speechRate,
      pitch: 1,
      volume: settings.masterVolume,
      voiceURI: settings.voiceURI,
      preferLocal: settings.preferLocalVoice,
      generation: this.generation,
    }, cooldown);
    if (!ok) this.sounds.setDuck(1);
    else {
      this.later(() => this.sounds.setDuck(1), Math.max(900, text.length * 60));
    }
  }

  private bump() {
    this.generation += 1;
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.clear();
  }

  private later(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
  }
}

let manager: AudioManager | null = null;

export function getAudioManager(): AudioManager | null {
  if (typeof window === "undefined") return null;
  manager ??= new AudioManager();
  return manager;
}
