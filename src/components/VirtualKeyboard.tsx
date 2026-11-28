"use client";

import { useRef } from "react";
import { FingerGuide } from "@/components/FingerGuide";
import { KeyboardKey } from "@/components/KeyboardKey";
import {
  isForceFindHelp,
  showTargetFingerPoint,
  targetKeyTone,
} from "@/components/keyboardFindHelp";
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
  const findHelp = helpLevel >= 1 || mood === "retry";
  const forceHelp = isForceFindHelp(helpLevel);
  const point = showTargetFingerPoint(helpLevel, mood);

  function toneFor(key: string) {
    return targetKeyTone({
      key,
      wanted,
      highlightOn,
      mood,
      helpLevel,
      missedKey: missedKey ? normalizeTarget(missedKey) : null,
      arrive,
    });
  }

  return (
    <div
      ref={stageRef}
      className="keyboard-stage relative w-full max-w-[68rem]"
      data-testid="visual-keyboard"
      data-layout={layout}
      data-find-help={findHelp ? "true" : "false"}
      data-find-help-force={forceHelp ? "true" : "false"}
      data-help-level={String(helpLevel)}
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
                  point={wanted === key && point}
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
            point={wanted === " " && point}
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
