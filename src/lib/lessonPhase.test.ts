import { canAcceptTyping, SUCCESS_HOLD_MS, successHoldMs, targetArriveMs, wrongFeedbackMs, type LessonPhase } from "@/lib/lessonPhase";
import { describe, expect, it } from "vitest";

describe("lesson phase", () => {
  it("only accepts typing while ready or briefly after a miss", () => {
    const locked: LessonPhase[] = ["preparing", "success", "transitioning", "complete"];
    for (const phase of locked) {
      expect(canAcceptTyping(phase)).toBe(false);
    }
    expect(canAcceptTyping("ready")).toBe(true);
    expect(canAcceptTyping("wrong-feedback")).toBe(true);
  });

  it("keeps arrival and miss beats in the preschool window", () => {
    expect(targetArriveMs()).toBe(520);
    expect(targetArriveMs(true)).toBe(200);
    expect(wrongFeedbackMs()).toBe(500);
    expect(wrongFeedbackMs(true)).toBe(280);
  });

  it("holds success about 3 seconds", () => {
    expect(SUCCESS_HOLD_MS).toBe(3000);
    expect(successHoldMs(1)).toBe(3000);
    expect(successHoldMs(1, true)).toBe(1800);
    expect(successHoldMs(3, true)).toBe(2000);
    expect(successHoldMs(5, true)).toBe(2200);
    expect(successHoldMs(3)).toBeGreaterThanOrEqual(3200);
    expect(successHoldMs(5)).toBeGreaterThanOrEqual(3400);
  });
});
