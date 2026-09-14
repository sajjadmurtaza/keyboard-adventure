"use client";

import { KeyboardKey } from "@/components/KeyboardKey";
import { displayKey, KEYBOARD_ROWS, normalizeTarget } from "@/utils/keys";

type VirtualKeyboardProps = {
  target: string;
  highlightOn: boolean;
};

export function VirtualKeyboard({ target, highlightOn }: VirtualKeyboardProps) {
  const wanted = normalizeTarget(target);

  return (
    <div className="flex w-full flex-col items-center gap-1.5 sm:gap-2">
      {KEYBOARD_ROWS.map((row, index) => (
        <div
          key={row.join("")}
          className="flex justify-center gap-1 sm:gap-1.5"
          style={{ paddingLeft: index === 1 ? "1rem" : index === 2 ? "2rem" : 0 }}
        >
          {row.map((key) => (
            <KeyboardKey
              key={key}
              label={displayKey(key)}
              bump={key === "f" || key === "j"}
              highlighted={wanted === key}
              highlightOn={highlightOn}
            />
          ))}
        </div>
      ))}
      <KeyboardKey
        label="SPACE"
        wide
        highlighted={wanted === " "}
        highlightOn={highlightOn}
      />
    </div>
  );
}
