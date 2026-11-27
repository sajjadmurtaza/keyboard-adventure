/**
 * Development-only Magic Mirror performance diagnostics.
 * Never records frames, landmarks, names, or network telemetry.
 */

export type DressUpPerfDelegate = "GPU" | "CPU" | "none" | "unknown";

export type DressUpPerfSnapshot = {
  startKind: "cold" | "warm" | "unknown";
  cameraMs: number | null;
  modelMs: number | null;
  totalStartMs: number | null;
  videoWidth: number | null;
  videoHeight: number | null;
  delegate: DressUpPerfDelegate;
  fps: number | null;
  detectAvgMs: number | null;
  detectP95Ms: number | null;
  detectSamples: number;
  framesDrawn: number;
  detectsRun: number;
  /** Frames where the loop ran but detection was skipped (e.g. video not ready). */
  framesWithoutDetect: number;
  costumeSwitchMs: number | null;
  cleanupMs: number | null;
  tracksAliveAfterStop: boolean | null;
};

const DETECT_RING = 180;

export function isDressUpPerfEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function percentile(sortedAsc: number[], p: number): number | null {
  if (!sortedAsc.length) return null;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const rank = (Math.min(100, Math.max(0, p)) / 100) * (sortedAsc.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sortedAsc[lo];
  const t = rank - lo;
  return sortedAsc[lo]! * (1 - t) + sortedAsc[hi]! * t;
}

export function average(values: number[]): number | null {
  if (!values.length) return null;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/** Mutable session — one per Magic Dress-Up mount while diagnostics are enabled. */
export class DressUpPerfSession {
  private startKind: DressUpPerfSnapshot["startKind"] = "unknown";
  private cameraMs: number | null = null;
  private modelMs: number | null = null;
  private totalStartMs: number | null = null;
  private videoWidth: number | null = null;
  private videoHeight: number | null = null;
  private delegate: DressUpPerfDelegate = "unknown";
  private detectRing: number[] = [];
  private detectWrite = 0;
  private detectCount = 0;
  private framesDrawn = 0;
  private detectsRun = 0;
  private framesWithoutDetect = 0;
  private costumeSwitchMs: number | null = null;
  private cleanupMs: number | null = null;
  private tracksAliveAfterStop: boolean | null = null;
  private fpsWindowStart = 0;
  private fpsWindowFrames = 0;
  private fps: number | null = null;
  private startMark = 0;

  beginStart(kind: "cold" | "warm"): void {
    this.startKind = kind;
    this.startMark = performance.now();
    this.cameraMs = null;
    this.modelMs = null;
    this.totalStartMs = null;
    this.detectRing = [];
    this.detectWrite = 0;
    this.detectCount = 0;
    this.framesDrawn = 0;
    this.detectsRun = 0;
    this.framesWithoutDetect = 0;
    this.fpsWindowStart = 0;
    this.fpsWindowFrames = 0;
    this.fps = null;
  }

  noteCamera(ms: number): void {
    this.cameraMs = ms;
  }

  noteModel(ms: number, delegate: DressUpPerfDelegate): void {
    this.modelMs = ms;
    this.delegate = delegate;
  }

  noteLive(): void {
    if (this.startMark) {
      this.totalStartMs = performance.now() - this.startMark;
    }
  }

  noteVideoSize(width: number, height: number): void {
    if (width > 0 && height > 0) {
      this.videoWidth = width;
      this.videoHeight = height;
    }
  }

  noteFrame(opts: { detected: boolean; detectMs?: number }): void {
    const now = performance.now();
    this.framesDrawn += 1;
    if (!this.fpsWindowStart) {
      this.fpsWindowStart = now;
      this.fpsWindowFrames = 0;
    }
    this.fpsWindowFrames += 1;
    const elapsed = now - this.fpsWindowStart;
    if (elapsed >= 1000) {
      this.fps = (this.fpsWindowFrames * 1000) / elapsed;
      this.fpsWindowStart = now;
      this.fpsWindowFrames = 0;
    }

    if (!opts.detected) {
      this.framesWithoutDetect += 1;
      return;
    }
    this.detectsRun += 1;
    if (typeof opts.detectMs === "number" && Number.isFinite(opts.detectMs)) {
      if (this.detectRing.length < DETECT_RING) {
        this.detectRing.push(opts.detectMs);
      } else {
        this.detectRing[this.detectWrite] = opts.detectMs;
      }
      this.detectWrite = (this.detectWrite + 1) % DETECT_RING;
      this.detectCount = Math.min(this.detectCount + 1, DETECT_RING);
    }
  }

  noteCostumeSwitch(ms: number): void {
    this.costumeSwitchMs = ms;
  }

  noteCleanup(ms: number, tracksAlive: boolean): void {
    this.cleanupMs = ms;
    this.tracksAliveAfterStop = tracksAlive;
  }

  snapshot(): DressUpPerfSnapshot {
    const samples = this.detectRing.slice(0, this.detectCount).sort((a, b) => a - b);
    return {
      startKind: this.startKind,
      cameraMs: this.cameraMs,
      modelMs: this.modelMs,
      totalStartMs: this.totalStartMs,
      videoWidth: this.videoWidth,
      videoHeight: this.videoHeight,
      delegate: this.delegate,
      fps: this.fps,
      detectAvgMs: average(samples),
      detectP95Ms: percentile(samples, 95),
      detectSamples: samples.length,
      framesDrawn: this.framesDrawn,
      detectsRun: this.detectsRun,
      framesWithoutDetect: this.framesWithoutDetect,
      costumeSwitchMs: this.costumeSwitchMs,
      cleanupMs: this.cleanupMs,
      tracksAliveAfterStop: this.tracksAliveAfterStop,
    };
  }

  /** Safe for console — numbers and enums only. */
  log(label = "[MagicMirrorPerf]"): void {
    console.info(label, this.snapshot());
  }
}

/** Measure costume change → next paint; keep impure timing out of React render. */
export function measureCostumeSwitchPaint(
  session: DressUpPerfSession,
  onDone?: (snapshot: DressUpPerfSnapshot) => void,
): void {
  const switchStart = performance.now();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      session.noteCostumeSwitch(performance.now() - switchStart);
      onDone?.(session.snapshot());
    });
  });
}

export function formatPerfMs(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "—";
  return `${ms < 10 ? ms.toFixed(1) : Math.round(ms)}ms`;
}

export function formatPerfFps(fps: number | null): string {
  if (fps === null || !Number.isFinite(fps)) return "—";
  return `${fps.toFixed(0)} fps`;
}
