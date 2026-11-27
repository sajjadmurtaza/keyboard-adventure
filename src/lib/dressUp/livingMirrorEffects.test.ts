import { describe, expect, it, vi } from "vitest";
import { drawLivingMirrorMood } from "@/lib/dressUp/livingMirrorEffects";

function mockCtx() {
  return {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe("drawLivingMirrorMood", () => {
  it("draws themed success particles for fish bubbles", () => {
    const ctx = mockCtx();
    drawLivingMirrorMood(ctx, 200, 300, "success", "bubbles", false, 1000);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("skips particles when reduced motion is on", () => {
    const ctx = mockCtx();
    drawLivingMirrorMood(ctx, 200, 300, "success", "petals", true, 1000);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.ellipse).not.toHaveBeenCalled();
  });

  it("draws question marks on retry", () => {
    const ctx = mockCtx();
    drawLivingMirrorMood(ctx, 200, 300, "retry", "stars", false, 0);
    expect(ctx.fillText).toHaveBeenCalled();
  });
});
