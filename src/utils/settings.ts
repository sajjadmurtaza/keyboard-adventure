import { parseChildName } from "@/utils/childName";
import { successHoldMs } from "@/lib/lessonPhase";
import {
  parseKeyboardLayout,
  type KeyboardLayoutId,
} from "@/utils/keyboardLayouts";

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
  keyboardLayout: KeyboardLayoutId;
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
  keyboardLayout: "en-us",
  difficulty: "beginner",
};

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseVoiceURI(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 240);
  if (!trimmed) return "";
  if (/[<>\n\r]|javascript:|data:|https?:/i.test(trimmed)) return "";
  return trimmed;
}

function parseCelebrationLevel(value: unknown, celebrations?: boolean): CelebrationLevel {
  if (value === "gentle" || value === "fun" || value === "big") return value;
  return celebrations === false ? "gentle" : "fun";
}

function parseQuestionCount(value: unknown): ParentSettings["questionCount"] {
  if (value === 5 || value === 10 || value === 15 || value === 20) return value;
  return 10;
}

function parseDifficulty(value: unknown): Difficulty {
  if (value === "beginner" || value === "growing" || value === "practice") return value;
  return "beginner";
}

export function loadSettings(): ParentSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<ParentSettings> & {
      celebrations?: boolean;
    };
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return defaultSettings;
    }
    const speechRateRaw = clamp(Number(parsed.speechRate ?? 0.95), 0.7, 1.1);
    const speechRate =
      Number.isFinite(Number(parsed.speechRate)) &&
      Number(parsed.speechRate) >= 0.8 &&
      Number(parsed.speechRate) <= 0.86
        ? 0.95
        : Number.isFinite(speechRateRaw)
          ? speechRateRaw
          : 0.95;
    return {
      sound: asBool(parsed.sound, defaultSettings.sound),
      masterVolume: clamp(Number(parsed.masterVolume ?? 0.75), 0, 1),
      gameSounds: asBool(parsed.gameSounds, defaultSettings.gameSounds),
      voiceGuidance: asBool(parsed.voiceGuidance, defaultSettings.voiceGuidance),
      autoSpeakTarget: asBool(parsed.autoSpeakTarget, defaultSettings.autoSpeakTarget),
      nameFrequency: parseNameFrequency(parsed.nameFrequency),
      voiceURI: parseVoiceURI(parsed.voiceURI),
      speechRate,
      voicePersonality: parsed.voicePersonality === "calm" ? "calm" : "playful",
      wrongVoiceHelp: asBool(parsed.wrongVoiceHelp, defaultSettings.wrongVoiceHelp),
      preferLocalVoice: asBool(parsed.preferLocalVoice, defaultSettings.preferLocalVoice),
      celebrations: asBool(parsed.celebrations, defaultSettings.celebrations),
      celebrationLevel: parseCelebrationLevel(parsed.celebrationLevel, parsed.celebrations),
      lessonPace: parsed.lessonPace === "steady" ? "steady" : "relaxed",
      reducedAnimations: asBool(parsed.reducedAnimations, defaultSettings.reducedAnimations),
      allowReplay: asBool(parsed.allowReplay, defaultSettings.allowReplay),
      unlockAll: asBool(parsed.unlockAll, defaultSettings.unlockAll),
      childName: parseChildName(parsed.childName) ?? "",
      questionCount: parseQuestionCount(parsed.questionCount),
      fingerHints: asBool(parsed.fingerHints, defaultSettings.fingerHints),
      keyboardHighlight: asBool(parsed.keyboardHighlight, defaultSettings.keyboardHighlight),
      keyboardLayout: parseKeyboardLayout(parsed.keyboardLayout),
      difficulty: parseDifficulty(parsed.difficulty),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ParentSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, childName: parseChildName(settings.childName) ?? "" }));
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
