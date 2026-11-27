"use client";

import { useRef } from "react";
import { FingerGuide } from "@/components/FingerGuide";
import { KeyboardKey } from "@/components/KeyboardKey";
import { keyboardRows, type KeyboardLayoutId } from "@/utils/keyboardLayouts";
import { displayKey, normalizeTarget } from "@/utils/keys";

type VirtualKeyboardProps = {
  target: string;
  highlightOn: boolean;
  mood: "idle" | "success" | "retry";
  helpLevel: number;
  missedKey: string | null;
  fingerHints: boolean;
  layout?: KeyboardLayoutId;
  compactHint?: boolean;
  arrive?: boolean;
};

export function VirtualKeyboard({
  target,
  highlightOn,
  mood,
  helpLevel,
  missedKey,
  fingerHints,
  layout = "en-us",
  compactHint = false,
  arrive = false,
}: VirtualKeyboardProps) {
  const wanted = normalizeTarget(target);
  const rows = keyboardRows(layout);
  const stageRef = useRef<HTMLDivElement>(null);

  function toneFor(key: string) {
    if (missedKey && normalizeTarget(missedKey) === key) return "miss" as const;
    if (!highlightOn) return "idle" as const;
    if (wanted !== key) return "idle" as const;
    if (mood === "success") return "success" as const;
    if (mood === "retry" || helpLevel >= 2) return "strong" as const;
    if (arrive) return "pulse" as const;
    return "lit" as const;
  }

  return (
    <div
      ref={stageRef}
      className="keyboard-stage relative w-full max-w-[68rem]"
      data-testid="visual-keyboard"
      data-layout={layout}
    >
      <div className="keyboard-shell">
        <div className="keyboard-rows">
          {rows.map((row, index) => (
            <div
              key={row.join("")}
              className="keyboard-row"
              data-testid={`keyboard-row-${index}`}
              data-row={index}
              style={{
                paddingLeft:
                  index === 1
                    ? "var(--row-offset-2)"
                    : index === 2
                      ? "var(--row-offset-3)"
                      : 0,
              }}
            >
              {row.map((key) => (
                <KeyboardKey
                  key={key}
                  keyId={key}
                  label={displayKey(key)}
                  bump={key === "f" || key === "j"}
                  tone={toneFor(key)}
                  point={wanted === key && helpLevel >= 3}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="keyboard-space-row" data-testid="keyboard-row-space">
          <KeyboardKey
            keyId=" "
            label="SPACE"
            wide
            tone={toneFor(" ")}
            point={wanted === " " && helpLevel >= 3}
          />
        </div>
        {fingerHints ? (
          <div className="finger-guide-track" data-testid="finger-guide-track">
            <FingerGuide
              target={target}
              enabled
              layout={layout}
              compact={compactHint}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
