/**
 * Shared per-frame draw for Magic Dress-Up and Learning Mirror.
 * Three independent layers:
 *   1. Live camera video (mirrored), with optional face-centered framing
 *   2. Face-tracked costume overlay (same framing transform)
 *   3. Optional typing / celebration effects (caller draws after)
 *
 * Never freezes the video — callers must invoke this every animation frame
 * while the session is live. Mood/celebration must not skip drawImage.
 */

import type { OverlayCostume } from "@/lib/dressUp/faceOverlay";
import { drawCostumeOverlay } from "@/lib/dressUp/faceOverlay";
import type { FacePose } from "@/lib/dressUp/facePose";
import { facePoseFromLandmarks } from "@/lib/dressUp/facePose";
import type { FacePoseSmoother } from "@/lib/dressUp/smoothing";

export type LiveMirrorLandmarker = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => { faceLandmarks: Array<Array<{ x: number; y: number; z?: number }>> };
};

export type LiveMirrorFrameResult = {
  detected: boolean;
  /** Pose in final canvas space (mirrored + framed) for overlays / ambient. */
  pose: FacePose | null;
  /** True when the face is so close zoom-out cannot recover — step back. */
  tooClose: boolean;
  /** True when the face is so far zoom-in cannot recover — step closer. */
  tooFar: boolean;
  /** Face height as a fraction of the video frame height (raw, pre-zoom). */
  faceHeightRatio: number | null;
  /** Costume was painted this frame (tracked or portrait fallback). */
  costumeDrawn: boolean;
  /** True when a person cutout was composited this frame. */
  personCutoutUsed: boolean;
  /** Smoothed digital zoom applied this frame (1 = full frame). */
  zoom: number;
};

/**
 * Comfortable standing-mirror face height (~30% of frame).
 * Adaptive zoom aims here so hats/props stay readable near or far.
 */
export const IDEAL_FACE_HEIGHT_RATIO = 0.3;

/**
 * Raw face-height ratio above which even max zoom-out cannot fit accessories.
 * @deprecated Prefer MirrorFramingSmoother / result.tooClose — kept for tests.
 */
export const FACE_TOO_CLOSE_HEIGHT_RATIO = 0.42;

/** Raw face-height ratio below which even max zoom-in leaves the child tiny. */
export const FACE_TOO_FAR_HEIGHT_RATIO = 0.11;

/** Zoom out slightly when selfie-close so crowns / petals still fit. */
export const MIRROR_ZOOM_MIN = 0.72;

/** Zoom in when the child stands farther back. */
export const MIRROR_ZOOM_MAX = 2.45;

/** Comfortable fallback face size (~30% of the shorter video side). */
export const PORTRAIT_FALLBACK_FACE_RATIO = 0.3;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Target digital zoom so face height ≈ ideal ratio of the video frame. */
export function computeMirrorZoom(
  faceHeightRatio: number,
  minZoom = MIRROR_ZOOM_MIN,
  maxZoom = MIRROR_ZOOM_MAX,
  ideal = IDEAL_FACE_HEIGHT_RATIO,
): number {
  if (faceHeightRatio <= 0) return 1;
  return clamp(ideal / faceHeightRatio, minZoom, maxZoom);
}

/** True when face height dominates the frame (selfie-close), pre-zoom. */
export function isFaceTooClose(
  faceHeight: number,
  videoHeight: number,
  threshold = FACE_TOO_CLOSE_HEIGHT_RATIO,
): boolean {
  if (videoHeight <= 0 || faceHeight <= 0) return false;
  return faceHeight / videoHeight > threshold;
}

/** True when the face is a tiny speck — come closer (pre-zoom). */
export function isFaceTooFar(
  faceHeight: number,
  videoHeight: number,
  threshold = FACE_TOO_FAR_HEIGHT_RATIO,
): boolean {
  if (videoHeight <= 0 || faceHeight <= 0) return false;
  return faceHeight / videoHeight < threshold;
}

export type MirrorFraming = {
  zoom: number;
  /** Face focus X in unmirrored video pixels. */
  focusX: number;
  /** Face focus Y in unmirrored video pixels. */
  focusY: number;
  faceHeightRatio: number | null;
  tooClose: boolean;
  tooFar: boolean;
};

/**
 * Smooth face-centered zoom/pan so distance changes feel calm, not jumpy.
 */
export class MirrorFramingSmoother {
  private zoom = 1;
  private focusX = 0;
  private focusY = 0;
  private ready = false;

  constructor(private readonly alpha = 0.16) {}

  reset(): void {
    this.zoom = 1;
    this.focusX = 0;
    this.focusY = 0;
    this.ready = false;
  }

  next(
    face: { cx: number; cy: number; height: number } | null,
    videoW: number,
    videoH: number,
  ): MirrorFraming {
    const faceHeightRatio =
      face && videoH > 0 ? face.height / videoH : null;
    const targetZoom =
      faceHeightRatio && faceHeightRatio > 0
        ? computeMirrorZoom(faceHeightRatio)
        : 1;
    const targetFocusX = face ? face.cx : videoW / 2;
    const targetFocusY = face ? face.cy : videoH * 0.42;

    if (!this.ready) {
      this.zoom = targetZoom;
      this.focusX = targetFocusX;
      this.focusY = targetFocusY;
      this.ready = true;
    } else {
      const a = this.alpha;
      this.zoom += (targetZoom - this.zoom) * a;
      if (face) {
        this.focusX += (targetFocusX - this.focusX) * a;
        this.focusY += (targetFocusY - this.focusY) * a;
      } else {
        // No face — ease back toward a neutral full frame.
        this.zoom += (1 - this.zoom) * a * 0.5;
        this.focusX += (videoW / 2 - this.focusX) * a * 0.35;
        this.focusY += (videoH * 0.42 - this.focusY) * a * 0.35;
      }
    }

    return {
      zoom: this.zoom,
      focusX: this.focusX,
      focusY: this.focusY,
      faceHeightRatio,
      tooClose:
        faceHeightRatio != null &&
        isFaceTooClose(faceHeightRatio * videoH, videoH),
      tooFar:
        faceHeightRatio != null &&
        isFaceTooFar(faceHeightRatio * videoH, videoH),
    };
  }
}

/** Map one video-space point through mirror + face-centered zoom into canvas space. */
export function mapVideoPointToCanvas(
  x: number,
  y: number,
  videoW: number,
  pad: number,
  zoom: number,
  focusVideoX: number,
  focusVideoY: number,
): { x: number; y: number } {
  const focusMirX = videoW - focusVideoX;
  const focusMirY = focusVideoY;
  const mirX = videoW - x;
  const mirY = y;
  return {
    x: pad + focusMirX + (mirX - focusMirX) * zoom,
    y: pad + focusMirY + (mirY - focusMirY) * zoom,
  };
}

/** Map a full face pose into final canvas space (mirrored + framed). */
export function mapVideoPoseToCanvas(
  pose: FacePose,
  videoW: number,
  pad: number,
  zoom: number,
  focusVideoX: number,
  focusVideoY: number,
): FacePose {
  const map = (x: number, y: number) =>
    mapVideoPointToCanvas(x, y, videoW, pad, zoom, focusVideoX, focusVideoY);
  const c = map(pose.cx, pose.cy);
  const crown = map(pose.cx, pose.crownY);
  const leftEye = map(pose.leftEyeX, pose.leftEyeY);
  const rightEye = map(pose.rightEyeX, pose.rightEyeY);
  // Mirror swaps eyes (subject's left appears on viewer's right).
  const shoulder = map(pose.shoulderCx, pose.shoulderCy);
  return {
    cx: c.x,
    cy: c.y,
    width: pose.width * zoom,
    height: pose.height * zoom,
    rotation: -pose.rotation,
    crownY: crown.y,
    leftEyeX: rightEye.x,
    leftEyeY: rightEye.y,
    rightEyeX: leftEye.x,
    rightEyeY: leftEye.y,
    eyeSpan: pose.eyeSpan * zoom,
    shoulderCx: shoulder.x,
    shoulderCy: shoulder.y,
    shoulderWidth: pose.shoulderWidth * zoom,
  };
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
  /** Optional shoulder override from Pose Landmarker (jacket) — video space. */
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
  /**
   * Smooth face-centered zoom/pan. When omitted, framing stays 1× full frame
   * (unit tests / callers that want the raw camera).
   */
  framing?: MirrorFramingSmoother | null;
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
    framing = null,
  } = opts;

  const empty = (): LiveMirrorFrameResult => ({
    detected: false,
    pose: null,
    tooClose: false,
    tooFar: false,
    faceHeightRatio: null,
    costumeDrawn: false,
    personCutoutUsed: false,
    zoom: 1,
  });

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return empty();

  const pad = Math.round(Math.min(w, h) * Math.max(0, stagePad));
  const canvasW = w + pad * 2;
  const canvasH = h + pad * 2;
  if (canvas.width !== canvasW || canvas.height !== canvasH) {
    canvas.width = canvasW;
    canvas.height = canvasH;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return empty();

  // Detect face first so framing can follow it this frame.
  let videoPose: FacePose | null = null;
  let detected = false;
  if (landmarker) {
    try {
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.faceLandmarks[0];
      if (landmarks) {
        const raw = facePoseFromLandmarks(landmarks, w, h);
        const smoothed = smoother.next(raw);
        if (smoothed) {
          detected = true;
          videoPose = smoothed;
        }
      } else {
        smoother.reset();
      }
    } catch {
      smoother.reset();
    }
  }

  const framingState = framing
    ? framing.next(
        videoPose
          ? { cx: videoPose.cx, cy: videoPose.cy, height: videoPose.height }
          : null,
        w,
        h,
      )
    : {
        zoom: 1,
        focusX: videoPose?.cx ?? w / 2,
        focusY: videoPose?.cy ?? h * 0.42,
        faceHeightRatio: videoPose ? videoPose.height / h : null,
        tooClose: videoPose ? isFaceTooClose(videoPose.height, h) : false,
        tooFar: videoPose ? isFaceTooFar(videoPose.height, h) : false,
      };

  const { zoom, focusX, focusY } = framingState;

  // Stage backdrop (visible in pad + when zoomed out)
  ctx.fillStyle = stageFill;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const useCutout = Boolean(personCutout);
  if (useCutout && drawBackdrop) {
    drawBackdrop(ctx, canvasW, canvasH);
  }

  // Layer 1 — live camera (mirrored), face-centered zoom/pan when framing is on.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, canvasW, canvasH);
  ctx.clip();
  ctx.translate(pad + w, pad);
  ctx.scale(-1, 1);
  const focusMirX = w - focusX;
  const focusMirY = focusY;
  ctx.translate(focusMirX, focusMirY);
  ctx.scale(zoom, zoom);
  ctx.translate(-focusMirX, -focusMirY);
  if (useCutout && personCutout) {
    ctx.drawImage(personCutout, 0, 0, w, h);
  } else {
    ctx.drawImage(video, 0, 0, w, h);
  }
  ctx.restore();

  let pose: FacePose | null = null;
  if (videoPose) {
    pose = mapVideoPoseToCanvas(videoPose, w, pad, zoom, focusX, focusY);
  }

  // Track when we have a face. Optional portrait fallback when tracking is cold
  // (no landmarker yet). When requireFaceForCostume, hide overlays if the child
  // left the frame so ambient worlds keep running alone.
  const mayDrawCostume =
    Boolean(costume && costumeImage) &&
    (detected || !requireFaceForCostume || !landmarker);

  let costumeDrawn = false;
  if (mayDrawCostume && costume && costumeImage) {
    let drawPose =
      pose ??
      portraitFallbackPose(w, h, pad);
    if (shoulderOverride) {
      const shoulderMapped = mapVideoPointToCanvas(
        shoulderOverride.cx,
        shoulderOverride.cy,
        w,
        pad,
        zoom,
        focusX,
        focusY,
      );
      drawPose = {
        ...drawPose,
        shoulderCx: shoulderMapped.x,
        shoulderCy: shoulderMapped.y,
        shoulderWidth: shoulderOverride.width * zoom,
        rotation:
          shoulderOverride.rotation != null
            ? -shoulderOverride.rotation
            : drawPose.rotation,
      };
    }
    drawCostumeOverlay(ctx, drawPose, costume, costumeImage, {
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
    tooClose: framingState.tooClose,
    tooFar: framingState.tooFar,
    faceHeightRatio: framingState.faceHeightRatio,
    costumeDrawn,
    personCutoutUsed: useCutout,
    zoom,
  };
}
