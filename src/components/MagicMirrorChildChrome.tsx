"use client";

import type { MirrorChildStatus } from "@/lib/dressUp/mirrorChildStatus";

type MagicMirrorChildChromeProps = {
  status: MirrorChildStatus;
  showFaceGuide: boolean;
  reducedMotion: boolean;
};

/**
 * Child-facing status + face guide. No FPS/GPU/latency.
 * Renders from discrete app state (not per-frame metrics).
 */
export function MagicMirrorChildChrome({
  status,
  showFaceGuide,
  reducedMotion,
}: MagicMirrorChildChromeProps) {
  return (
    <>
      {showFaceGuide ? (
        <div
          className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center"
          data-testid="dress-up-face-guide"
          aria-hidden
        >
          <div
            className={`h-[58%] w-[72%] max-w-[16rem] rounded-[50%] border-[3px] border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(26,26,46,0.28)] ${
              reducedMotion ? "" : "mirror-face-guide-pulse"
            }`}
          />
        </div>
      ) : null}

      <p
        data-testid="dress-up-child-status"
        className="pointer-events-none absolute bottom-3 left-3 right-3 z-[6] rounded-full bg-white/92 px-4 py-2 text-center font-[family-name:var(--font-display)] text-base font-bold text-[#34364A] shadow-md sm:text-lg"
        role="status"
        aria-live="polite"
      >
        {status.line}
      </p>
    </>
  );
}
