import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManager } from "@/lib/audio/AudioManager";
import {
  ASSOCIATION_PAUSE_MS,
  ASSOCIATION_STEP_MS,
} from "@/lib/audio/speechPhrases";
import { AUDIO_TIMING } from "@/lib/audio/audioTypes";
import { defaultSettings, type ParentSettings } from "@/utils/settings";
import { nextLetterSpeechDelay } from "@/utils/settings";

vi.mock("howler", () => ({
  Howl: class {
    play() {
      return 1;
    }
    stop() {}
  },
  Howler: {
    volume() {},
    mute() {},
  },
}));

type SpokenUtterance = {
  text: string;
  onend: ((event: Event) => void) | null;
};

function installSpeech() {
  const spoken: SpokenUtterance[] = [];
  let current: SpokenUtterance | null = null;
  class FakeUtterance {
    text: string;
    rate = 1;
    pitch = 1;
    volume = 1;
    lang = "en-US";
    voice = null;
    onend: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: FakeUtterance,
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    value: FakeUtterance,
  });
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      cancel() {
        current = null;
      },
      speak(utterance: SpeechSynthesisUtterance) {
        const item: SpokenUtterance = {
          text: utterance.text,
          onend: utterance.onend,
        };
        spoken.push(item);
        current = item;
      },
      getVoices() {
        return [];
      },
      addEventListener() {},
      removeEventListener() {},
    },
  });
  return {
    spoken,
    endCurrent() {
      const item = current;
      current = null;
      item?.onend?.(new Event("end"));
    },
  };
}

function settings(overrides: Partial<ParentSettings> = {}): ParentSettings {
  return { ...defaultSettings, childName: "Ada", ...overrides };
}

function shownF(audio: AudioManager) {
  audio.notify({ type: "TARGET_SHOWN", key: "f" });
}

async function finishLine(speech: ReturnType<typeof installSpeech>) {
  speech.endCurrent();
  await vi.advanceTimersByTimeAsync(ASSOCIATION_PAUSE_MS);
}

describe("AudioManager letter tour", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("speaks every association then the type prompt, with a pause between lines", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);

    expect(speech.spoken).toEqual([]);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    expect(speech.spoken.map((item) => item.text)).toEqual(["eff is for Fish!"]);
    expect(audio.getAssociation()).toEqual({ key: "f", index: 0 });

    await finishLine(speech);
    expect(speech.spoken.map((item) => item.text)).toEqual([
      "eff is for Fish!",
      "eff is for Frog!",
    ]);
    expect(audio.getAssociation()).toEqual({ key: "f", index: 1 });

    await finishLine(speech);
    expect(speech.spoken.at(-1)?.text).toBe("eff is for Flower!");
    expect(audio.getAssociation()).toEqual({ key: "f", index: 2 });

    await finishLine(speech);
    expect(speech.spoken.at(-1)?.text).toBe("Ada, type eff.");
    expect(audio.getAssociation()).toEqual({ key: "f", index: 2 });
  });

  it("does not replay Fish/Frog/Flower after a correct key — only praise", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    await finishLine(speech);

    audio.notify({
      type: "TARGET_CORRECT",
      key: "f",
      streak: 1,
      phrase: "Fantastic!",
      speakPraise: true,
    });

    expect(audio.getAssociation()).toEqual({ key: "f", index: 0 });
    await vi.advanceTimersByTimeAsync(AUDIO_TIMING.encouragementDelay);
    expect(speech.spoken.map((item) => item.text).at(-1)).toBe("Fantastic!");

    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS * 4 + ASSOCIATION_PAUSE_MS * 4);
    const afterSuccess = speech.spoken.map((item) => item.text);
    expect(afterSuccess.filter((line) => line.includes("is for"))).toEqual([
      "eff is for Fish!",
      "eff is for Frog!",
    ]);
    expect(afterSuccess.filter((line) => line === "Fantastic!")).toHaveLength(1);
  });

  it("starts the next letter tour only after the following TARGET_SHOWN", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    audio.notify({
      type: "TARGET_CORRECT",
      key: "f",
      streak: 1,
      phrase: "Fantastic!",
      speakPraise: true,
    });
    await vi.advanceTimersByTimeAsync(AUDIO_TIMING.encouragementDelay);
    speech.endCurrent();

    audio.notify({ type: "TARGET_SHOWN", key: "j" });
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    expect(speech.spoken.at(-1)?.text).toBe("jay is for Juice!");
    expect(audio.getAssociation()).toEqual({ key: "j", index: 0 });
    expect(speech.spoken.some((item) => item.text.includes("Fish"))).toBe(true);
    expect(speech.spoken.filter((item) => item.text.includes("is for Fish"))).toHaveLength(1);
  });

  it("keeps a muted intro tour visual-only and stops it on success", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings({ sound: false }));
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings({ sound: false })));
    expect(speech.spoken).toEqual([]);
    expect(audio.getAssociation()).toEqual({ key: "f", index: 0 });

    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS);
    expect(audio.getAssociation()).toEqual({ key: "f", index: 1 });

    audio.notify({
      type: "TARGET_CORRECT",
      key: "f",
      streak: 1,
      phrase: "Fantastic!",
      speakPraise: true,
    });
    expect(audio.getAssociation()).toEqual({ key: "f", index: 0 });
    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS * 3);
    expect(audio.getAssociation()).toEqual({ key: "f", index: 0 });
    expect(speech.spoken).toEqual([]);
  });

  it("moves pictures without speech when autoSpeakTarget is off", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings({ autoSpeakTarget: false }));
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    expect(speech.spoken).toEqual([]);
    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS);
    expect(audio.getAssociation()).toEqual({ key: "f", index: 1 });
  });

  it("replays the full tour only when Repeat is pressed", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    audio.repeatTarget("f");
    await vi.advanceTimersByTimeAsync(0);
    expect(speech.spoken.at(-1)?.text).toBe("eff is for Fish!");
    await finishLine(speech);
    expect(speech.spoken.at(-1)?.text).toBe("eff is for Frog!");
  });

  it("does not start an association tour for space", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    audio.notify({ type: "TARGET_SHOWN", key: " " });
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    expect(speech.spoken.map((item) => item.text)).toEqual(["Ada, press the space bar."]);
  });

  it("stops the letter tour on a wrong key and may speak a hint", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    const duringTour = speech.spoken.length;
    audio.notify({ type: "TARGET_WRONG", key: "f", attempts: 2 });
    expect(speech.spoken.at(-1)?.text).toMatch(/Find eff/);
    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS * 2);
    expect(speech.spoken.filter((item) => item.text.includes("is for")).length).toBe(
      duringTour,
    );
  });

  it("skips praise and any letter tour on streak 3 and 5", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    audio.notify({
      type: "TARGET_CORRECT",
      key: "f",
      streak: 3,
      phrase: "Fantastic!",
      speakPraise: false,
    });
    audio.notify({ type: "STREAK_3" });
    await vi.advanceTimersByTimeAsync(AUDIO_TIMING.streakSpeechDelay + 50);
    expect(speech.spoken.some((item) => item.text === "Fantastic!")).toBe(false);
    expect(speech.spoken.filter((item) => item.text.includes("is for Fish"))).toHaveLength(1);
  });

  it("leaveScreen cancels remaining tour lines", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    audio.leaveScreen();
    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS * 4);
    expect(speech.spoken.map((item) => item.text)).toEqual(["eff is for Fish!"]);
  });

  it("voiceGuidance off still advances pictures on TARGET_SHOWN", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings({ voiceGuidance: false }));
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    expect(speech.spoken).toEqual([]);
    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS);
    expect(audio.getAssociation().index).toBe(1);
  });

  it("skips wrong-key speech on the first miss", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    shownF(audio);
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    audio.notify({ type: "TARGET_WRONG", key: "f", attempts: 1 });
    expect(speech.spoken.map((item) => item.text)).toEqual(["eff is for Fish!"]);
  });

  it("speaks a single punctuation instruction instead of a letter tour", async () => {
    const speech = installSpeech();
    const audio = new AudioManager();
    audio.configure(settings());
    audio.notify({ type: "TARGET_SHOWN", key: ";" });
    await vi.advanceTimersByTimeAsync(nextLetterSpeechDelay(settings()));
    expect(speech.spoken.map((item) => item.text)).toEqual(["Ada, type the semicolon."]);
    audio.notify({
      type: "TARGET_CORRECT",
      key: ";",
      streak: 1,
      phrase: "Super!",
      speakPraise: true,
    });
    await vi.advanceTimersByTimeAsync(AUDIO_TIMING.encouragementDelay);
    expect(speech.spoken.at(-1)?.text).toBe("Super!");
    await vi.advanceTimersByTimeAsync(ASSOCIATION_STEP_MS);
    expect(speech.spoken.filter((item) => item.text.includes("is for"))).toEqual([]);
  });
});
