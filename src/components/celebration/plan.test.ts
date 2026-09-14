import { celebrationLevelFor, celebrationPlan } from "@/components/celebration/plan";
import { describe, expect, it } from "vitest";

function endsAt(bit: { delay: number; duration: number }): number {
  return bit.delay + bit.duration;
}

describe("celebration plan", () => {
  it("keeps a normal correct key mixed around the letter", () => {
    const bits = celebrationPlan("correct");
    expect(bits.length).toBeGreaterThanOrEqual(8);
    expect(bits.length).toBeLessThanOrEqual(12);
    expect(bits.every((bit) => bit.kind === "sparkle")).toBe(true);
    expect(bits.some((bit) => bit.kind === "balloon")).toBe(false);
    expect(new Set(bits.map((bit) => bit.emoji)).size).toBeGreaterThanOrEqual(8);
    expect(bits.map((bit) => bit.emoji).join("")).toMatch(/[🌸🌼🌺]/);
    expect(bits.map((bit) => bit.emoji).join("")).toContain("👍");
    expect(bits.map((bit) => bit.emoji).join("")).toContain("👏");
    expect(bits[0]?.delay).toBeGreaterThanOrEqual(0.14);
    expect(bits[0]?.delay).toBeLessThan(0.25);
    const last = bits[bits.length - 1];
    expect(last?.delay).toBeGreaterThanOrEqual(1.2);
    expect(Math.max(...bits.map(endsAt))).toBeGreaterThanOrEqual(4);
    expect(Math.max(...bits.map(endsAt))).toBeLessThanOrEqual(4.25);
    expect(new Set(bits.map((bit) => bit.motion)).size).toBeGreaterThan(1);
    expect(bits.some((bit) => bit.moveY < 0)).toBe(true);
    expect(bits.some((bit) => bit.moveY > 0)).toBe(true);
    expect(bits.some((bit) => bit.moveX < 0)).toBe(true);
    expect(bits.some((bit) => bit.moveX > 0)).toBe(true);
    const clap = bits.find((bit) => bit.emoji === "👏");
    expect(clap).toBeTruthy();
    expect(Math.abs(clap?.moveX ?? 99) + Math.abs(clap?.moveY ?? 99)).toBeLessThan(50);
  });

  it("keeps a seed stable and changes direction mix across seeds", () => {
    const a = celebrationPlan("correct", false, false, 3);
    const b = celebrationPlan("correct", false, false, 3);
    const c = celebrationPlan("correct", false, false, 11);
    expect(a.map((bit) => `${bit.moveX},${bit.moveY}`)).toEqual(
      b.map((bit) => `${bit.moveX},${bit.moveY}`),
    );
    expect(a.map((bit) => `${bit.moveX},${bit.moveY}`)).not.toEqual(
      c.map((bit) => `${bit.moveX},${bit.moveY}`),
    );
  });

  it("uses fewer mixed pieces on compact correct", () => {
    const bits = celebrationPlan("correct", true);
    expect(bits.length).toBeGreaterThanOrEqual(7);
    expect(bits.length).toBeLessThanOrEqual(10);
    expect(new Set(bits.map((bit) => bit.emoji)).size).toBeGreaterThan(5);
  });

  it("spreads a 3-streak with hearts and party faces", () => {
    const bits = celebrationPlan("streak");
    expect(bits.length).toBeGreaterThanOrEqual(14);
    expect(bits.length).toBeLessThanOrEqual(20);
    expect(bits.map((bit) => bit.emoji).join("")).toContain("🥳");
    expect(bits.map((bit) => bit.emoji).join("")).toContain("💖");
    const lefts = new Set(bits.map((bit) => bit.left));
    expect(lefts.size).toBeGreaterThan(4);
    expect(Math.max(...bits.map(endsAt))).toBeGreaterThanOrEqual(4.3);
    expect(Math.max(...bits.map(endsAt))).toBeLessThanOrEqual(4.55);
  });

  it("makes a 5-streak larger with a second wave", () => {
    const bits = celebrationPlan("streak5");
    expect(bits.length).toBeGreaterThanOrEqual(18);
    expect(bits.length).toBeLessThanOrEqual(24);
    expect(bits.some((bit) => bit.delay >= 1.5)).toBe(true);
    expect(Math.max(...bits.map(endsAt))).toBeGreaterThanOrEqual(4.5);
    expect(Math.max(...bits.map(endsAt))).toBeLessThanOrEqual(4.9);
    expect(celebrationLevelFor(1)).toBe("correct");
    expect(celebrationLevelFor(3)).toBe("streak");
    expect(celebrationLevelFor(5)).toBe("streak5");
  });

  it("makes lesson complete a full-screen party", () => {
    const bits = celebrationPlan("complete");
    expect(bits.filter((bit) => bit.kind === "balloon").length).toBeGreaterThanOrEqual(8);
    expect(bits.filter((bit) => bit.kind === "confetti").length).toBeGreaterThanOrEqual(10);
    expect(bits.some((bit) => bit.top.startsWith("8"))).toBe(true);
    expect(bits.some((bit) => bit.delay >= 2)).toBe(true);
    expect(celebrationPlan("complete", true).length).toBeLessThan(bits.length);
  });

  it("keeps a still mix when motion is reduced", () => {
    const correct = celebrationPlan("correct", false, true);
    expect(correct.length).toBeGreaterThanOrEqual(8);
    expect(correct.every((bit) => bit.motion === "still")).toBe(true);
    expect(correct.map((bit) => bit.emoji).join("")).toMatch(/[🌸🌼🌺]/);
    const done = celebrationPlan("complete", false, true);
    expect(done.map((bit) => bit.emoji)).toContain("🎈");
    expect(done.every((bit) => bit.motion === "still")).toBe(true);
  });
});
