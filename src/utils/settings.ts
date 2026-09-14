const SETTINGS_KEY = "keyboard-adventure-settings-v1";

export type Difficulty = "beginner" | "growing" | "practice";

export type ParentSettings = {
  sound: boolean;
  celebrations: boolean;
  questionCount: 5 | 10 | 15 | 20;
  fingerHints: boolean;
  keyboardHighlight: boolean;
  difficulty: Difficulty;
};

export const defaultSettings: ParentSettings = {
  sound: true,
  celebrations: true,
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
    return { ...defaultSettings, ...(JSON.parse(raw) as ParentSettings) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ParentSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
