/**
 * Shared per-frame draw for Magic Dress-Up and Learning Mirror.
 * Three independent layers:
 *   1. Live camera video (mirrored)
 *   2. Face-tracked costume overlay
 *   3. Optional typing / celebration effects (caller draws after)
 *
 * Never freezes the video — callers must invoke this every animation frame
 * while the session is live. Mood/celebration must not skip drawImage.
 */

import type { OverlayCostume } from "@/lib/dressUp/faceOverlay";
import { drawCostumeOverlay } from "@/lib/dressUp/faceOverlay";
import type { FacePose } from "@/lib/dressUp/facePose";
import { facePoseFromLandmarks, mirrorFacePose } from "@/lib/dressUp/facePose";
import type { FacePoseSmoother } from "@/lib/dressUp/smoothing";

export type LiveMirrorLandmarker = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => { faceLandmarks: Array<Array<{ x: number; y: number; z?: number }>> };
};

export type LiveMirrorFrameResult = {
  detected: boolean;
  pose: FacePose | null;
  /** True when the face fills most of the frame — child should move back. */
  tooClose: boolean;
};

export function drawLiveMirrorFrame(opts: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  landmarker: LiveMirrorLandmarker | null;
  smoother: FacePoseSmoother;
  costume: OverlayCostume | null;
  costumeImage: CanvasImageSource | null;
  /**
   * Extra canvas padding around the video as a fraction of min(videoW, videoH).
   * Gives hats/petals headroom without digitally zooming the camera.
   */
  stagePad?: number;
  /** Fill color for the padded stage around the video. */
  stageFill?: string;
}): LiveMirrorFrameResult {
  const {
    video,
    canvas,
    landmarker,
    smoother,
    costume,
    costumeImage,
    stagePad = 0,
    stageFill = "#1a1a2e",
  } = opts;

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return { detected: false, pose: null, tooClose: false };

  const pad = Math.round(Math.min(w, h) * Math.max(0, stagePad));
  const canvasW = w + pad * 2;
  const canvasH = h + pad * 2;
  if (canvas.width !== canvasW || canvas.height !== canvasH) {
    canvas.width = canvasW;
    canvas.height = canvasH;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return { detected: false, pose: null, tooClose: false };

  // Stage backdrop (visible when costumes extend into padding)
  ctx.fillStyle = stageFill;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Layer 1 — continuous live camera (mirrored) inside the padded inset
  ctx.save();
  ctx.translate(pad + w, pad);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  let pose: FacePose | null = null;
  let detected = false;
  let tooClose = false;

  // Layer 2 — face-tracked costume
  if (landmarker && costume) {
    try {
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.faceLandmarks[0];
      if (landmarks) {
        const raw = facePoseFromLandmarks(landmarks, w, h);
        const smoothed = smoother.next(raw);
        if (smoothed) {
          detected = true;
          tooClose = smoothed.width > w * 0.58;
          const inCanvas: FacePose = {
            ...smoothed,
            cx: smoothed.cx + pad,
            cy: smoothed.cy + pad,
            crownY: smoothed.crownY + pad,
          };
          pose = inCanvas;
          drawCostumeOverlay(
            ctx,
            mirrorFacePose(inCanvas, canvasW),
            costume,
            costumeImage,
          );
        }
      } else {
        smoother.reset();
      }
    } catch {
      smoother.reset();
    }
  }

  return { detected, pose, tooClose };
}
