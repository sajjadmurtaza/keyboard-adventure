import { canAcceptTyping, SUCCESS_HOLD_MS, successHoldMs, type LessonPhase } from "@/lib/lessonPhase";
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

  it("holds success about 1.5 seconds", () => {
    expect(SUCCESS_HOLD_MS).toBe(1500);
    expect(successHoldMs(1)).toBe(1500);
    expect(successHoldMs(1, true)).toBe(1100);
    expect(successHoldMs(3, true)).toBe(1200);
    expect(successHoldMs(5, true)).toBe(1300);
    expect(successHoldMs(3)).toBeGreaterThanOrEqual(1600);
    expect(successHoldMs(5)).toBeGreaterThanOrEqual(1800);
  });
});
