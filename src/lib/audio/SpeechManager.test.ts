import { afterEach, describe, expect, it, vi } from "vitest";
import { SpeechManager } from "@/lib/audio/SpeechManager";

function mockSpeech(voices: Array<Partial<SpeechSynthesisVoice> & { name: string; localService: boolean }>) {
  const speak = vi.fn();
  const cancel = vi.fn();
  const list = voices.map((v) => ({
    default: false,
    lang: "en-US",
    localService: v.localService,
    name: v.name,
    voiceURI: v.voiceURI ?? v.name,
    ...v,
  })) as SpeechSynthesisVoice[];

  class FakeUtterance {
    text: string;
    rate = 1;
    pitch = 1;
    volume = 1;
    lang = "";
    voice: SpeechSynthesisVoice | null = null;
    onend: ((ev: Event) => void) | null = null;
    onerror: ((ev: Event) => void) | null = null;
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
      getVoices: () => list,
      speak,
      cancel,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
  return { speak, cancel, list };
}

describe("SpeechManager local-only privacy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stays silent when preferLocal and no local voice exists", () => {
    const { speak } = mockSpeech([
      { name: "Cloud Neural", localService: false, voiceURI: "cloud" },
    ]);
    const mgr = new SpeechManager();
    mgr.start(() => undefined);
    const ok = mgr.speak("Hello Fatima", {
      priority: "high",
      rate: 1,
      pitch: 1,
      volume: 1,
      voiceURI: "cloud",
      preferLocal: true,
      generation: 1,
    });
    expect(ok).toBe(false);
    expect(speak).not.toHaveBeenCalled();
  });

  it("speaks with a local voice when preferLocal is on", () => {
    const { speak } = mockSpeech([
      { name: "Cloud Neural", localService: false, voiceURI: "cloud" },
      { name: "Samantha", localService: true, voiceURI: "local-sam" },
    ]);
    const mgr = new SpeechManager();
    mgr.start(() => undefined);
    const ok = mgr.speak("Hello Fatima", {
      priority: "high",
      rate: 1,
      pitch: 1,
      volume: 1,
      voiceURI: "cloud",
      preferLocal: true,
      generation: 1,
    });
    expect(ok).toBe(true);
    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0]?.[0] as SpeechSynthesisUtterance;
    expect(utterance.voice?.voiceURI).toBe("local-sam");
  });
});
