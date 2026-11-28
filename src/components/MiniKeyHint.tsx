"use client";

import { displayKey } from "@/utils/keys";

export function MiniKeyHint({
  target,
  pulse,
  force = false,
  compact = false,
}: {
  target: string;
  pulse: boolean;
  /** 15s idle — bigger find-me pulse. */
  force?: boolean;
  compact?: boolean;
}) {
  const space = target === " ";
  const pulseClass = force ? "key-force" : pulse ? "key-glow" : "";
  return (
    <div className="flex flex-col items-center gap-0.5">
      {compact ? null : (
        <p className="text-sm font-semibold text-[#7657E8]">Find:</p>
      )}
      <div
        className={`flex items-center justify-center rounded-2xl border-4 border-[#7657E8] bg-[#FFD85A] font-[family-name:var(--font-display)] font-bold ${
          compact ? "h-[62px] text-xl" : "h-14 text-2xl"
        } ${space ? "min-w-32 px-5" : compact ? "w-[62px]" : "w-14"} ${pulseClass}`}
      >
        {displayKey(target)}
      </div>
    </div>
  );
}
