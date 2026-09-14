import type { VoicePersonality } from "@/utils/settings";

export type SpeechMood = "instruction" | "hint" | "success" | "streak" | "celebration";

type MoodTone = {
  rate: number;
  pitch: number;
  volume: number;
};

const PLAYFUL_MOODS: Record<SpeechMood, MoodTone> = {
  instruction: { rate: 0.98, pitch: 1.04, volume: 1 },
  hint: { rate: 0.96, pitch: 1.03, volume: 1 },
  success: { rate: 1.02, pitch: 1.06, volume: 1 },
  streak: { rate: 1.04, pitch: 1.06, volume: 1 },
  celebration: { rate: 1, pitch: 1.05, volume: 1 },
};

const CALM_MOODS: Record<SpeechMood, MoodTone> = {
  instruction: { rate: 0.94, pitch: 1.02, volume: 1 },
  hint: { rate: 0.92, pitch: 1.02, volume: 1 },
  success: { rate: 0.98, pitch: 1.03, volume: 1 },
  streak: { rate: 1, pitch: 1.04, volume: 1 },
  celebration: { rate: 0.96, pitch: 1.03, volume: 1 },
};

export function moodTone(
  mood: SpeechMood,
  personality: VoicePersonality,
  speechRate: number,
): MoodTone {
  const base = personality === "calm" ? CALM_MOODS[mood] : PLAYFUL_MOODS[mood];
  const rateNudge = (speechRate - 0.95) * 0.35;
  return {
    rate: clamp(base.rate + rateNudge, 0.9, 1.08),
    pitch: clamp(base.pitch, 1, 1.08),
    volume: 1,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
