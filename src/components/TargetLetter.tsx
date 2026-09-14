"use client";

import { displayKey, tinyHint } from "@/utils/keys";

type TargetLetterProps = {
  target: string;
  mood: "idle" | "success" | "retry";
  reducedMotion: boolean;
  burst: boolean;
  size?: "desktop" | "mobile" | "compact";
};

export function TargetLetter({
  target,
  mood,
  reducedMotion,
  burst,
  size = "desktop",
}: TargetLetterProps) {
  const label = displayKey(target);
  const hint = tinyHint(target);
  const motion =
    reducedMotion || mood === "idle"
      ? ""
      : mood === "success"
        ? "animate-pop"
        : "animate-wiggle";

  const fontSize =
    size === "compact"
      ? "clamp(110px, 28vw, 130px)"
      : size === "mobile"
        ? "clamp(110px, 35vw, 190px)"
        : "clamp(180px, 22vw, 300px)";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${
        size === "desktop" ? "min-h-[28vh]" : "min-h-0"
      }`}
    >
      {burst && !reducedMotion ? <StarBurst compact={size !== "desktop"} /> : null}
      <p
        className={`font-[family-name:var(--font-display)] font-bold text-[#34364A] ${motion}`}
        style={{ fontSize, lineHeight: 0.9 }}
        aria-live="polite"
      >
        {label}
      </p>
      {hint ? (
        <p className="mt-1 text-lg font-semibold text-[#7657E8]">{hint}</p>
      ) : null}
    </div>
  );
}

function StarBurst({ compact }: { compact?: boolean }) {
  const bits = compact
    ? ["⭐", "✨", "✦", "⭐", "✨", "✦"]
    : ["⭐", "✨", "✦", "⭐", "✨", "✦", "⭐", "✨"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {bits.map((bit, index) => {
        const angle = (index / bits.length) * Math.PI * 2;
        const dx = `${Math.cos(angle) * 90}px`;
        const dy = `${Math.sin(angle) * 70}px`;
        return (
          <span
            key={index}
            className="particle absolute top-1/2 left-1/2 text-2xl"
            style={{ ["--dx" as string]: dx, ["--dy" as string]: dy }}
          >
            {bit}
          </span>
        );
      })}
    </div>
  );
}
