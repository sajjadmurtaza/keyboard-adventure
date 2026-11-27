/**
 * Optional Pose Landmarker for upper-body wearables (jacket).
 * Lazy-loaded only when a torso effect needs it and a local model is present.
 * Never uploads frames. Falls back to face-derived shoulders when unavailable.
 */

import { LOCAL_MEDIAPIPE_PATHS } from "@/lib/dressUp/privacy";

export type PoseShoulders = {
  cx: number;
  cy: number;
  width: number;
  rotation: number;
};

export type PoseLandmarkerHandle = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => PoseShoulders | null;
  close: () => void;
};

let posePromise: Promise<PoseLandmarkerHandle | null> | null = null;

/**
 * Probe whether a locally hosted pose model exists (no CDN fetch).
 * Jacket try-on stays on face-derived shoulders until this file is present.
 */
export async function poseModelAvailable(): Promise<boolean> {
  try {
    const res = await fetch(LOCAL_MEDIAPIPE_PATHS.poseModel, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Create a pose landmarker if the local model is bundled.
 * Returns null when the model is missing — callers must keep face-shoulder fallback.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarkerHandle | null> {
  if (posePromise) return posePromise;
  posePromise = (async () => {
    if (!(await poseModelAvailable())) return null;
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const wasm = await vision.FilesetResolver.forVisionTasks(
        LOCAL_MEDIAPIPE_PATHS.wasmRoot,
      );
      const landmarker = await vision.PoseLandmarker.createFromOptions(wasm, {
        baseOptions: {
          modelAssetPath: LOCAL_MEDIAPIPE_PATHS.poseModel,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      return {
        detectForVideo(video, timestampMs) {
          const result = landmarker.detectForVideo(video, timestampMs);
          const lm = result.landmarks?.[0];
          if (!lm || lm.length < 13) return null;
          // BlazePose: 11 left shoulder, 12 right shoulder
          const left = lm[11];
          const right = lm[12];
          if (!left || !right) return null;
          const w = video.videoWidth;
          const h = video.videoHeight;
          const lx = left.x * w;
          const ly = left.y * h;
          const rx = right.x * w;
          const ry = right.y * h;
          return {
            cx: (lx + rx) / 2,
            cy: (ly + ry) / 2,
            width: Math.hypot(rx - lx, ry - ly) * 1.35,
            rotation: Math.atan2(ry - ly, rx - lx),
          };
        },
        close() {
          try {
            landmarker.close();
          } catch {
            /* ignore */
          }
        },
      };
    } catch {
      return null;
    }
  })();
  return posePromise;
}

export function resetPoseLandmarkerCache(): void {
  posePromise = null;
}
