"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { FingerGuide } from "@/components/FingerGuide";
import { KeyboardKey } from "@/components/KeyboardKey";
import { displayKey, KEYBOARD_ROWS, normalizeTarget } from "@/utils/keys";

type VirtualKeyboardProps = {
  target: string;
  highlightOn: boolean;
  mood: "idle" | "success" | "retry";
  helpLevel: number;
  missedKey: string | null;
  fingerHints: boolean;
  compactHint?: boolean;
};

export function VirtualKeyboard({
  target,
  highlightOn,
  mood,
  helpLevel,
  missedKey,
  fingerHints,
  compactHint = false,
}: VirtualKeyboardProps) {
  const wanted = normalizeTarget(target);
  const stageRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [hintCenter, setHintCenter] = useState<number | null>(null);

  function toneFor(key: string) {
    if (missedKey && normalizeTarget(missedKey) === key) return "miss" as const;
    if (!highlightOn) return "idle" as const;
    if (wanted !== key) return "idle" as const;
    if (mood === "success") return "success" as const;
    if (mood === "retry" || helpLevel >= 2) return "strong" as const;
    return "target" as const;
  }

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const key = targetRef.current;
    if (!stage || !key) {
      setHintCenter(null);
      return;
    }
    const stageBox = stage.getBoundingClientRect();
    const keyBox = key.getBoundingClientRect();
    setHintCenter(keyBox.left + keyBox.width / 2 - stageBox.left);
  }, [wanted, mood, helpLevel, missedKey]);

  return (
    <div
      ref={stageRef}
      className="keyboard-stage relative w-full max-w-[52rem]"
      data-testid="visual-keyboard"
    >
      <div className="keyboard-shell">
        {KEYBOARD_ROWS.map((row, index) => (
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
                ref={wanted === key ? targetRef : undefined}
                label={displayKey(key)}
                bump={key === "f" || key === "j"}
                tone={toneFor(key)}
                point={wanted === key && helpLevel >= 3}
              />
            ))}
          </div>
        ))}
        <div className="keyboard-space-row" data-testid="keyboard-row-space">
          <KeyboardKey
            keyId=" "
            ref={wanted === " " ? targetRef : undefined}
            label="SPACE"
            wide
            tone={toneFor(" ")}
            point={wanted === " " && helpLevel >= 3}
          />
        </div>
      </div>
      {fingerHints ? (
        <div className="relative mt-1 h-16 w-full overflow-visible" data-testid="finger-guide-track">
          <FingerGuide
            target={target}
            enabled
            compact={compactHint}
            centerX={hintCenter}
          />
        </div>
      ) : null}
    </div>
  );
}
