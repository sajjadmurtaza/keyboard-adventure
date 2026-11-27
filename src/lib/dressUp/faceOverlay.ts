import type { DressUpAnchor, DressUpCostume } from "@/data/dressUpCostumes";
import type { FacePose } from "@/lib/dressUp/facePose";

export type { FacePose };

/** Minimal costume layout — dress-up and lesson-mirror share this. */
export type OverlayCostume = {
  scale: number;
  offsetY: number;
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
 */
export function drawCostumeOverlay(
  ctx: CanvasRenderingContext2D,
  pose: FacePose | null,
  costume: OverlayCostume | DressUpCostume,
  image: CanvasImageSource | null,
): void {
  if (!pose || !image) return;

  const faceSize = Math.max(pose.width, pose.height);
  const drawW = faceSize * costume.scale;
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

  let cy = pose.cy + pose.height * costume.offsetY;
  if (costume.anchor === "crown" || costume.anchor === "hat") {
    cy = pose.crownY + pose.height * costume.offsetY;
  }

  ctx.save();
  ctx.translate(pose.cx, cy);
  ctx.rotate(pose.rotation);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}
