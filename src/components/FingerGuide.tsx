"use client";

import { fingerHint } from "@/utils/keys";

type FingerGuideProps = {
  target: string;
  enabled: boolean;
};

export function FingerGuide({ target, enabled }: FingerGuideProps) {
  if (!enabled) return null;
  const hint = fingerHint(target);

  return (
    <div className="mt-1 flex flex-col items-center gap-0.5">
      <p className="text-xl" aria-hidden>
        ↑
      </p>
      <div className="flex items-end gap-16 text-4xl" aria-hidden>
        {hint.hand === "thumbs" ? (
          <>
            <span>👍</span>
            <span>👍</span>
          </>
        ) : (
          <>
            <span className={hint.hand === "left" ? "scale-125" : "opacity-30"}>
              👆
            </span>
            <span className={hint.hand === "right" ? "scale-125" : "opacity-30"}>
              👆
            </span>
          </>
        )}
      </div>
      <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#7657E8]">
        {hint.label.toUpperCase()}
      </p>
    </div>
  );
}
