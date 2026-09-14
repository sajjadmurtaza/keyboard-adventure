"use client";

import { displayKey } from "@/utils/keys";

export function MiniKeyHint({
  target,
  pulse,
}: {
  target: string;
  pulse: boolean;
}) {
  const space = target === " ";
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-semibold text-[#7657E8]">Find:</p>
      <div
        className={`flex h-14 items-center justify-center rounded-2xl border-4 border-[#7657E8] bg-[#FFD85A] font-[family-name:var(--font-display)] text-2xl font-bold ${
          space ? "min-w-40 px-6" : "w-14"
        } ${pulse ? "key-glow" : ""}`}
      >
        {displayKey(target)}
      </div>
    </div>
  );
}
