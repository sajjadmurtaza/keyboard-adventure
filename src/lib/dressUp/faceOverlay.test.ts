import { describe, expect, it, vi } from "vitest";
import {
  drawCostumeOverlay,
  faceBoxFromLandmarks,
  mirrorFaceBox,
} from "@/lib/dressUp/faceOverlay";
import { facePoseFromLandmarks, mirrorFacePose } from "@/lib/dressUp/facePose";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";
import {
  DRESS_UP_COSTUMES,
  getDressUpCostume,
  isDressUpId,
} from "@/data/dressUpCostumes";

describe("faceOverlay + pose", () => {
  it("builds a box from landmarks and mirrors for preview", () => {
    const box = faceBoxFromLandmarks(
      [
        { x: 0.4, y: 0.3 },
        { x: 0.6, y: 0.3 },
        { x: 0.5, y: 0.7 },
      ],
      640,
      480,
    );
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(50);
    const mirrored = mirrorFaceBox(box!, 640);
    expect(mirrored.x + mirrored.width).toBeCloseTo(640 - box!.x, 5);
  });

  it("returns null for empty landmarks", () => {
    expect(faceBoxFromLandmarks([], 640, 480)).toBeNull();
    expect(facePoseFromLandmarks([], 640, 480)).toBeNull();
  });

  it("estimates rotation from eye landmarks when available", () => {
    const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
    landmarks[33] = { x: 0.35, y: 0.4 };
    landmarks[263] = { x: 0.65, y: 0.42 };
    landmarks[10] = { x: 0.5, y: 0.28 };
    landmarks[152] = { x: 0.5, y: 0.72 };
    landmarks[1] = { x: 0.5, y: 0.5 };
    const pose = facePoseFromLandmarks(landmarks, 640, 480);
    expect(pose).not.toBeNull();
    expect(pose!.rotation).not.toBe(0);
    const mirrored = mirrorFacePose(pose!, 640);
    expect(mirrored.rotation).toBeCloseTo(-pose!.rotation, 5);
  });

  it("draws SVG costume with rotation", () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const image = { naturalWidth: 240, naturalHeight: 260 } as CanvasImageSource;
    const pose = {
      cx: 200,
      cy: 180,
      width: 100,
      height: 120,
      rotation: 0.2,
      crownY: 100,
      leftEyeX: 170,
      leftEyeY: 160,
      rightEyeX: 230,
      rightEyeY: 160,
      eyeSpan: 60,
      shoulderCx: 200,
      shoulderCy: 260,
      shoulderWidth: 210,
    };
    drawCostumeOverlay(ctx, null, DRESS_UP_COSTUMES[0], image);
    expect(ctx.drawImage).not.toHaveBeenCalled();
    drawCostumeOverlay(ctx, pose, getDressUpCostume("royal"), image);
    drawCostumeOverlay(ctx, pose, getDressUpCostume("astronaut"), image);
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  it("smooths pose and resets on lost face", () => {
    const smoother = new FacePoseSmoother(0.5);
    const a = {
      cx: 100,
      cy: 100,
      width: 80,
      height: 90,
      rotation: 0,
      crownY: 60,
      leftEyeX: 80,
      leftEyeY: 90,
      rightEyeX: 120,
      rightEyeY: 90,
      eyeSpan: 40,
      shoulderCx: 100,
      shoulderCy: 160,
      shoulderWidth: 170,
    };
    const b = { ...a, cx: 140, cy: 120 };
    expect(smoother.next(a)?.cx).toBe(100);
    const mid = smoother.next(b);
    expect(mid!.cx).toBeGreaterThan(100);
    expect(mid!.cx).toBeLessThan(140);
    expect(smoother.next(null)).toBeNull();
  });

  it("ships six independent dress-up costumes with local assets", () => {
    expect(DRESS_UP_COSTUMES).toHaveLength(6);
    for (const c of DRESS_UP_COSTUMES) {
      expect(c.assetPath.startsWith("/dress-up/")).toBe(true);
      expect(c.assetPath).toMatch(/\?v=\d+$/);
      expect(c.assetPath).not.toMatch(/^https?:\/\//);
    }
    expect(isDressUpId("astronaut")).toBe(true);
    expect(isDressUpId("nope")).toBe(false);
    expect(() => getDressUpCostume("nope" as "astronaut")).toThrow();
  });
});
