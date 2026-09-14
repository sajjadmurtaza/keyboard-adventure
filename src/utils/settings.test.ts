import {
  celebrationMs,
  defaultSettings,
  loadSettings,
  nextLetterSpeechDelay,
  resetSettings,
  saveSettings,
} from "@/utils/settings";
import { afterEach, describe, expect, it } from "vitest";

describe("settings", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("loads defaults and survives junk", () => {
    window.localStorage.setItem(
      "keyboard-adventure-settings-v1",
      JSON.stringify({ nameFrequency: "never", voiceURI: "abc", childName: "  Ada  " }),
    );
    expect(loadSettings().nameFrequency).toBe("never");
    expect(loadSettings().voiceURI).toBe("abc");
    expect(loadSettings().childName).toBe("Ada");
    expect(loadSettings().voicePersonality).toBe("playful");
    expect(loadSettings().sound).toBe(true);
    window.localStorage.setItem(
      "keyboard-adventure-settings-v1",
      JSON.stringify({ speechRate: 0.82 }),
    );
    expect(loadSettings().speechRate).toBe(0.95);
  });

  it("migrates missing fields", () => {
    window.localStorage.setItem(
      "keyboard-adventure-settings-v1",
      JSON.stringify({
        sound: false,
        celebrations: false,
        nameFrequency: "bogus",
        speechRate: "nope",
        voicePersonality: "calm",
        lessonPace: "steady",
        voiceURI: 12,
        childName: 9,
      }),
    );
    const loaded = loadSettings();
    expect(loaded.sound).toBe(false);
    expect(loaded.celebrationLevel).toBe("gentle");
    expect(loaded.nameFrequency).toBe("sometimes");
    expect(loaded.voicePersonality).toBe("calm");
    expect(loaded.lessonPace).toBe("steady");
    expect(loaded.voiceURI).toBe("");
    expect(loaded.childName).toBe("");
  });

  it("paces celebration from the shared success hold", () => {
    const quiet = celebrationMs({ ...defaultSettings, sound: false }, false, 1);
    const voiced = celebrationMs(defaultSettings, false, 1);
    expect(voiced).toBe(2800);
    expect(quiet).toBe(2800);
    expect(celebrationMs(defaultSettings, false, 3)).toBeGreaterThanOrEqual(3000);
    expect(celebrationMs(defaultSettings, false, 5)).toBeGreaterThanOrEqual(3200);
    expect(celebrationMs({ ...defaultSettings, reducedAnimations: true }, false, 1)).toBe(1600);
    expect(celebrationMs({ ...defaultSettings, sound: false }, true, 1)).toBe(1600);
    expect(nextLetterSpeechDelay(defaultSettings)).toBe(280);
    expect(nextLetterSpeechDelay({ ...defaultSettings, lessonPace: "steady" })).toBe(200);
  });

  it("saves and resets", () => {
    saveSettings({ ...defaultSettings, childName: "Ada" });
    expect(loadSettings().childName).toBe("Ada");
    expect(resetSettings().childName).toBe("");
    window.localStorage.setItem("keyboard-adventure-settings-v1", "{not json");
    expect(loadSettings().childName).toBe("");
  });
});
