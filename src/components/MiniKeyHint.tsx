"use client";

import { displayKey } from "@/utils/keys";

export function MiniKeyHint({
  target,
  pulse,
  compact = false,
}: {
  target: string;
  pulse: boolean;
  compact?: boolean;
}) {
  const space = target === " ";
  return (
    <div className="flex flex-col items-center gap-0.5">
      {compact ? null : (
        <p className="text-sm font-semibold text-[#7657E8]">Find:</p>
      )}
      <div
        className={`flex items-center justify-center rounded-2xl border-4 border-[#7657E8] bg-[#FFD85A] font-[family-name:var(--font-display)] font-bold ${
          compact ? "h-[62px] text-xl" : "h-14 text-2xl"
        } ${space ? "min-w-32 px-5" : compact ? "w-[62px]" : "w-14"} ${pulse ? "key-glow" : ""}`}
      >
        {displayKey(target)}
      </div>
    </div>
  );
}
