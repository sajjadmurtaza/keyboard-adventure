"use client";

import { useState } from "react";
import { lessons } from "@/data/lessons";
import { CHILD_NAME_MAX } from "@/utils/childName";
import type { ParentSettings } from "@/utils/settings";

type ParentSettingsPanelProps = {
  settings: ParentSettings;
  accuracy: number | null;
  voices: { uri: string; name: string }[];
  speechAvailable: boolean;
  onChange: (next: ParentSettings) => void;
  onClose: () => void;
  onOpenLesson: (id: number) => void;
  onResetProgress: () => void;
  onResetAll: () => void;
  onPreviewVoice: (voiceURI?: string) => void;
  onPreviewName: () => void;
};

export function ParentSettingsPanel({
  settings,
  accuracy,
  voices,
  speechAvailable,
  onChange,
  onClose,
  onOpenLesson,
  onResetProgress,
  onResetAll,
  onPreviewVoice,
  onPreviewName,
}: ParentSettingsPanelProps) {
  const [confirm, setConfirm] = useState<"progress" | "all" | null>(null);
  return (
    <div className="mx-auto my-4 flex max-h-[88dvh] max-w-xl flex-col gap-4 overflow-y-auto rounded-[32px] bg-white p-8 shadow-lg">
      <h1 className="font-[family-name:var(--font-nunito)] text-3xl font-bold text-[#34364A]">
        Parent settings
      </h1>
      {accuracy !== null ? (
        <p className="font-[family-name:var(--font-nunito)] text-[#5A5C72]">
          Accuracy: {accuracy}%
        </p>
      ) : null}

      <label className="flex flex-col gap-1 font-[family-name:var(--font-nunito)] text-lg">
        Child&apos;s name
        <input
          value={settings.childName}
          onChange={(event) =>
            onChange({ ...settings, childName: event.target.value.slice(0, CHILD_NAME_MAX) })
          }
          className="rounded-2xl border-2 border-[#E8E4F8] px-4 py-2"
          placeholder="Fatima"
          maxLength={40}
          autoComplete="nickname"
          spellCheck={false}
        />
      </label>
      <p className="text-sm text-[#9AA0B8]">Saved only on this device.</p>
      <button
        type="button"
        onClick={onPreviewName}
        className="min-h-12 rounded-full bg-white font-[family-name:var(--font-display)] text-lg font-bold shadow"
      >
        ▶ Test name
      </button>

      <label className="flex items-center justify-between text-lg">
        Practice length
        <select
          value={settings.questionCount}
          onChange={(event) =>
            onChange({
              ...settings,
              questionCount: Number(event.target.value) as 5 | 10 | 15 | 20,
            })
          }
          className="rounded-xl border px-3 py-2"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </label>

      <label className="flex items-center justify-between text-lg">
        Show visual keyboard
        <input
          type="checkbox"
          checked={settings.keyboardHighlight}
          onChange={(event) =>
            onChange({ ...settings, keyboardHighlight: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Show finger hints
        <input
          type="checkbox"
          checked={settings.fingerHints}
          onChange={(event) =>
            onChange({ ...settings, fingerHints: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Time between letters
        <select
          value={settings.lessonPace}
          onChange={(event) =>
            onChange({
              ...settings,
              lessonPace: event.target.value as ParentSettings["lessonPace"],
            })
          }
          className="rounded-xl border px-3 py-2"
        >
          <option value="relaxed">Relaxed</option>
          <option value="steady">A bit quicker</option>
        </select>
      </label>
      <label className="flex items-center justify-between text-lg">
        Celebrations
        <select
          value={settings.celebrationLevel}
          onChange={(event) =>
            onChange({
              ...settings,
              celebrationLevel: event.target.value as ParentSettings["celebrationLevel"],
            })
          }
          className="rounded-xl border px-3 py-2"
        >
          <option value="gentle">Gentle</option>
          <option value="fun">Fun</option>
          <option value="big">Big</option>
        </select>
      </label>
      <label className="flex items-center justify-between text-lg">
        Reduced animations
        <input
          type="checkbox"
          checked={settings.reducedAnimations}
          onChange={(event) =>
            onChange({ ...settings, reducedAnimations: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Allow lesson replay
        <input
          type="checkbox"
          checked={settings.allowReplay}
          onChange={(event) =>
            onChange({ ...settings, allowReplay: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Unlock all lessons (testing)
        <input
          type="checkbox"
          checked={settings.unlockAll}
          onChange={(event) =>
            onChange({ ...settings, unlockAll: event.target.checked })
          }
        />
      </label>
      <p className="font-[family-name:var(--font-nunito)] font-semibold">Audio</p>
      <label className="flex items-center justify-between text-lg">
        Sound
        <input
          type="checkbox"
          checked={settings.sound}
          onChange={(event) =>
            onChange({ ...settings, sound: event.target.checked })
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-lg">
        Volume {Math.round(settings.masterVolume * 100)}%
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.masterVolume * 100)}
          onChange={(event) =>
            onChange({ ...settings, masterVolume: Number(event.target.value) / 100 })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Game sounds
        <input
          type="checkbox"
          checked={settings.gameSounds}
          onChange={(event) =>
            onChange({ ...settings, gameSounds: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Voice guidance
        <input
          type="checkbox"
          checked={settings.voiceGuidance}
          onChange={(event) =>
            onChange({ ...settings, voiceGuidance: event.target.checked })
          }
        />
      </label>
      {speechAvailable ? (
        <section className="flex flex-col gap-3 rounded-3xl bg-[#F7F5FF] p-4">
          <h2 className="font-[family-name:var(--font-nunito)] text-xl font-bold">Voice</h2>
          <p className="text-sm text-[#5A5C72]">Voice style</p>
          <div className="flex gap-2">
            {(["playful", "calm"] as const).map((style) => (
              <button
                key={style}
                type="button"
                className={`min-h-11 flex-1 rounded-full font-semibold ${
                  settings.voicePersonality === style
                    ? "bg-[#7657E8] text-white"
                    : "bg-white text-[#34364A]"
                }`}
                onClick={() => onChange({ ...settings, voicePersonality: style })}
              >
                {style === "playful" ? "Friendly" : "Calm"}
              </button>
            ))}
          </div>
          <p className="text-sm text-[#5A5C72]">Choose voice</p>
          <div className="flex flex-col gap-2">
            <VoiceChoice
              selected={settings.voiceURI === ""}
              label="Recommended friendly English"
              onSelect={() => onChange({ ...settings, voiceURI: "" })}
              onPreview={onPreviewVoice}
            />
            {voices.slice(0, 8).map((voice) => (
              <VoiceChoice
                key={voice.uri}
                selected={settings.voiceURI === voice.uri}
                label={voice.name}
                onSelect={() => onChange({ ...settings, voiceURI: voice.uri })}
                onPreview={() => {
                  onChange({ ...settings, voiceURI: voice.uri });
                  onPreviewVoice(voice.uri);
                }}
              />
            ))}
          </div>
          <label className="flex flex-col gap-1 text-lg">
            Speaking speed
            <span className="flex justify-between text-sm text-[#5A5C72]">
              <span>Slow</span>
              <span>Cheerful</span>
            </span>
            <input
              type="range"
              min={75}
              max={100}
              value={Math.round(settings.speechRate * 100)}
              onChange={(event) =>
                onChange({
                  ...settings,
                  speechRate: Number(event.target.value) / 100,
                })
              }
            />
          </label>
          <button
            type="button"
            onClick={() => onPreviewVoice()}
            className="min-h-12 rounded-full bg-[#FFD85A] font-[family-name:var(--font-display)] text-lg font-bold"
          >
            ▶ Hear preview
          </button>
        </section>
      ) : (
        <p className="text-sm text-[#9AA0B8]">
          Voice guidance isn&apos;t available in this browser.
        </p>
      )}
      <label className="flex items-center justify-between text-lg">
        Speak instructions automatically
        <input
          type="checkbox"
          checked={settings.autoSpeakTarget}
          onChange={(event) =>
            onChange({ ...settings, autoSpeakTarget: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Use child&apos;s name
        <select
          value={settings.nameFrequency}
          onChange={(event) =>
            onChange({
              ...settings,
              nameFrequency: event.target.value as ParentSettings["nameFrequency"],
            })
          }
          className="rounded-xl border px-3 py-2"
        >
          <option value="never">Never</option>
          <option value="sometimes">Sometimes</option>
          <option value="celebrations">Celebrations</option>
          <option value="often">Often</option>
        </select>
      </label>
      <label className="flex items-center justify-between text-lg">
        Wrong-key voice help
        <input
          type="checkbox"
          checked={settings.wrongVoiceHelp}
          onChange={(event) =>
            onChange({ ...settings, wrongVoiceHelp: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Prefer voices on this device
        <input
          type="checkbox"
          checked={settings.preferLocalVoice}
          onChange={(event) =>
            onChange({ ...settings, preferLocalVoice: event.target.checked })
          }
        />
      </label>

      <p className="font-[family-name:var(--font-nunito)] font-semibold">All lessons</p>
      <div className="grid grid-cols-2 gap-2">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onOpenLesson(lesson.id)}
            className="rounded-2xl bg-[#F4FBFF] px-3 py-2 text-left text-sm"
          >
            {lesson.id}. {lesson.title}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-[#FFF6F6] p-4">
        <p className="font-[family-name:var(--font-nunito)] font-semibold text-[#34364A]">
          Start over
        </p>
        <p className="mt-1 text-sm text-[#5A5C72]">
          This only clears data saved in this browser. Nothing is stored on a server.
        </p>
        {confirm === null ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConfirm("progress")}
              className="min-h-11 rounded-full bg-white px-4 font-semibold text-[#FF4D5E] shadow"
            >
              Reset progress
            </button>
            <button
              type="button"
              onClick={() => setConfirm("all")}
              className="min-h-11 rounded-full bg-white px-4 font-semibold text-[#9AA0B8] shadow"
            >
              Reset everything
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <p className="font-semibold text-[#FF4D5E]">
              {confirm === "all"
                ? "Clear lessons, stars, and parent settings?"
                : "Clear completed lessons, stars, and typing stats?"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm === "all") onResetAll();
                  else onResetProgress();
                  setConfirm(null);
                }}
                className="min-h-11 rounded-full bg-[#FF4D5E] px-5 font-bold text-white"
              >
                Yes, start over
              </button>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="min-h-11 rounded-full bg-white px-5 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="min-h-12 rounded-full bg-[#7657E8] text-lg font-bold text-white"
      >
        Done
      </button>
    </div>
  );
}

function VoiceChoice({
  selected,
  label,
  onSelect,
  onPreview,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSelect}
        className={`min-h-11 flex-1 rounded-2xl px-3 text-left font-semibold ${
          selected ? "bg-[#7657E8] text-white" : "bg-white text-[#34364A]"
        }`}
      >
        {selected ? "● " : "○ "}
        {label}
      </button>
      <button
        type="button"
        className="pressable min-h-11 min-w-11 rounded-full bg-white text-lg shadow"
        aria-label={`Preview ${label}`}
        onClick={onPreview}
      >
        ▶
      </button>
    </div>
  );
}
