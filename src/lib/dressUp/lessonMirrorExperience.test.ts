import { describe, expect, it, vi } from "vitest";
import { mirrorExperienceForArt } from "@/data/lessonMirrorExperiences";
import { drawLessonMirrorExperience } from "@/lib/dressUp/lessonMirrorExperience";

function mockCtx() {
  return {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  } as unknown as CanvasRenderingContext2D;
}

describe("drawLessonMirrorExperience", () => {
  it("draws sun heat and sea hunt ambients without throwing", () => {
    const ctx = mockCtx();
    drawLessonMirrorExperience(
      ctx,
      320,
      240,
      mirrorExperienceForArt("sun"),
      "idle",
      false,
      1000,
      null,
    );
    expect(ctx.fillRect).toHaveBeenCalled();

    drawLessonMirrorExperience(
      ctx,
      320,
      240,
      mirrorExperienceForArt("fish"),
      "success",
      false,
      2000,
      { cx: 160, cy: 120, width: 80, height: 90, rotation: 0, crownY: 70 },
    );
    expect(ctx.beginPath).toHaveBeenCalled();
  });

  it("keeps a static tint when reduced motion is on", () => {
    const ctx = mockCtx();
    drawLessonMirrorExperience(
      ctx,
      200,
      200,
      mirrorExperienceForArt("juice"),
      "idle",
      true,
      500,
      null,
    );
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it("draws orchard, woodland, travel, sky, royal, playroom, and special worlds", () => {
    const ctx = mockCtx();
    const samples = [
      "orange",
      "owl",
      "van",
      "airplane",
      "king",
      "ball",
      "gap",
      "igloo",
      "umbrella",
      "drum",
    ] as const;
    for (const art of samples) {
      drawLessonMirrorExperience(
        ctx,
        320,
        240,
        mirrorExperienceForArt(art),
        "success",
        false,
        1500,
        null,
      );
    }
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.setLineDash).toHaveBeenCalled();
  });
});
