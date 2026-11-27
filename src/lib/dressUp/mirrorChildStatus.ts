/**
 * Child-facing Magic Mirror copy — derived only from existing mirror UI state.
 * Never surfaces FPS, GPU, latency, or other diagnostics.
 */

export type MirrorChildPhase =
  | "idle"
  | "waking"
  | "magic-readying"
  | "live-looking"
  | "live-missing"
  | "cheer"
  | "resting"
  | "need-grown-up"
  | "error";

export type MirrorChildStatusInput = {
  mirror: "idle" | "starting" | "live" | "error";
  loadStep: number;
  faceMissing: boolean;
  cameraAllowedByParent: boolean;
  cheerLine: string | null;
  errorMessage: string | null;
  /** True briefly after Stop so kids see “resting” instead of a blank idle. */
  justStopped: boolean;
};

export type MirrorChildStatus = {
  phase: MirrorChildPhase;
  line: string;
};

export function mirrorChildStatus(input: MirrorChildStatusInput): MirrorChildStatus {
  if (input.cheerLine) {
    return { phase: "cheer", line: input.cheerLine };
  }

  if (input.mirror === "error") {
    const msg = input.errorMessage ?? "";
    if (/grown-up|parent|permission|not allowed|denied/i.test(msg)) {
      return { phase: "need-grown-up", line: "💛 Ask a grown-up for help" };
    }
    return {
      phase: "error",
      line: msg || "💛 Ask a grown-up for help",
    };
  }

  if (input.mirror === "starting") {
    if (input.loadStep <= 1) {
      return { phase: "waking", line: "🪄 Waking up your mirror…" };
    }
    return { phase: "magic-readying", line: "✨ Getting the magic ready…" };
  }

  if (input.mirror === "live") {
    if (input.faceMissing) {
      return { phase: "live-missing", line: "👋 Come into the mirror!" };
    }
    return { phase: "live-looking", line: "🌟 Looking magical!" };
  }

  if (input.justStopped) {
    return { phase: "resting", line: "💤 Mirror is resting" };
  }

  if (!input.cameraAllowedByParent) {
    return { phase: "need-grown-up", line: "💛 Ask a grown-up for help" };
  }

  return { phase: "idle", line: "✨ Magic is ready!" };
}
