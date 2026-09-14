import { celebrationPlan } from "@/components/celebration/plan";
import { describe, expect, it } from "vitest";

describe("celebration plan", () => {
  it("keeps a normal correct key local and small", () => {
    const bits = celebrationPlan("correct");
    expect(bits.length).toBeGreaterThanOrEqual(4);
    expect(bits.length).toBeLessThanOrEqual(8);
    expect(bits.every((bit) => bit.kind === "sparkle")).toBe(true);
    expect(bits.some((bit) => bit.kind === "balloon")).toBe(false);
  });

  it("spreads a streak across several regions", () => {
    const bits = celebrationPlan("streak");
    expect(bits.length).toBeGreaterThan(8);
    const lefts = new Set(bits.map((bit) => bit.left));
    expect(lefts.size).toBeGreaterThan(4);
  });

  it("makes lesson complete a full-screen party", () => {
    const bits = celebrationPlan("complete");
    expect(bits.filter((bit) => bit.kind === "balloon").length).toBeGreaterThanOrEqual(8);
    expect(bits.filter((bit) => bit.kind === "confetti").length).toBeGreaterThanOrEqual(16);
    expect(bits.some((bit) => bit.top.startsWith("8"))).toBe(true);
    expect(celebrationPlan("complete", true).length).toBeLessThan(bits.length);
  });

  it("drops flying pieces when motion is reduced", () => {
    expect(celebrationPlan("correct", false, true)).toEqual([]);
    expect(celebrationPlan("complete", false, true).map((bit) => bit.emoji)).toEqual([
      "🎉",
      "⭐",
      "🎈",
    ]);
  });
});
