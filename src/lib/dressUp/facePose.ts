/**
 * Coarse face pose from MediaPipe landmarks (never persisted).
 * Landmark indices match Face Landmarker / Face Mesh topology.
 */

export type FacePose = {
  /** Face center in video pixel space */
  cx: number;
  cy: number;
  /** Approximate face width / height in pixels */
  width: number;
  height: number;
  /** Head roll in radians (positive = tilted left from subject's view) */
  rotation: number;
  /** Forehead / crown anchor */
  crownY: number;
};

/** Key landmark indices (MediaPipe Face Mesh). */
export const LM = {
  nose: 1,
  chin: 152,
  forehead: 10,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftCheek: 234,
  rightCheek: 454,
} as const;

function pt(
  landmarks: ReadonlyArray<{ x: number; y: number }>,
  index: number,
  w: number,
  h: number,
): { x: number; y: number } | null {
  const p = landmarks[index];
  if (!p) return null;
  return { x: p.x * w, y: p.y * h };
}

export function facePoseFromLandmarks(
  landmarks: ReadonlyArray<{ x: number; y: number }>,
  videoWidth: number,
  videoHeight: number,
): FacePose | null {
  if (landmarks.length < 300 || videoWidth <= 0 || videoHeight <= 0) {
    // Fallback: bounding box without rotation
    return facePoseFromBounds(landmarks, videoWidth, videoHeight);
  }

  const left = pt(landmarks, LM.leftEyeOuter, videoWidth, videoHeight)
    ?? pt(landmarks, LM.leftCheek, videoWidth, videoHeight);
  const right = pt(landmarks, LM.rightEyeOuter, videoWidth, videoHeight)
    ?? pt(landmarks, LM.rightCheek, videoWidth, videoHeight);
  const chin = pt(landmarks, LM.chin, videoWidth, videoHeight);
  const forehead = pt(landmarks, LM.forehead, videoWidth, videoHeight);
  const nose = pt(landmarks, LM.nose, videoWidth, videoHeight);

  if (!left || !right || !chin || !forehead) {
    return facePoseFromBounds(landmarks, videoWidth, videoHeight);
  }

  const width = Math.hypot(right.x - left.x, right.y - left.y) * 1.85;
  const height = Math.hypot(chin.x - forehead.x, chin.y - forehead.y) * 1.35;
  if (width < 8 || height < 8) return null;

  const cx = nose ? nose.x : (left.x + right.x) / 2;
  const cy = nose ? nose.y : (forehead.y + chin.y) / 2;
  const rotation = Math.atan2(right.y - left.y, right.x - left.x);

  return {
    cx,
    cy,
    width,
    height,
    rotation,
    crownY: forehead.y,
  };
}

function facePoseFromBounds(
  landmarks: ReadonlyArray<{ x: number; y: number }>,
  videoWidth: number,
  videoHeight: number,
): FacePose | null {
  if (!landmarks.length) return null;
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const p of landmarks) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const pad = 0.06;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(1, maxX + pad);
  maxY = Math.min(1, maxY + pad);
  const width = (maxX - minX) * videoWidth;
  const height = (maxY - minY) * videoHeight;
  if (width < 8 || height < 8) return null;
  return {
    cx: ((minX + maxX) / 2) * videoWidth,
    cy: ((minY + maxY) / 2) * videoHeight,
    width,
    height,
    rotation: 0,
    crownY: (minY + (maxY - minY) * 0.12) * videoHeight,
  };
}

/** Mirror pose into preview coordinates after video is drawn with scale(-1,1). */
export function mirrorFacePose(pose: FacePose, canvasWidth: number): FacePose {
  return {
    ...pose,
    cx: canvasWidth - pose.cx,
    rotation: -pose.rotation,
  };
}
