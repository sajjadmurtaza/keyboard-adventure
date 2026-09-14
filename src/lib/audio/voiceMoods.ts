import type { VoicePersonality } from "@/utils/settings";

export type SpeechMood = "instruction" | "hint" | "success" | "streak" | "celebration";

type MoodTone = {
  rate: number;
  pitch: number;
  volume: number;
};

const PLAYFUL_MOODS: Record<SpeechMood, MoodTone> = {
  instruction: { rate: 0.86, pitch: 1.1, volume: 1 },
  hint: { rate: 0.82, pitch: 1.08, volume: 0.95 },
  success: { rate: 0.9, pitch: 1.12, volume: 1 },
  streak: { rate: 0.92, pitch: 1.14, volume: 1 },
  celebration: { rate: 0.88, pitch: 1.12, volume: 1 },
};

const CALM_MOODS: Record<SpeechMood, MoodTone> = {
  instruction: { rate: 0.88, pitch: 1.02, volume: 1 },
  hint: { rate: 0.86, pitch: 1.02, volume: 0.95 },
  success: { rate: 0.98, pitch: 1.08, volume: 1 },
  streak: { rate: 1.02, pitch: 1.1, volume: 1 },
  celebration: { rate: 0.96, pitch: 1.08, volume: 1 },
};

export function moodTone(
  mood: SpeechMood,
  personality: VoicePersonality,
  speechRate: number,
): MoodTone {
  const base = personality === "calm" ? CALM_MOODS[mood] : PLAYFUL_MOODS[mood];
  const pace = speechRate <= 0.82 ? 0.92 : speechRate >= 0.98 ? 1 : 0.94;
  return {
    rate: clamp(base.rate * pace, 0.72, 0.98),
    pitch: clamp(base.pitch, 1, 1.18),
    volume: base.volume,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
