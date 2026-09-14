"use client";

import { AUDIO_TIMING } from "@/lib/audio/audioTypes";
import type { AudioGameEvent, VoiceOption } from "@/lib/audio/audioTypes";
import { SoundManager } from "@/lib/audio/SoundManager";
import { SpeechManager } from "@/lib/audio/SpeechManager";
import {
  getLessonCompletePhrase,
  getNameTestPhrase,
  getPreviewPhrase,
  getStreakPhrase,
  getTargetInstruction,
  getWrongInstruction,
} from "@/lib/audio/speechPhrases";
import { parseChildName } from "@/utils/childName";
import { moodTone, type SpeechMood } from "@/lib/audio/voiceMoods";
import type { ParentSettings } from "@/utils/settings";
import { nextLetterSpeechDelay } from "@/utils/settings";

/**
 * Lesson audio facade. `speech` is the current SpeechProvider (browser TTS).
 * A neural TTS backend can replace SpeechManager without changing notify().
 * Howler remains responsible for success/wrong/star/celebration effects.
 */
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

  preview(voiceURI?: string) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.stopSpeech();
    this.say(getPreviewPhrase(), "high", "celebration", 0, voiceURI);
  }

  previewName() {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.stopSpeech();
    this.say(getNameTestPhrase(settings.childName), "high", "instruction", 0);
  }

  repeatTarget(key: string) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    const name = parseChildName(settings.childName) ?? undefined;
    this.say(getTargetInstruction(key, name), "high", "instruction", 0);
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
        this.scheduleTargetSpeech(event.key, event.shortened === true);
        return;
      case "TARGET_WRONG":
        this.sounds.play("wrong");
        this.maybeWrongSpeech(event.key, event.attempts);
        return;
      case "TARGET_CORRECT":
        this.bump();
        this.speech.cancel();
        this.lastTargetKey = "";
        if (event.streak !== 3 && event.streak !== 5) {
          this.sounds.play("correct");
          window.setTimeout(() => this.sounds.play("star"), 160);
          this.maybeCorrectSpeech(
            event.phrase,
            event.speakPraise,
            event.streak,
            event.teachLine,
            event.speakTeach,
          );
        }
        return;
      case "STREAK_3":
        this.sounds.play("streak3");
        this.later(() => {
          this.say(
            getStreakPhrase(3, this.celebrateName()),
            "medium",
            "streak",
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
            "streak",
            AUDIO_TIMING.streakSpeechDelay,
          );
        }, AUDIO_TIMING.streakSpeechDelay);
        return;
      case "LESSON_COMPLETE":
        this.stopSpeech();
        this.sounds.play("star");
        this.later(() => this.sounds.play("lessonComplete"), 180);
        this.later(() => {
          this.sounds.setDuck(0.45);
          this.say(getLessonCompletePhrase(this.celebrateName()), "high", "celebration", 0);
        }, 600);
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

  private scheduleTargetSpeech(key: string, shortened: boolean) {
    const settings = this.settings;
    if (!settings?.autoSpeakTarget || !settings.voiceGuidance) return;
    const gen = this.generation;
    this.later(() => {
      if (gen !== this.generation || this.lastTargetKey !== key) return;
      const name = parseChildName(settings.childName) ?? undefined;
      this.say(getTargetInstruction(key, name, { shortened }), "medium", "instruction", 400);
    }, nextLetterSpeechDelay(settings));
  }

  private maybeWrongSpeech(key: string, attempts: number) {
    const settings = this.settings;
    if (!settings?.voiceGuidance || !settings.wrongVoiceHelp) return;
    const name = parseChildName(settings.childName) ?? undefined;
    const line = getWrongInstruction(key, attempts, name);
    if (!line) return;
    this.say(line, "medium", "hint", AUDIO_TIMING.wrongSpeechCooldown);
  }

  private maybeCorrectSpeech(
    phrase: string,
    speakPraise: boolean,
    streak: number,
    teachLine?: string,
    speakTeach?: boolean,
  ) {
    const settings = this.settings;
    if (!settings?.voiceGuidance) return;
    if (streak === 3 || streak === 5) return;
    if (speakPraise && phrase) {
      this.later(() => {
        this.say(phrase, "low", "success", 900);
      }, AUDIO_TIMING.encouragementDelay);
    }
    if (speakTeach && teachLine) {
      this.later(() => {
        this.say(teachLine, "low", "success", 900);
      }, AUDIO_TIMING.associationSpeechDelay);
    }
  }

  private celebrateName(): string | undefined {
    const settings = this.settings;
    if (!settings) return undefined;
    return parseChildName(settings.childName) ?? undefined;
  }

  private say(
    text: string,
    priority: "high" | "medium" | "low",
    mood: SpeechMood,
    cooldown: number,
    voiceURI?: string,
  ) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    const tone = moodTone(mood, settings.voicePersonality, settings.speechRate);
    this.sounds.setDuck(0.5);
    const ok = this.speech.speak(text, {
      priority,
      rate: tone.rate,
      pitch: tone.pitch,
      volume: tone.volume * settings.masterVolume,
      voiceURI: voiceURI ?? settings.voiceURI,
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
