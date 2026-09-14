"use client";

import { displayKey } from "@/utils/keys";

type TargetLetterProps = {
  target: string;
  mood: "idle" | "success" | "retry";
  reducedMotion: boolean;
};

export function TargetLetter({ target, mood, reducedMotion }: TargetLetterProps) {
  const label = displayKey(target);
  const motion =
    reducedMotion || mood === "idle"
      ? ""
      : mood === "success"
        ? "animate-pop"
        : "animate-wiggle";

  return (
    <div className="relative flex flex-col items-center">
      {mood === "success" && !reducedMotion ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl">
          <span className="absolute -translate-x-24 -translate-y-16">✨</span>
          <span className="absolute translate-x-24 -translate-y-10">⭐</span>
          <span className="absolute translate-y-20">🎉</span>
        </div>
      ) : null}
      <p
        className={`font-[family-name:var(--font-display)] leading-none font-bold text-[#34364A] ${motion}`}
        style={{ fontSize: "clamp(120px, 25vw, 280px)" }}
        aria-live="polite"
      >
        {label}
      </p>
    </div>
  );
}
