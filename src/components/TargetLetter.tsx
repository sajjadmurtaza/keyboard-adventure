"use client";

import { displayKey, tinyHint } from "@/utils/keys";

type TargetLetterProps = {
  target: string;
  mood: "idle" | "success" | "retry";
  reducedMotion: boolean;
  burst: boolean;
  burstLevel?: 1 | 2 | 3;
  size?: "desktop" | "mobile" | "compact";
  banner?: string | null;
};

export function TargetLetter({
  target,
  mood,
  reducedMotion,
  burst,
  burstLevel = 1,
  size = "desktop",
  banner,
}: TargetLetterProps) {
  const label = displayKey(target);
  const hint = tinyHint(target);
  const compact = size !== "desktop";
  const motion = reducedMotion
    ? ""
    : mood === "idle"
      ? "animate-letter-enter"
      : mood === "success"
        ? "animate-pop"
        : compact
          ? "animate-wiggle-mobile"
          : "animate-wiggle";

  const fontSize =
    size === "compact"
      ? "clamp(110px, 28vw, 130px)"
      : size === "mobile"
        ? "clamp(110px, 35vw, 190px)"
        : "clamp(180px, 22vw, 300px)";

  const letterColor =
    mood === "success"
      ? "text-[#38D978]"
      : mood === "retry"
        ? "text-[#FF4D5E]"
        : "text-[#34364A]";

  const letterShadow =
    mood === "success"
      ? "0 8px 0 rgba(255, 216, 77, 0.55), 0 0 32px rgba(56, 217, 120, 0.45)"
      : mood === "retry"
        ? "0 0 28px rgba(255, 77, 94, 0.35)"
        : "none";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${
        size === "desktop" ? "min-h-[28vh]" : "min-h-0"
      }`}
    >
      {mood === "retry" ? <div className="target-halo-miss" /> : null}
      {mood === "success" ? <div className="target-halo-win" /> : null}
      {burst && !reducedMotion ? (
        <StarBurst compact={compact} level={burstLevel} />
      ) : null}
      {burst && !reducedMotion ? (
        <span className="star-fly absolute top-6 left-1/2 text-4xl" aria-hidden>
          ⭐
        </span>
      ) : null}
      <p
        className={`font-[family-name:var(--font-display)] font-bold ${letterColor} ${motion}`}
        style={{ fontSize, lineHeight: 0.9, textShadow: letterShadow }}
        aria-live="polite"
      >
        {label}
      </p>
      {hint ? (
        <p className="mt-1 text-lg font-semibold text-[#7657E8]">{hint}</p>
      ) : null}
      {banner ? (
        <p
          className={`mt-2 whitespace-pre-line text-center font-[family-name:var(--font-display)] font-bold leading-tight ${
            mood === "success"
              ? "text-[#2AA85A]"
              : mood === "retry"
                ? "text-[#FF4D5E]"
                : "text-[#34364A]"
          } ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}
        >
          {banner}
        </p>
      ) : null}
    </div>
  );
}

function StarBurst({ compact, level }: { compact?: boolean; level: 1 | 2 | 3 }) {
  const count = compact ? (level >= 3 ? 10 : 8) : level >= 3 ? 16 : level === 2 ? 14 : 12;
  const bits = ["⭐", "✨", "✦"];
  const reach = compact ? 70 : 110;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + (index % 2) * 0.2;
        const dist = reach + (index % 3) * 18;
        const dx = `${Math.cos(angle) * dist}px`;
        const dy = `${Math.sin(angle) * dist * 0.78}px`;
        return (
          <span
            key={index}
            className="particle absolute top-1/2 left-1/2 text-2xl"
            style={{ ["--dx" as string]: dx, ["--dy" as string]: dy }}
          >
            {bits[index % bits.length]}
          </span>
        );
      })}
    </div>
  );
}
