"use client";

import { EmojiBear } from "@/components/mascot/EmojiBear";
import type { MascotMood } from "@/components/mascot/types";

export type { MascotMood };

type MascotProps = {
  line: string;
  mood?: MascotMood;
  compact?: boolean;
  tiny?: boolean;
};

export function Mascot({
  line,
  mood = "idle",
  compact = false,
  tiny = false,
}: MascotProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <EmojiBear mood={mood} compact={compact} tiny={tiny} />
      {tiny ? null : (
        <p
          className={`max-w-sm rounded-[22px] bg-white font-[family-name:var(--font-display)] font-semibold text-[#34364A] shadow-[0_8px_24px_rgba(118,87,232,0.12)] ${
            compact ? "px-2 py-1 text-sm" : "px-4 py-2 text-lg"
          }`}
        >
          {line}
        </p>
      )}
    </div>
  );
}
