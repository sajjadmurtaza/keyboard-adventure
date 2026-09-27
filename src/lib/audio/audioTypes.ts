export const AUDIO_TIMING = {
  targetSpeechDelay: 900,
  wrongSpeechCooldown: 1400,
  streakSpeechDelay: 280,
  lessonCompleteSpeechDelay: 800,
  encouragementDelay: 300,
  associationSpeechDelay: 700,
} as const;

export type SpeechPriority = "high" | "medium" | "low";

export type EffectName =
  | "correct"
  | "wrong"
  | "star"
  | "streak3"
  | "streak5"
  | "lessonComplete"
  | "unlock"
  | "button";

export type AudioGameEvent =
  | {
      type: "TARGET_SHOWN";
      key: string;
      shortened?: boolean;
      word?: string;
      review?: boolean;
    }
  | {
      type: "TARGET_CORRECT";
      key: string;
      streak: number;
      phrase: string;
      speakPraise: boolean;
      teachLine?: string;
      speakTeach?: boolean;
    }
  | { type: "TARGET_WRONG"; key: string; attempts: number }
  | { type: "STREAK_3" }
  | { type: "STREAK_5" }
  | { type: "LESSON_COMPLETE" }
  | { type: "LESSON_UNLOCKED" }
  | { type: "BUTTON_TAP" };

export type VoiceOption = {
  uri: string;
  name: string;
  lang: string;
  local: boolean;
};

export type SpeechProvider = {
  speak: (
    text: string,
    options: {
      priority: SpeechPriority;
      rate: number;
      pitch: number;
      volume: number;
      voiceURI: string;
      preferLocal: boolean;
      generation: number;
    },
    cooldownMs?: number,
  ) => boolean;
  cancel: () => void;
  list: () => VoiceOption[];
};
