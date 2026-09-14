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
    <div className="mt-2 flex flex-col items-center gap-1">
      <div className="flex gap-10 text-4xl" aria-hidden>
        <span className={hint.hand === "left" ? "scale-125" : "opacity-40"}>
          👆
        </span>
        <span className={hint.hand === "thumbs" ? "scale-125" : "opacity-30"}>
          🖐️
        </span>
        <span className={hint.hand === "right" ? "scale-125" : "opacity-40"}>
          👆
        </span>
      </div>
      <p className="text-base font-semibold text-[#7657E8]">{hint.label}</p>
    </div>
  );
}
