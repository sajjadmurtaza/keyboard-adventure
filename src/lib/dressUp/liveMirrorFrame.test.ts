import { describe, expect, it, vi } from "vitest";
import {
  computeMirrorZoom,
  drawLiveMirrorFrame,
  FACE_TOO_CLOSE_HEIGHT_RATIO,
  FACE_TOO_FAR_HEIGHT_RATIO,
  IDEAL_FACE_HEIGHT_RATIO,
  isFaceTooClose,
  isFaceTooFar,
  mapVideoPointToCanvas,
  mapVideoPoseToCanvas,
  MirrorFramingSmoother,
  MIRROR_ZOOM_MAX,
  MIRROR_ZOOM_MIN,
  PORTRAIT_FALLBACK_FACE_RATIO,
  portraitFallbackPose,
} from "@/lib/dressUp/liveMirrorFrame";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";

function mockCanvas() {
  const calls: string[] = [];
  const ctx = {
    fillStyle: "",
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
    translate: () => calls.push("translate"),
    scale: () => calls.push("scale"),
    rotate: () => calls.push("rotate"),
    drawImage: () => calls.push("drawImage"),
    fillRect: () => calls.push("fillRect"),
    beginPath: () => calls.push("beginPath"),
    rect: () => calls.push("rect"),
    clip: () => calls.push("clip"),
  };
  // scale is used by costume breathe animation
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
  return { canvas, calls, ctx };
}

function faceLandmarksNear(ratio = 0.3) {
  const landmarks = Array.from({ length: 478 }, (_, i) => ({
    x: 0.4 + (i % 10) * 0.01,
    y: 0.4 + (i % 7) * 0.01,
  }));
  const half = ratio / 2;
  landmarks[33] = { x: 0.35, y: 0.5 };
  landmarks[263] = { x: 0.65, y: 0.5 };
  landmarks[152] = { x: 0.5, y: 0.5 + half };
  landmarks[10] = { x: 0.5, y: 0.5 - half };
  landmarks[1] = { x: 0.5, y: 0.5 };
  landmarks[234] = { x: 0.32, y: 0.55 };
  landmarks[454] = { x: 0.68, y: 0.55 };
  landmarks[133] = { x: 0.42, y: 0.48 };
  landmarks[362] = { x: 0.58, y: 0.48 };
  return landmarks;
}

describe("drawLiveMirrorFrame", () => {
  it("always draws the live video layer even without a face or costume", () => {
    const { canvas, calls } = mockCanvas();
    const video = {
      videoWidth: 320,
      videoHeight: 240,
    } as HTMLVideoElement;

    const result = drawLiveMirrorFrame({
      video,
      canvas,
      landmarker: null,
      smoother: new FacePoseSmoother(1),
      costume: null,
      costumeImage: null,
    });

    expect(result.detected).toBe(false);
    expect(result.tooClose).toBe(false);
    expect(result.tooFar).toBe(false);
    expect(result.faceHeightRatio).toBeNull();
    expect(result.costumeDrawn).toBe(false);
    expect(result.zoom).toBe(1);
    expect(calls).toContain("drawImage");
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
  });

  it("calibrates standing-mirror distance from face height ratio", () => {
    expect(isFaceTooClose(240 * 0.3, 240)).toBe(false);
    expect(isFaceTooClose(240 * FACE_TOO_CLOSE_HEIGHT_RATIO + 1, 240)).toBe(true);
    expect(isFaceTooFar(240 * 0.3, 240)).toBe(false);
    expect(isFaceTooFar(240 * FACE_TOO_FAR_HEIGHT_RATIO - 0.01, 240)).toBe(true);
    const fallback = portraitFallbackPose(640, 480);
    expect(fallback.height / 480).toBeLessThan(0.4);
    expect(fallback.width).toBeCloseTo(Math.min(640, 480) * PORTRAIT_FALLBACK_FACE_RATIO);
  });

  it("computes zoom toward the ideal face size when near or far", () => {
    expect(computeMirrorZoom(IDEAL_FACE_HEIGHT_RATIO)).toBeCloseTo(1, 5);
    expect(computeMirrorZoom(0.15)).toBeGreaterThan(1);
    expect(computeMirrorZoom(0.15)).toBeLessThanOrEqual(MIRROR_ZOOM_MAX);
    expect(computeMirrorZoom(0.5)).toBeLessThan(1);
    expect(computeMirrorZoom(0.5)).toBeGreaterThanOrEqual(MIRROR_ZOOM_MIN);
  });

  it("maps video points through mirror + zoom into canvas space", () => {
    const mapped = mapVideoPointToCanvas(100, 80, 200, 10, 2, 100, 80);
    // Focus at center → stays at pad + mirrored focus
    expect(mapped.x).toBe(10 + (200 - 100));
    expect(mapped.y).toBe(10 + 80);
  });

  it("scales pose size with zoom when mapping to canvas", () => {
    const pose = portraitFallbackPose(200, 200, 0);
    // Strip pad — portraitFallbackPose with pad 0 is already canvas-ish; rebuild video-space-like
    const videoPose = {
      ...pose,
      cx: 100,
      cy: 84,
      crownY: 84 - pose.height * 0.42,
      leftEyeX: 100 - pose.eyeSpan / 2,
      leftEyeY: 84,
      rightEyeX: 100 + pose.eyeSpan / 2,
      rightEyeY: 84,
      shoulderCx: 100,
      shoulderCy: 84 + pose.height * 0.72,
    };
    const framed = mapVideoPoseToCanvas(videoPose, 200, 0, 2, 100, 84);
    expect(framed.width).toBeCloseTo(videoPose.width * 2);
    expect(framed.height).toBeCloseTo(videoPose.height * 2);
    expect(framed.eyeSpan).toBeCloseTo(videoPose.eyeSpan * 2);
  });

  it("smooths framing toward a farther face with zoom-in", () => {
    const framing = new MirrorFramingSmoother(1);
    const far = framing.next({ cx: 160, cy: 120, height: 240 * 0.12 }, 320, 240);
    expect(far.zoom).toBeGreaterThan(1);
    expect(far.tooFar).toBe(false);
    const tiny = framing.next({ cx: 160, cy: 120, height: 240 * 0.05 }, 320, 240);
    expect(tiny.tooFar).toBe(true);
    expect(tiny.zoom).toBeCloseTo(MIRROR_ZOOM_MAX, 5);
  });

  it("still draws the costume with a portrait fallback when tracking is cold", () => {
    const { canvas, calls } = mockCanvas();
    const video = {
      videoWidth: 320,
      videoHeight: 240,
    } as HTMLVideoElement;
    const image = {
      naturalWidth: 100,
      naturalHeight: 100,
    } as unknown as CanvasImageSource;

    const result = drawLiveMirrorFrame({
      video,
      canvas,
      landmarker: null,
      smoother: new FacePoseSmoother(1),
      costume: { scale: 2.3, offsetY: 0, anchor: "helmet" },
      costumeImage: image,
      stagePad: 0.28,
    });

    expect(result.detected).toBe(false);
    expect(result.costumeDrawn).toBe(true);
    expect(calls.filter((c) => c === "drawImage").length).toBeGreaterThanOrEqual(2);
  });

  it("adds stage padding so costumes have headroom without zooming video", () => {
    const { canvas, calls } = mockCanvas();
    const video = {
      videoWidth: 320,
      videoHeight: 240,
    } as HTMLVideoElement;

    drawLiveMirrorFrame({
      video,
      canvas,
      landmarker: null,
      smoother: new FacePoseSmoother(1),
      costume: null,
      costumeImage: null,
      stagePad: 0.25,
      stageFill: "#E6F2D9",
    });

    expect(canvas.width).toBe(320 + 2 * Math.round(240 * 0.25));
    expect(canvas.height).toBe(240 + 2 * Math.round(240 * 0.25));
    expect(calls).toContain("drawImage");
  });

  it("tracks a face and draws the costume overlay on top of video", () => {
    const { canvas, calls } = mockCanvas();
    const video = {
      videoWidth: 320,
      videoHeight: 240,
    } as HTMLVideoElement;

    const landmarker = {
      detectForVideo: vi.fn(() => ({
        faceLandmarks: [faceLandmarksNear(0.3)],
      })),
    };

    const image = {
      naturalWidth: 100,
      naturalHeight: 100,
    } as unknown as CanvasImageSource;

    const result = drawLiveMirrorFrame({
      video,
      canvas,
      landmarker,
      smoother: new FacePoseSmoother(1),
      costume: { scale: 2, offsetY: -0.4, anchor: "hat" },
      costumeImage: image,
    });

    expect(landmarker.detectForVideo).toHaveBeenCalled();
    expect(result.detected).toBe(true);
    expect(result.pose).not.toBeNull();
    expect(result.faceHeightRatio).not.toBeNull();
    expect(result.costumeDrawn).toBe(true);
    // video + costume
    expect(calls.filter((c) => c === "drawImage").length).toBeGreaterThanOrEqual(2);
  });

  it("zooms in when the tracked face is far so costumes stay readable", () => {
    const { canvas } = mockCanvas();
    const video = {
      videoWidth: 320,
      videoHeight: 240,
    } as HTMLVideoElement;
    const landmarker = {
      detectForVideo: vi.fn(() => ({
        faceLandmarks: [faceLandmarksNear(0.12)],
      })),
    };
    const image = {
      naturalWidth: 100,
      naturalHeight: 100,
    } as unknown as CanvasImageSource;

    const result = drawLiveMirrorFrame({
      video,
      canvas,
      landmarker,
      smoother: new FacePoseSmoother(1),
      framing: new MirrorFramingSmoother(1),
      costume: { scale: 2, offsetY: -0.4, anchor: "hat" },
      costumeImage: image,
    });

    expect(result.detected).toBe(true);
    expect(result.zoom).toBeGreaterThan(1.5);
    expect(result.tooFar).toBe(false);
    expect(result.pose!.height).toBeGreaterThan(240 * 0.12);
  });

  it("hides tracked costumes when the face leaves and requireFaceForCostume is set", () => {
    const { canvas, calls } = mockCanvas();
    const video = {
      videoWidth: 320,
      videoHeight: 240,
    } as HTMLVideoElement;
    const landmarker = {
      detectForVideo: vi.fn(() => ({ faceLandmarks: [] as never[] })),
    };
    const image = {
      naturalWidth: 100,
      naturalHeight: 100,
    } as unknown as CanvasImageSource;

    const result = drawLiveMirrorFrame({
      video,
      canvas,
      landmarker,
      smoother: new FacePoseSmoother(1),
      costume: { scale: 2, offsetY: 0, anchor: "helmet" },
      costumeImage: image,
      requireFaceForCostume: true,
    });

    expect(result.detected).toBe(false);
    expect(result.costumeDrawn).toBe(false);
    // video only
    expect(calls.filter((c) => c === "drawImage")).toHaveLength(1);
  });
});
