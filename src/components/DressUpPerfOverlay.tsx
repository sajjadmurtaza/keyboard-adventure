"use client";

import {
  formatPerfFps,
  formatPerfMs,
  type DressUpPerfSnapshot,
} from "@/lib/dressUp/dressUpPerf";

type DressUpPerfOverlayProps = {
  snapshot: DressUpPerfSnapshot;
};

/** Dev-only HUD. Renders timing numbers — never frames or landmarks. */
export function DressUpPerfOverlay({ snapshot }: DressUpPerfOverlayProps) {
  const res =
    snapshot.videoWidth && snapshot.videoHeight
      ? `${snapshot.videoWidth}×${snapshot.videoHeight}`
      : "—";

  return (
    <aside
      data-testid="dress-up-perf"
      className="pointer-events-none absolute left-2 top-2 z-10 max-w-[min(100%,14rem)] rounded-lg bg-black/70 px-2 py-1.5 text-left font-mono text-[10px] leading-snug text-[#B8F5C8] shadow-md"
      aria-hidden
    >
      <div className="mb-0.5 font-bold text-[#FFD85A]">Mirror perf (dev)</div>
      <div>
        start {snapshot.startKind} · {formatPerfMs(snapshot.totalStartMs)}
      </div>
      <div>
        cam {formatPerfMs(snapshot.cameraMs)} · model {formatPerfMs(snapshot.modelMs)}
      </div>
      <div>
        {snapshot.delegate} · {res} · {formatPerfFps(snapshot.fps)}
      </div>
      <div>
        detect avg {formatPerfMs(snapshot.detectAvgMs)} · p95{" "}
        {formatPerfMs(snapshot.detectP95Ms)}
      </div>
      <div>
        n={snapshot.detectSamples} · skip {snapshot.framesWithoutDetect}
      </div>
      <div>switch {formatPerfMs(snapshot.costumeSwitchMs)}</div>
      {snapshot.cleanupMs !== null ? (
        <div>
          stop {formatPerfMs(snapshot.cleanupMs)}
          {snapshot.tracksAliveAfterStop ? " · TRACKS LIVE" : " · tracks off"}
        </div>
      ) : null}
    </aside>
  );
}
