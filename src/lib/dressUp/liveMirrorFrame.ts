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
  /** Face height as a fraction of the video frame height (framing metric). */
  faceHeightRatio: number | null;
  /** Costume was painted this frame (tracked or portrait fallback). */
  costumeDrawn: boolean;
  /** True when a person cutout was composited this frame. */
  personCutoutUsed: boolean;
};

/**
 * Ideal standing-mirror face height ≈ 25–35% of frame height.
 * Above this ratio the child is too close for complete accessories.
 */
export const FACE_TOO_CLOSE_HEIGHT_RATIO = 0.38;

/** Comfortable fallback face size (~30% of the shorter video side). */
export const PORTRAIT_FALLBACK_FACE_RATIO = 0.3;

/** True when face height dominates the frame (selfie-close). */
export function isFaceTooClose(
  faceHeight: number,
  videoHeight: number,
  threshold = FACE_TOO_CLOSE_HEIGHT_RATIO,
): boolean {
  if (videoHeight <= 0 || faceHeight <= 0) return false;
  return faceHeight / videoHeight > threshold;
}

/** Centered pose so costumes still appear when tracking is cold (farther back). */
export function portraitFallbackPose(
  videoW: number,
  videoH: number,
  pad = 0,
): FacePose {
  const faceW = Math.min(videoW, videoH) * PORTRAIT_FALLBACK_FACE_RATIO;
  const faceH = faceW * 1.15;
  const cx = pad + videoW / 2;
  const cy = pad + videoH * 0.42;
  const eyeSpan = faceW * 0.38;
  return {
    cx,
    cy,
    width: faceW,
    height: faceH,
    rotation: 0,
    crownY: cy - faceH * 0.42,
    leftEyeX: cx - eyeSpan / 2,
    leftEyeY: cy - faceH * 0.08,
    rightEyeX: cx + eyeSpan / 2,
    rightEyeY: cy - faceH * 0.08,
    eyeSpan,
    shoulderCx: cx,
    shoulderCy: cy + faceH * 0.72,
    shoulderWidth: faceW * 2.15,
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
  /** 0–1 pop when the association accessory changes. */
  costumeEntrance?: number;
  /** Extra vertical bob in face-height units (juice sip, drum bounce). */
  costumeActionBob?: number;
  /** Optional shoulder override from Pose Landmarker (jacket). */
  shoulderOverride?: {
    cx: number;
    cy: number;
    width: number;
    rotation?: number;
  } | null;
  /**
   * Optional person cutout (alpha-masked video). When present, the full-frame
   * rectangular video is skipped and this layer is drawn instead so ambient
   * worlds can sit behind the real child.
   */
  personCutout?: CanvasImageSource | null;
  /**
   * Drawn after the stage fill and before the camera/person layer.
   * Use for immersive ambient worlds when person cutout is active.
   */
  drawBackdrop?: (
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
  ) => void;
  /**
   * When true (lesson Hybrid Mirror), hide wearables if the face leaves the
   * frame. Dress-Up keeps a portrait fallback so the wardrobe stays visible.
   */
  requireFaceForCostume?: boolean;
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
    costumeEntrance = 1,
    costumeActionBob = 0,
    shoulderOverride = null,
    personCutout = null,
    drawBackdrop,
    requireFaceForCostume = false,
  } = opts;

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    return {
      detected: false,
      pose: null,
      tooClose: false,
      faceHeightRatio: null,
      costumeDrawn: false,
      personCutoutUsed: false,
    };
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
    return {
      detected: false,
      pose: null,
      tooClose: false,
      faceHeightRatio: null,
      costumeDrawn: false,
      personCutoutUsed: false,
    };
  }

  // Stage backdrop (visible when costumes extend into padding)
  ctx.fillStyle = stageFill;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const useCutout = Boolean(personCutout);
  if (useCutout && drawBackdrop) {
    drawBackdrop(ctx, canvasW, canvasH);
  }

  // Layer 1 — full-frame live camera (mirrored). No digital zoom / face crop.
  ctx.save();
  ctx.translate(pad + w, pad);
  ctx.scale(-1, 1);
  if (useCutout && personCutout) {
    ctx.drawImage(personCutout, 0, 0, w, h);
  } else {
    ctx.drawImage(video, 0, 0, w, h);
  }
  ctx.restore();

  let pose: FacePose | null = null;
  let detected = false;
  let tooClose = false;
  let faceHeightRatio: number | null = null;
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
          faceHeightRatio = smoothed.height / h;
          tooClose = isFaceTooClose(smoothed.height, h);
          pose = {
            ...smoothed,
            cx: smoothed.cx + pad,
            cy: smoothed.cy + pad,
            crownY: smoothed.crownY + pad,
            leftEyeX: smoothed.leftEyeX + pad,
            leftEyeY: smoothed.leftEyeY + pad,
            rightEyeX: smoothed.rightEyeX + pad,
            rightEyeY: smoothed.rightEyeY + pad,
            shoulderCx: smoothed.shoulderCx + pad,
            shoulderCy: smoothed.shoulderCy + pad,
          };
        }
      } else {
        smoother.reset();
      }
    } catch {
      smoother.reset();
    }
  }

  // Track when we have a face. Optional portrait fallback when tracking is cold
  // (no landmarker yet). When requireFaceForCostume, hide overlays if the child
  // left the frame so ambient worlds keep running alone.
  const mayDrawCostume =
    Boolean(costume && costumeImage) &&
    (detected || !requireFaceForCostume || !landmarker);

  if (mayDrawCostume && costume && costumeImage) {
    let drawPose = pose ?? portraitFallbackPose(w, h, pad);
    if (shoulderOverride) {
      drawPose = {
        ...drawPose,
        shoulderCx: shoulderOverride.cx + (pose ? pad : 0),
        shoulderCy: shoulderOverride.cy + (pose ? pad : 0),
        shoulderWidth: shoulderOverride.width,
        rotation: shoulderOverride.rotation ?? drawPose.rotation,
      };
    }
    const mirrored = pose ? mirrorFacePose(drawPose, canvasW) : drawPose;
    drawCostumeOverlay(ctx, mirrored, costume, costumeImage, {
      nowMs: performance.now(),
      animate: true,
      entrance: costumeEntrance,
      actionBob: costumeActionBob,
      canvasW,
      canvasH,
    });
    costumeDrawn = true;
  }

  return {
    detected,
    pose,
    tooClose,
    faceHeightRatio,
    costumeDrawn,
    personCutoutUsed: useCutout,
  };
}
