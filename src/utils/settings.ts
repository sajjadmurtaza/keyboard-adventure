import { parseChildName } from "@/utils/childName";
import { successHoldMs } from "@/lib/lessonPhase";

const SETTINGS_KEY = "keyboard-adventure-settings-v1";

export type Difficulty = "beginner" | "growing" | "practice";
export type CelebrationLevel = "gentle" | "fun" | "big";

export type NameFrequency = "never" | "sometimes" | "celebrations" | "often";
export type VoicePersonality = "playful" | "calm";
export type LessonPace = "relaxed" | "steady";

export type ParentSettings = {
  sound: boolean;
  masterVolume: number;
  gameSounds: boolean;
  voiceGuidance: boolean;
  autoSpeakTarget: boolean;
  nameFrequency: NameFrequency;
  voiceURI: string;
  speechRate: number;
  voicePersonality: VoicePersonality;
  wrongVoiceHelp: boolean;
  preferLocalVoice: boolean;
  celebrations: boolean;
  celebrationLevel: CelebrationLevel;
  lessonPace: LessonPace;
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
  masterVolume: 0.75,
  gameSounds: true,
  voiceGuidance: true,
  autoSpeakTarget: true,
  nameFrequency: "sometimes",
  voiceURI: "",
  speechRate: 0.95,
  voicePersonality: "playful",
  wrongVoiceHelp: true,
  preferLocalVoice: true,
  celebrations: true,
  celebrationLevel: "fun",
  lessonPace: "relaxed",
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
    const nameFrequency = parseNameFrequency(parsed.nameFrequency);
    const speechRateRaw = clamp(Number(parsed.speechRate ?? 0.95), 0.7, 1.1);
    const speechRate =
      Number.isFinite(Number(parsed.speechRate)) &&
      Number(parsed.speechRate) >= 0.8 &&
      Number(parsed.speechRate) <= 0.86
        ? 0.95
        : speechRateRaw;
    const voicePersonality: VoicePersonality =
      parsed.voicePersonality === "calm" ? "calm" : "playful";
    const lessonPace: LessonPace = parsed.lessonPace === "steady" ? "steady" : "relaxed";
    const masterVolume = clamp(Number(parsed.masterVolume ?? 0.75), 0, 1);
    return {
      ...defaultSettings,
      ...parsed,
      celebrationLevel,
      nameFrequency,
      speechRate,
      voicePersonality,
      lessonPace,
      masterVolume,
      voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : "",
      childName: parseChildName(parsed.childName) ?? "",
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ParentSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetSettings(): ParentSettings {
  saveSettings(defaultSettings);
  return defaultSettings;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function parseNameFrequency(value: unknown): ParentSettings["nameFrequency"] {
  if (value === "never" || value === "sometimes" || value === "celebrations" || value === "often") {
    return value;
  }
  return "sometimes";
}

export function celebrationMs(
  settings: ParentSettings,
  reducedMotion: boolean,
  streak = 0,
): number {
  return successHoldMs(streak, reducedMotion || settings.reducedAnimations);
}

export function nextLetterSpeechDelay(settings: ParentSettings): number {
  return settings.lessonPace === "steady" ? 200 : 280;
}
