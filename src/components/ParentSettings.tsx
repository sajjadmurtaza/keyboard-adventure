"use client";

import type { ParentSettings } from "@/utils/settings";

type ParentSettingsPanelProps = {
  settings: ParentSettings;
  accuracy: number | null;
  onChange: (next: ParentSettings) => void;
  onClose: () => void;
};

export function ParentSettingsPanel({
  settings,
  accuracy,
  onChange,
  onClose,
}: ParentSettingsPanelProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 rounded-[32px] bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-[#34364A]">Parent settings</h1>
      {accuracy !== null ? (
        <p className="text-[#5A5C72]">Accuracy: {accuracy}%</p>
      ) : null}

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
      <label className="flex items-center justify-between text-lg">
        Celebration animations
        <input
          type="checkbox"
          checked={settings.celebrations}
          onChange={(event) =>
            onChange({ ...settings, celebrations: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Finger hints
        <input
          type="checkbox"
          checked={settings.fingerHints}
          onChange={(event) =>
            onChange({ ...settings, fingerHints: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Keyboard highlight
        <input
          type="checkbox"
          checked={settings.keyboardHighlight}
          onChange={(event) =>
            onChange({ ...settings, keyboardHighlight: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between text-lg">
        Number of questions
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
        Difficulty
        <select
          value={settings.difficulty}
          onChange={(event) =>
            onChange({
              ...settings,
              difficulty: event.target.value as ParentSettings["difficulty"],
            })
          }
          className="rounded-xl border px-3 py-2"
        >
          <option value="beginner">Beginner</option>
          <option value="growing">Growing</option>
          <option value="practice">Practice</option>
        </select>
      </label>
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
