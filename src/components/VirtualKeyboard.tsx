"use client";

import { KeyboardKey } from "@/components/KeyboardKey";
import { displayKey, KEYBOARD_ROWS, normalizeTarget } from "@/utils/keys";

type VirtualKeyboardProps = {
  target: string;
  highlightOn: boolean;
  mood: "idle" | "success" | "retry";
  helpLevel: number;
  missedKey: string | null;
};

export function VirtualKeyboard({
  target,
  highlightOn,
  mood,
  helpLevel,
  missedKey,
}: VirtualKeyboardProps) {
  const wanted = normalizeTarget(target);

  function toneFor(key: string) {
    if (missedKey && normalizeTarget(missedKey) === key) return "miss" as const;
    if (!highlightOn) return "idle" as const;
    if (wanted !== key) return "idle" as const;
    if (mood === "success") return "success" as const;
    if (mood === "retry" || helpLevel >= 2) return "strong" as const;
    return "target" as const;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 sm:gap-2.5">
      {KEYBOARD_ROWS.map((row, index) => (
        <div
          key={row.join("")}
          className="flex justify-center gap-1.5 sm:gap-2"
          style={{ paddingLeft: index === 1 ? "1.1rem" : index === 2 ? "2.2rem" : 0 }}
        >
          {row.map((key) => (
            <KeyboardKey
              key={key}
              label={displayKey(key)}
              bump={key === "f" || key === "j"}
              tone={toneFor(key)}
              point={wanted === key && helpLevel >= 3}
            />
          ))}
        </div>
      ))}
      <KeyboardKey
        label="SPACE"
        wide
        tone={toneFor(" ")}
        point={wanted === " " && helpLevel >= 3}
      />
    </div>
  );
}
