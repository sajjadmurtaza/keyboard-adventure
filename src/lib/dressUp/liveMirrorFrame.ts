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
  /** Costume was painted this frame (tracked or portrait fallback). */
  costumeDrawn: boolean;
};

/** Centered portrait pose so costumes still appear when tracking is cold. */
export function portraitFallbackPose(
  videoW: number,
  videoH: number,
  pad = 0,
): FacePose {
  const faceW = Math.min(videoW, videoH) * 0.44;
  const faceH = faceW * 1.15;
  const cx = pad + videoW / 2;
  const cy = pad + videoH * 0.48;
  return {
    cx,
    cy,
    width: faceW,
    height: faceH,
    rotation: 0,
    crownY: cy - faceH * 0.42,
  };
}

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
  if (!w || !h) {
    return { detected: false, pose: null, tooClose: false, costumeDrawn: false };
  }

  const pad = Math.round(Math.min(w, h) * Math.max(0, stagePad));
  const canvasW = w + pad * 2;
  const canvasH = h + pad * 2;
  if (canvas.width !== canvasW || canvas.height !== canvasH) {
    canvas.width = canvasW;
    canvas.height = canvasH;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { detected: false, pose: null, tooClose: false, costumeDrawn: false };
  }

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
  let costumeDrawn = false;

  // Layer 2 — face-tracked costume when possible
  if (landmarker) {
    try {
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.faceLandmarks[0];
      if (landmarks) {
        const raw = facePoseFromLandmarks(landmarks, w, h);
        const smoothed = smoother.next(raw);
        if (smoothed) {
          detected = true;
          tooClose = smoothed.width > w * 0.58;
          pose = {
            ...smoothed,
            cx: smoothed.cx + pad,
            cy: smoothed.cy + pad,
            crownY: smoothed.crownY + pad,
          };
        }
      } else {
        smoother.reset();
      }
    } catch {
      smoother.reset();
    }
  }

  // Always paint the association prop: track the face when we have it,
  // otherwise park a portrait-sized hood so kids still see Fish/Frog/Flower.
  if (costume && costumeImage) {
    const drawPose = pose ?? portraitFallbackPose(w, h, pad);
    drawCostumeOverlay(
      ctx,
      pose ? mirrorFacePose(drawPose, canvasW) : drawPose,
      costume,
      costumeImage,
    );
    costumeDrawn = true;
  }

  return { detected, pose, tooClose, costumeDrawn };
}
