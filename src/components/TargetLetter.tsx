"use client";

import { displayKey, tinyHint } from "@/utils/keys";

type TargetLetterProps = {
  target: string;
  mood: "idle" | "success" | "retry";
  reducedMotion: boolean;
  burst: boolean;
  burstLevel?: 1 | 2 | 3;
  size?: "desktop" | "mobile" | "compact" | "stage";
  /**
   * Accent from the shown association (e.g. orange for Orange).
   * Letter stays black; this paints the outer glow / rim.
   */
  accentColor?: string | null;
};

/** Soft outer glow so the black letter picks up the object’s color. */
export function objectLetterGlow(
  accent: string | null | undefined,
  mood: "idle" | "success" | "retry",
): string {
  if (mood === "success") {
    return "0 8px 0 rgba(255, 216, 77, 0.55), 0 0 32px rgba(56, 217, 120, 0.45)";
  }
  if (mood === "retry") {
    return "0 0 28px rgba(255, 77, 94, 0.35)";
  }
  if (!accent) return "none";
  return [
    `0 0 10px ${accent}`,
    `0 0 22px color-mix(in srgb, ${accent} 85%, transparent)`,
    `0 0 40px color-mix(in srgb, ${accent} 55%, transparent)`,
    `0 5px 0 color-mix(in srgb, ${accent} 35%, transparent)`,
  ].join(", ");
}

export function TargetLetter({
  target,
  mood,
  reducedMotion,
  burst,
  burstLevel = 1,
  size = "desktop",
  accentColor = null,
}: TargetLetterProps) {
  const label = displayKey(target);
  const hint = tinyHint(target);
  const compact = size !== "desktop" && size !== "stage";
  const hud = size === "compact";
  const stage = size === "stage";
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
      ? "clamp(72px, 22vw, 96px)"
      : size === "mobile"
        ? "clamp(130px, 38vw, 185px)"
        : size === "stage"
          ? "clamp(110px, 20vh, 220px)"
          : "var(--target-size)";

  // Keep the glyph black; object color only lives outside as rim + glow.
  const letterColor =
    mood === "success"
      ? "text-[#38D978]"
      : mood === "retry"
        ? "text-[#7048D7]"
        : "text-[#303047]";

  const letterShadow = objectLetterGlow(accentColor, mood);
  const objectRim =
    mood === "idle" && accentColor
      ? {
          WebkitTextStroke: `0.09em ${accentColor}`,
          paintOrder: "stroke fill" as const,
        }
      : undefined;

  return (
    <div
      className={`target-wrapper relative z-[3] flex min-h-0 flex-col items-center justify-center ${
        stage ? "min-w-[2.75rem] shrink-0 px-1" : ""
      }`}
      data-testid="target-letter"
      data-accent={accentColor ?? ""}
    >
      {mood === "retry" ? <div className="target-halo-miss" /> : null}
      {mood === "success" ? <div className="target-halo-win" /> : null}
      {mood === "idle" && accentColor ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${accentColor} 45%, transparent) 0%, transparent 70%)`,
          }}
          aria-hidden
        />
      ) : null}
      {burst && !reducedMotion ? (
        <StarBurst compact={compact} level={hud ? 1 : burstLevel} />
      ) : null}
      {burst && !reducedMotion && !hud ? (
        <span className="star-fly absolute top-6 left-1/2 text-4xl" aria-hidden>
          ⭐
        </span>
      ) : null}
      <p
        className={`relative font-[family-name:var(--font-display)] font-bold ${letterColor} ${motion}`}
        style={{
          fontSize,
          lineHeight: 0.9,
          textShadow: letterShadow,
          ...objectRim,
        }}
        aria-live="polite"
      >
        {label}
      </p>
      {hud || stage ? null : (
        <p className={`mt-0.5 h-5 text-sm font-semibold leading-5 text-[#7657E8] ${hint ? "" : "invisible"}`}>
          {hint ?? "space"}
        </p>
      )}
    </div>
  );
}

function StarBurst({ compact, level }: { compact?: boolean; level: 1 | 2 | 3 }) {
  const count = compact ? 4 : level >= 3 ? 8 : 6;
  const bits = ["⭐", "🌟", "🌸", "🌼", "👍", "👏", "✨", "🎉"];
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
