"use client";

import { lessons } from "@/data/lessons";
import type { ParentSettings } from "@/utils/settings";

type ParentSettingsPanelProps = {
  settings: ParentSettings;
  accuracy: number | null;
  onChange: (next: ParentSettings) => void;
  onClose: () => void;
  onOpenLesson: (id: number) => void;
};

export function ParentSettingsPanel({
  settings,
  accuracy,
  onChange,
  onClose,
  onOpenLesson,
}: ParentSettingsPanelProps) {
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
        Child first name (optional)
        <input
          value={settings.childName}
          onChange={(event) =>
            onChange({ ...settings, childName: event.target.value.slice(0, 24) })
          }
          className="rounded-2xl border-2 border-[#E8E4F8] px-4 py-2"
          placeholder="Fatima"
        />
      </label>

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
