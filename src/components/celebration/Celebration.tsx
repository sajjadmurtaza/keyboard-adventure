"use client";

import { celebrationPlan, type CelebrationLevel } from "@/components/celebration/plan";

export function Celebration({
  level,
  compact = false,
  reducedMotion = false,
}: {
  level: CelebrationLevel;
  compact?: boolean;
  reducedMotion?: boolean;
}) {
  const bits = celebrationPlan(level, compact, reducedMotion);
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        level === "complete" ? "z-[1]" : "z-[2]"
      }`}
      data-testid={`celebration-${level}`}
      aria-hidden
    >
      {bits.map((bit) => (
        <span
          key={bit.id}
          className={
            bit.kind === "balloon"
              ? "party-balloon"
              : bit.kind === "confetti"
                ? "party-confetti"
                : "party-sparkle"
          }
          style={{
            left: bit.left,
            top: bit.top,
            fontSize: bit.size,
            animationDelay: `${bit.delay}s`,
            animationDuration: bit.duration ? `${bit.duration}s` : undefined,
            ["--spin" as string]: `${bit.spin}deg`,
          }}
        >
          {bit.emoji}
        </span>
      ))}
    </div>
  );
}
