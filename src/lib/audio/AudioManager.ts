"use client";

import { AUDIO_TIMING } from "@/lib/audio/audioTypes";
import type { AudioGameEvent, VoiceOption } from "@/lib/audio/audioTypes";
import { SoundManager } from "@/lib/audio/SoundManager";
import { SpeechManager } from "@/lib/audio/SpeechManager";
import {
  ASSOCIATION_PAUSE_MS,
  ASSOCIATION_STEP_MS,
  getLessonCompletePhrase,
  getNameTestPhrase,
  getPreviewPhrase,
  getStreakPhrase,
  getTargetTourLines,
  getWrongInstruction,
} from "@/lib/audio/speechPhrases";
import { associationsFor } from "@/data/letterAssociations";
import { parseChildName } from "@/utils/childName";
import { moodTone, type SpeechMood } from "@/lib/audio/voiceMoods";
import type { ParentSettings } from "@/utils/settings";
import { nextLetterSpeechDelay } from "@/utils/settings";

type AssociationStep = { key: string; index: number };

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
  private assocStep: AssociationStep = { key: "", index: 0 };
  private assocListeners = new Set<() => void>();

  subscribeAssociation = (listener: () => void) => {
    this.assocListeners.add(listener);
    return () => {
      this.assocListeners.delete(listener);
    };
  };

  getAssociation = (): AssociationStep => this.assocStep;

  configure(settings: ParentSettings) {
    this.settings = settings;
    const muted = !settings.sound;
    this.sounds.setMuted(muted);
    this.sounds.setGameSounds(settings.gameSounds);
    this.sounds.setMaster(settings.masterVolume);
    if (muted) this.speech.cancel();
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
    this.say("high", "celebration", 0, getPreviewPhrase(), undefined, voiceURI);
  }

  previewName() {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.stopSpeech();
    this.say("high", "instruction", 0, getNameTestPhrase(settings.childName));
  }

  repeatTarget(key: string) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) return;
    this.bump();
    this.speech.cancel();
    this.runTour(key, { speak: true, prompt: true, delay: 0 });
  }

  notify(event: AudioGameEvent) {
    const settings = this.settings;

    if (event.type === "TARGET_SHOWN") {
      this.lastTargetKey = event.key;
      this.bump();
      this.speech.cancel();
      const speak = Boolean(
        settings?.sound && settings.voiceGuidance && settings.autoSpeakTarget,
      );
      this.runTour(event.key, {
        speak,
        prompt: true,
        shortened: event.shortened === true,
        delay: settings ? nextLetterSpeechDelay(settings) : 280,
      });
      return;
    }

    if (event.type === "TARGET_WRONG") {
      this.haltTour();
      if (!settings?.sound) return;
      this.sounds.play("wrong");
      this.maybeWrongSpeech(event.key, event.attempts);
      return;
    }

    if (event.type === "TARGET_CORRECT") {
      this.haltTour(event.key);
      this.lastTargetKey = "";
      if (!settings?.sound) return;
      if (event.streak !== 3 && event.streak !== 5) {
        this.sounds.play("correct");
        window.setTimeout(() => this.sounds.play("star"), 160);
        this.maybeCorrectSpeech(event.phrase, event.speakPraise, event.streak);
      }
      return;
    }

    if (!settings?.sound) return;

    switch (event.type) {
      case "BUTTON_TAP":
        this.sounds.play("button");
        return;
      case "LESSON_UNLOCKED":
        this.sounds.play("unlock");
        return;
      case "STREAK_3":
        this.sounds.play("streak3");
        this.later(() => {
          this.say(
            "medium",
            "streak",
            AUDIO_TIMING.streakSpeechDelay,
            getStreakPhrase(3, this.celebrateName()),
          );
        }, AUDIO_TIMING.streakSpeechDelay);
        return;
      case "STREAK_5":
        this.sounds.play("streak5");
        this.later(() => {
          this.say(
            "medium",
            "streak",
            AUDIO_TIMING.streakSpeechDelay,
            getStreakPhrase(5, this.celebrateName()),
          );
        }, AUDIO_TIMING.streakSpeechDelay);
        return;
      case "LESSON_COMPLETE":
        this.stopSpeech();
        this.sounds.play("star");
        this.later(() => this.sounds.play("lessonComplete"), 180);
        this.later(() => {
          this.sounds.setDuck(0.45);
          this.say("high", "celebration", 0, getLessonCompletePhrase(this.celebrateName()));
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

  private runTour(
    key: string,
    options: { speak: boolean; prompt: boolean; shortened?: boolean; delay: number },
  ) {
    const settings = this.settings;
    const name = parseChildName(settings?.childName ?? "") ?? undefined;
    const lines = getTargetTourLines(key, name, {
      shortened: options.shortened,
      prompt: options.prompt,
    });
    const items = associationsFor(key);
    const gen = this.generation;
    const stepMs = ASSOCIATION_STEP_MS;

    const play = (i: number) => {
      if (gen !== this.generation) return;
      const text = lines[i];
      if (!text) return;
      this.setAssoc(key, Math.min(i, Math.max(0, items.length - 1)));
      const next = () => {
        if (gen !== this.generation) return;
        if (!options.speak) {
          play(i + 1);
          return;
        }
        this.later(() => play(i + 1), ASSOCIATION_PAUSE_MS);
      };
      if (!options.speak) {
        this.later(next, stepMs);
        return;
      }
      this.say("high", "instruction", 0, text, next);
    };

    this.setAssoc(key, 0);
    this.later(() => play(0), options.delay);
  }

  private maybeWrongSpeech(key: string, attempts: number) {
    const settings = this.settings;
    if (!settings?.voiceGuidance || !settings.wrongVoiceHelp) return;
    const name = parseChildName(settings.childName) ?? undefined;
    const line = getWrongInstruction(key, attempts, name);
    if (!line) return;
    this.say("high", "hint", 0, line);
  }

  private haltTour(pictureKey?: string) {
    this.bump();
    this.speech.cancel();
    if (pictureKey) this.setAssoc(pictureKey, 0);
  }

  private maybeCorrectSpeech(phrase: string, speakPraise: boolean, streak: number) {
    const settings = this.settings;
    if (!settings?.voiceGuidance) return;
    if (streak === 3 || streak === 5) return;
    if (speakPraise && phrase) {
      this.later(() => {
        this.say("high", "success", 0, phrase);
      }, AUDIO_TIMING.encouragementDelay);
    }
  }

  private celebrateName(): string | undefined {
    const settings = this.settings;
    if (!settings) return undefined;
    return parseChildName(settings.childName) ?? undefined;
  }

  private say(
    priority: "high" | "medium" | "low",
    mood: SpeechMood,
    cooldown: number,
    text: string,
    onEnd?: () => void,
    voiceURI?: string,
  ) {
    const settings = this.settings;
    if (!settings?.sound || !settings.voiceGuidance) {
      onEnd?.();
      return;
    }
    const gen = this.generation;
    let settled = false;
    const finish = () => {
      if (settled || gen !== this.generation) return;
      settled = true;
      onEnd?.();
    };
    const tone = moodTone(mood, settings.voicePersonality, settings.speechRate);
    this.sounds.setDuck(0.5);
    const ok = this.speech.speak(
      text,
      {
        priority,
        rate: tone.rate,
        pitch: tone.pitch,
        volume: tone.volume * settings.masterVolume,
        voiceURI: voiceURI ?? settings.voiceURI,
        preferLocal: settings.preferLocalVoice,
        generation: this.generation,
      },
      cooldown,
      finish,
    );
    if (!ok) {
      this.sounds.setDuck(1);
      this.later(finish, 400);
      return;
    }
    this.later(() => this.sounds.setDuck(1), Math.max(900, text.length * 60));
    this.later(finish, Math.max(ASSOCIATION_STEP_MS, text.length * 90));
  }

  private setAssoc(key: string, index: number) {
    this.assocStep = { key, index };
    for (const listener of this.assocListeners) listener();
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
