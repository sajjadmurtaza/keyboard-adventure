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
  /** Left / right eye centers (for eyewear). */
  leftEyeX: number;
  leftEyeY: number;
  rightEyeX: number;
  rightEyeY: number;
  /** Interpupillary distance in pixels. */
  eyeSpan: number;
  /**
   * Estimated shoulder line from face geometry (until Pose Landmarker is loaded).
   * Used for jackets / upper-body wearables.
   */
  shoulderCx: number;
  shoulderCy: number;
  shoulderWidth: number;
};

/** Key landmark indices (MediaPipe Face Mesh). */
export const LM = {
  nose: 1,
  chin: 152,
  forehead: 10,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
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

function withShouldersAndEyes(
  base: Omit<
    FacePose,
    | "leftEyeX"
    | "leftEyeY"
    | "rightEyeX"
    | "rightEyeY"
    | "eyeSpan"
    | "shoulderCx"
    | "shoulderCy"
    | "shoulderWidth"
  >,
  leftEye: { x: number; y: number },
  rightEye: { x: number; y: number },
): FacePose {
  const eyeSpan = Math.max(
    8,
    Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y),
  );
  // Shoulders sit below the chin, wider than the face — face-derived until pose model loads.
  const shoulderWidth = Math.max(base.width * 2.15, eyeSpan * 3.4);
  const shoulderCy = base.cy + base.height * 0.72;
  return {
    ...base,
    leftEyeX: leftEye.x,
    leftEyeY: leftEye.y,
    rightEyeX: rightEye.x,
    rightEyeY: rightEye.y,
    eyeSpan,
    shoulderCx: base.cx,
    shoulderCy,
    shoulderWidth,
  };
}

export function facePoseFromLandmarks(
  landmarks: ReadonlyArray<{ x: number; y: number }>,
  videoWidth: number,
  videoHeight: number,
): FacePose | null {
  if (landmarks.length < 300 || videoWidth <= 0 || videoHeight <= 0) {
    return facePoseFromBounds(landmarks, videoWidth, videoHeight);
  }

  const leftOuter =
    pt(landmarks, LM.leftEyeOuter, videoWidth, videoHeight) ??
    pt(landmarks, LM.leftCheek, videoWidth, videoHeight);
  const rightOuter =
    pt(landmarks, LM.rightEyeOuter, videoWidth, videoHeight) ??
    pt(landmarks, LM.rightCheek, videoWidth, videoHeight);
  const leftInner = pt(landmarks, LM.leftEyeInner, videoWidth, videoHeight);
  const rightInner = pt(landmarks, LM.rightEyeInner, videoWidth, videoHeight);
  const chin = pt(landmarks, LM.chin, videoWidth, videoHeight);
  const forehead = pt(landmarks, LM.forehead, videoWidth, videoHeight);
  const nose = pt(landmarks, LM.nose, videoWidth, videoHeight);

  if (!leftOuter || !rightOuter || !chin || !forehead) {
    return facePoseFromBounds(landmarks, videoWidth, videoHeight);
  }

  const width = Math.hypot(rightOuter.x - leftOuter.x, rightOuter.y - leftOuter.y) * 1.85;
  const height = Math.hypot(chin.x - forehead.x, chin.y - forehead.y) * 1.35;
  if (width < 8 || height < 8) return null;

  const cx = nose ? nose.x : (leftOuter.x + rightOuter.x) / 2;
  const cy = nose ? nose.y : (forehead.y + chin.y) / 2;
  const rotation = Math.atan2(rightOuter.y - leftOuter.y, rightOuter.x - leftOuter.x);

  const leftEye = leftInner
    ? { x: (leftOuter.x + leftInner.x) / 2, y: (leftOuter.y + leftInner.y) / 2 }
    : leftOuter;
  const rightEye = rightInner
    ? { x: (rightOuter.x + rightInner.x) / 2, y: (rightOuter.y + rightInner.y) / 2 }
    : rightOuter;

  return withShouldersAndEyes(
    {
      cx,
      cy,
      width,
      height,
      rotation,
      crownY: forehead.y,
    },
    leftEye,
    rightEye,
  );
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
  const cx = ((minX + maxX) / 2) * videoWidth;
  const cy = ((minY + maxY) / 2) * videoHeight;
  const leftEye = { x: cx - width * 0.22, y: cy - height * 0.08 };
  const rightEye = { x: cx + width * 0.22, y: cy - height * 0.08 };
  return withShouldersAndEyes(
    {
      cx,
      cy,
      width,
      height,
      rotation: 0,
      crownY: (minY + (maxY - minY) * 0.12) * videoHeight,
    },
    leftEye,
    rightEye,
  );
}

/** Mirror pose into preview coordinates after video is drawn with scale(-1,1). */
export function mirrorFacePose(pose: FacePose, canvasWidth: number): FacePose {
  return {
    ...pose,
    cx: canvasWidth - pose.cx,
    rotation: -pose.rotation,
    leftEyeX: canvasWidth - pose.rightEyeX,
    leftEyeY: pose.rightEyeY,
    rightEyeX: canvasWidth - pose.leftEyeX,
    rightEyeY: pose.leftEyeY,
    shoulderCx: canvasWidth - pose.shoulderCx,
  };
}
