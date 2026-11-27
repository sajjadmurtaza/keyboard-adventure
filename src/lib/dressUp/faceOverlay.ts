import type { DressUpAnchor, DressUpCostume } from "@/data/dressUpCostumes";
import type { FacePose } from "@/lib/dressUp/facePose";

export type { FacePose };

/** Minimal costume layout — dress-up and lesson-mirror share this. */
export type OverlayCostume = {
  scale: number;
  offsetY: number;
  /** Optional horizontal shift as a fraction of face width (positive = toward subject's right). */
  offsetX?: number;
  anchor: DressUpAnchor;
};

/** @deprecated Prefer facePoseFromLandmarks — kept for older tests */
export type FaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  crownY: number;
};

export {
  facePoseFromLandmarks,
  mirrorFacePose,
} from "@/lib/dressUp/facePose";

import { facePoseFromLandmarks as poseFromLm } from "@/lib/dressUp/facePose";

/** Legacy helper used by existing unit tests. */
export function faceBoxFromLandmarks(
  landmarks: ReadonlyArray<{ x: number; y: number }>,
  videoWidth: number,
  videoHeight: number,
): FaceBox | null {
  const pose = poseFromLm(landmarks, videoWidth, videoHeight);
  if (!pose) return null;
  return {
    x: pose.cx - pose.width / 2,
    y: pose.cy - pose.height / 2,
    width: pose.width,
    height: pose.height,
    crownY: pose.crownY,
  };
}

export function mirrorFaceBox(face: FaceBox, canvasWidth: number): FaceBox {
  return {
    ...face,
    x: canvasWidth - face.x - face.width,
  };
}

/**
 * Draw a local costume image onto the (already mirrored) canvas, aligned to face pose.
 * Soft breathe / bob keeps the prop feeling alive around the child's face.
 */
export function drawCostumeOverlay(
  ctx: CanvasRenderingContext2D,
  pose: FacePose | null,
  costume: OverlayCostume | DressUpCostume,
  image: CanvasImageSource | null,
  options?: {
    nowMs?: number;
    animate?: boolean;
    /** 0–1 entrance pop when the association accessory swaps. */
    entrance?: number;
    /** Extra vertical bob in face-height units (e.g. juice sip). */
    actionBob?: number;
  },
): void {
  if (!pose || !image) return;

  const faceSize = Math.max(pose.width, pose.height);
  const offsetX = "offsetX" in costume ? (costume.offsetX ?? 0) : 0;
  let drawW = faceSize * costume.scale;
  if (costume.anchor === "eyes" && pose.eyeSpan > 0) {
    // Scale glasses from interpupillary distance so they sit on real eyes.
    drawW = pose.eyeSpan * costume.scale * 2.35;
  } else if (costume.anchor === "torso" && pose.shoulderWidth > 0) {
    drawW = pose.shoulderWidth * costume.scale * 0.92;
  }
  const naturalW =
    "naturalWidth" in image && typeof image.naturalWidth === "number" && image.naturalWidth > 0
      ? image.naturalWidth
      : drawW;
  const naturalH =
    "naturalHeight" in image && typeof image.naturalHeight === "number" && image.naturalHeight > 0
      ? image.naturalHeight
      : drawW;
  const aspect = naturalH / naturalW;
  const drawH = drawW * aspect;

  let cx = pose.cx + pose.width * offsetX;
  let cy = pose.cy + pose.height * costume.offsetY;
  if (costume.anchor === "crown" || costume.anchor === "hat") {
    cy = pose.crownY + pose.height * costume.offsetY;
  } else if (costume.anchor === "mouth") {
    cy = pose.cy + pose.height * 0.42 + pose.height * costume.offsetY;
    cx = pose.cx + pose.width * (0.28 + offsetX);
  } else if (costume.anchor === "torso") {
    cx = pose.shoulderCx + pose.shoulderWidth * offsetX * 0.15;
    cy = pose.shoulderCy + pose.height * costume.offsetY;
  } else if (costume.anchor === "eyes") {
    cx = (pose.leftEyeX + pose.rightEyeX) / 2 + pose.width * offsetX;
    cy =
      (pose.leftEyeY + pose.rightEyeY) / 2 +
      pose.height * costume.offsetY;
  }

  const animate = options?.animate !== false;
  const t = (options?.nowMs ?? (typeof performance !== "undefined" ? performance.now() : 0)) / 1000;
  const breathe = animate ? 1 + Math.sin(t * 2.1) * 0.035 : 1;
  const bob = animate ? Math.sin(t * 2.6) * faceSize * 0.014 : 0;
  const sway = animate ? Math.sin(t * 1.4) * 0.025 : 0;
  const actionBob = (options?.actionBob ?? 0) * pose.height;
  const entrance = Math.max(0, Math.min(1, options?.entrance ?? 1));
  const pop =
    entrance >= 1
      ? 1
      : (() => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(entrance - 1, 3) + c1 * Math.pow(entrance - 1, 2);
        })();

  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * entrance;
  ctx.translate(cx, cy + bob + actionBob);
  ctx.rotate(pose.rotation + sway);
  ctx.scale(breathe * pop, breathe * pop);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}
