"use client";

import { Howl, Howler } from "howler";
import type { EffectName } from "@/lib/audio/audioTypes";
import { playComplete, playMiss, playSuccess } from "@/utils/audio";

const FILES: Record<EffectName, string> = {
  correct: "/audio/effects/correct.wav",
  wrong: "/audio/effects/wrong.wav",
  star: "/audio/effects/star.wav",
  streak3: "/audio/effects/streak-3.wav",
  streak5: "/audio/effects/streak-5.wav",
  lessonComplete: "/audio/effects/lesson-complete.wav",
  unlock: "/audio/effects/unlock.wav",
  button: "/audio/effects/button.wav",
};

const RELATIVE: Record<EffectName, number> = {
  wrong: 0.35,
  correct: 0.7,
  star: 0.65,
  streak3: 0.8,
  streak5: 0.8,
  lessonComplete: 0.9,
  unlock: 0.7,
  button: 0.4,
};

const SYNTH: Partial<Record<EffectName, () => void>> = {
  correct: playSuccess,
  wrong: playMiss,
  lessonComplete: playComplete,
  star: playSuccess,
  streak3: playComplete,
  streak5: playComplete,
  unlock: playSuccess,
  button: playMiss,
};

export class SoundManager {
  private howls = new Map<EffectName, Howl>();
  private duck = 1;
  private gameSounds = true;
  private lastWrong = 0;

  constructor() {
    if (typeof window === "undefined") return;
    (Object.keys(FILES) as EffectName[]).forEach((name) => {
      this.howls.set(
        name,
        new Howl({
          src: [FILES[name]],
          volume: RELATIVE[name],
          preload: true,
        }),
      );
    });
  }

  unlock() {
    try {
      const ctx = (Howler as unknown as { ctx?: AudioContext }).ctx;
      void ctx?.resume();
    } catch {
      /* audio context may not exist yet */
    }
  }

  setMaster(volume: number) {
    Howler.volume(Math.max(0, Math.min(1, volume)));
  }

  setMuted(muted: boolean) {
    Howler.mute(muted);
  }

  setGameSounds(on: boolean) {
    this.gameSounds = on;
  }

  setDuck(amount: number) {
    this.duck = amount;
  }

  stopLong() {
    this.howls.get("lessonComplete")?.stop();
    this.howls.get("streak5")?.stop();
  }

  play(name: EffectName) {
    if (!this.gameSounds) return;
    if (name === "wrong") {
      const now = Date.now();
      if (now - this.lastWrong < 120) return;
      this.lastWrong = now;
    }
    const sound = this.howls.get(name);
    if (sound) {
      try {
        sound.volume(RELATIVE[name] * this.duck);
        const id = sound.play();
        if (id) return;
      } catch {
        /* fall through to synth */
      }
    }
    SYNTH[name]?.();
  }
}
