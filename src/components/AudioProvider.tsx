"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { getAudioManager, type AudioManager } from "@/lib/audio/AudioManager";
import type { VoiceOption } from "@/lib/audio/audioTypes";

const AudioContext = createContext<{
  audio: AudioManager | null;
  voices: VoiceOption[];
  speechAvailable: boolean;
}>({ audio: null, voices: [], speechAvailable: false });

/**
 * Browser speech + Howler SFX. Lesson code talks only to AudioManager.notify.
 * SpeechManager can later sit behind a neural TTS backend without changing game events.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audio = useSyncExternalStore(
    () => () => undefined,
    () => getAudioManager(),
    () => null,
  );
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    if (!audio) return;
    const off = audio.onVoices(setVoices);
    const hide = () => {
      if (document.visibilityState === "hidden") audio.stopSpeech();
    };
    document.addEventListener("visibilitychange", hide);
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      off();
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [audio]);

  const value = useMemo(
    () => ({
      audio,
      voices,
      speechAvailable: audio?.speechAvailable() ?? false,
    }),
    [audio, voices],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  return useContext(AudioContext);
}
