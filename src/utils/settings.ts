const SETTINGS_KEY = "keyboard-adventure-settings-v1";

export type Difficulty = "beginner" | "growing" | "practice";
export type CelebrationLevel = "gentle" | "fun" | "big";

export type ParentSettings = {
  sound: boolean;
  celebrations: boolean;
  celebrationLevel: CelebrationLevel;
  reducedAnimations: boolean;
  allowReplay: boolean;
  unlockAll: boolean;
  childName: string;
  questionCount: 5 | 10 | 15 | 20;
  fingerHints: boolean;
  keyboardHighlight: boolean;
  difficulty: Difficulty;
};

export const defaultSettings: ParentSettings = {
  sound: true,
  celebrations: true,
  celebrationLevel: "fun",
  reducedAnimations: false,
  allowReplay: true,
  unlockAll: false,
  childName: "",
  questionCount: 10,
  fingerHints: true,
  keyboardHighlight: true,
  difficulty: "beginner",
};

export function loadSettings(): ParentSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<ParentSettings> & {
      celebrations?: boolean;
    };
    const celebrationLevel =
      parsed.celebrationLevel ??
      (parsed.celebrations === false ? "gentle" : "fun");
    return {
      ...defaultSettings,
      ...parsed,
      celebrationLevel,
      childName: typeof parsed.childName === "string" ? parsed.childName.trim() : "",
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ParentSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function celebrationMs(
  settings: ParentSettings,
  reducedMotion: boolean,
): number {
  if (reducedMotion || settings.reducedAnimations) return 280;
  if (settings.celebrationLevel === "gentle") return 450;
  if (settings.celebrationLevel === "big") return 900;
  return 750;
}
