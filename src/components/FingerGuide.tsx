"use client";

import { fingerHint } from "@/utils/keys";

type FingerGuideProps = {
  target: string;
  enabled: boolean;
  compact?: boolean;
  centerX?: number | null;
};

export function FingerGuide({
  target,
  enabled,
  compact = false,
  centerX = null,
}: FingerGuideProps) {
  if (!enabled) return null;
  const hint = fingerHint(target);
  const aligned = centerX != null;

  return (
    <div
      className="finger-guide pointer-events-none mt-1 flex flex-col items-center"
      data-testid="finger-guide"
      data-hand={hint.hand}
      style={
        aligned
          ? { position: "absolute", left: centerX, transform: "translateX(-50%)", top: 0 }
          : undefined
      }
    >
      <p className="text-lg leading-none text-[#7657E8]" aria-hidden>
        ↑
      </p>
      <HandIcon hand={hint.hand} compact={compact} />
      <p
        className={`font-[family-name:var(--font-display)] font-semibold text-[#7657E8] ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {hint.label}
      </p>
    </div>
  );
}

function HandIcon({ hand, compact }: { hand: "left" | "right" | "thumbs"; compact: boolean }) {
  const size = compact ? 28 : 36;
  if (hand === "thumbs") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="#FFE8A3" />
        <path
          d="M18 28c0-8 4-14 6-14s6 6 6 14v8H18z"
          fill="#F4C27A"
        />
        <circle cx="24" cy="16" r="5" fill="#F4C27A" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill={hand === "right" ? "#E8F4FF" : "#FFF0E8"} />
      <path
        d="M24 12c2 0 3 2 3 5v9h2V19c0-2 1.2-3 2.4-3s2.6 1 2.6 3v12c0 7-4 11-10 11s-10-4-10-11V22c0-2 1.2-3.2 2.5-3.2S19 20 19 22v4h2v-9c0-3 1-5 3-5z"
        fill="#F4C27A"
      />
    </svg>
  );
}
