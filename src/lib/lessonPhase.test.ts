import { canAcceptTyping, reviewHoldMs, SUCCESS_HOLD_MS, successHoldMs, targetArriveMs, wrongFeedbackMs, type LessonPhase } from "@/lib/lessonPhase";
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

  it("holds success about 2.8 seconds", () => {
    expect(SUCCESS_HOLD_MS).toBe(2800);
    expect(successHoldMs(1)).toBe(2800);
    expect(successHoldMs(1, true)).toBe(1600);
    expect(successHoldMs(3, true)).toBe(1700);
    expect(successHoldMs(5, true)).toBe(1800);
    expect(successHoldMs(3)).toBeGreaterThanOrEqual(3000);
    expect(successHoldMs(5)).toBeGreaterThanOrEqual(3200);
    expect(reviewHoldMs()).toBe(1400);
    expect(reviewHoldMs(true)).toBe(900);
  });
});
