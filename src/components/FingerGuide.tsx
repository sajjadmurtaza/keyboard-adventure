"use client";

import { fingerHint, type KeyboardLayoutId } from "@/utils/keyboardLayouts";

type FingerGuideProps = {
  target: string;
  enabled: boolean;
  layout?: KeyboardLayoutId;
  compact?: boolean;
  centerX?: number | null;
};

export function FingerGuide({
  target,
  enabled,
  layout = "en-us",
  compact = false,
  centerX = null,
}: FingerGuideProps) {
  if (!enabled) return null;
  const hint = fingerHint(target, layout);
  const aligned = centerX != null;

  return (
    <div
      className="finger-guide pointer-events-none flex max-w-[11rem] items-center justify-center gap-1 whitespace-nowrap"
      data-testid="finger-guide"
      data-hand={hint.hand}
      style={
        aligned
          ? { position: "absolute", left: centerX, transform: "translateX(-50%)", top: 0 }
          : undefined
      }
    >
      <span className="text-sm leading-none text-[#7657E8]" aria-hidden>
        ↑
      </span>
      <HandIcon hand={hint.hand} compact={compact} />
      <p
        className={`font-[family-name:var(--font-display)] font-semibold leading-none text-[#7657E8] ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        {hint.label}
      </p>
    </div>
  );
}

function HandIcon({ hand, compact }: { hand: "left" | "right" | "thumbs"; compact: boolean }) {
  const size = compact ? 22 : 26;
  if (hand === "thumbs") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="#FFE8A3" />
        <path d="M18 28c0-8 4-14 6-14s6 6 6 14v8H18z" fill="#F4C27A" />
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
