import { describe, expect, it, vi } from "vitest";
import { drawLiveMirrorFrame } from "@/lib/dressUp/liveMirrorFrame";
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
  };
  // scale is used by costume breathe animation
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
  return { canvas, calls, ctx };
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
    expect(result.costumeDrawn).toBe(false);
    expect(calls).toContain("drawImage");
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
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

    const landmarks = Array.from({ length: 478 }, (_, i) => ({
      x: 0.4 + (i % 10) * 0.01,
      y: 0.4 + (i % 7) * 0.01,
    }));
    // Place eyes / chin / forehead roughly
    landmarks[33] = { x: 0.35, y: 0.4 };
    landmarks[263] = { x: 0.65, y: 0.4 };
    landmarks[152] = { x: 0.5, y: 0.75 };
    landmarks[10] = { x: 0.5, y: 0.25 };
    landmarks[1] = { x: 0.5, y: 0.5 };

    const landmarker = {
      detectForVideo: vi.fn(() => ({ faceLandmarks: [landmarks] })),
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
    expect(result.costumeDrawn).toBe(true);
    // video + costume
    expect(calls.filter((c) => c === "drawImage").length).toBeGreaterThanOrEqual(2);
  });
});
