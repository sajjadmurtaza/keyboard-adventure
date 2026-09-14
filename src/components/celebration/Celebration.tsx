"use client";

import { useMemo } from "react";
import { celebrationPlan, type CelebrationLevel } from "@/components/celebration/plan";

function partyClass(motion: string): string {
  if (motion === "still") return "party-still";
  if (motion === "balloon") return "party-balloon";
  if (motion === "fall") return "party-confetti";
  if (motion === "pop") return "celebration-pop";
  return "celebration-particle";
}

export function Celebration({
  level,
  compact = false,
  reducedMotion = false,
  seed = 1,
}: {
  level: CelebrationLevel;
  compact?: boolean;
  reducedMotion?: boolean;
  seed?: number;
}) {
  const bits = useMemo(
    () => celebrationPlan(level, compact, reducedMotion, seed),
    [level, compact, reducedMotion, seed],
  );
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      data-testid={`celebration-${level}`}
      aria-hidden
    >
      {bits.map((bit) => (
        <span
          key={bit.id}
          className={partyClass(bit.motion)}
          style={{
            left: bit.left,
            top: bit.top,
            fontSize: bit.size,
            animationDelay: `${bit.delay}s`,
            animationDuration: bit.duration ? `${bit.duration}s` : undefined,
            ["--x12" as string]: bit.x12,
            ["--y12" as string]: bit.y12,
            ["--x55" as string]: bit.x55,
            ["--y55" as string]: bit.y55,
            ["--x100" as string]: bit.x100,
            ["--y100" as string]: bit.y100,
            ["--rotate-start" as string]: `${bit.rotateStart}deg`,
            ["--rotate-end" as string]: `${bit.rotateEnd}deg`,
            ["--scale-peak" as string]: String(bit.scalePeak),
            ["--spin" as string]: `${bit.rotateEnd}deg`,
          }}
        >
          {bit.emoji}
        </span>
      ))}
    </div>
  );
}
