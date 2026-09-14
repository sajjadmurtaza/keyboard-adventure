import {
  getLessonCompletePhrase,
  getPreviewPhrase,
  getStreakPhrase,
  getTargetInstruction,
  getWrongInstruction,
  pickFresh,
  shouldSayName,
  spokenKey,
} from "@/lib/audio/speechPhrases";
import { describe, expect, it } from "vitest";

describe("speech phrases", () => {
  it("builds target lines", () => {
    expect(getTargetInstruction(" ")).toMatch(/space bar/);
    expect(getTargetInstruction(" ", "Ada")).toContain("Ada");
    expect(getTargetInstruction("j")).toMatch(/J/i);
    expect(getTargetInstruction("j", "Ada")).toMatch(/Ada|J/i);
  });

  it("paces wrong-key help", () => {
    expect(getWrongInstruction("j", 1)).toBeNull();
    expect(getWrongInstruction("j", 2)).toBe("Almost! Find J.");
    expect(getWrongInstruction("j", 3)).toBe("You can do it! Find J.");
    expect(getWrongInstruction("j", 6)).toBe("Try J again.");
    expect(getWrongInstruction("j", 4)).toBeNull();
    expect(spokenKey(";")).toBe("semicolon");
  });

  it("names celebrations", () => {
    expect(shouldSayName("never", "target", "Ada")).toBe(false);
    expect(shouldSayName("sometimes", "target", "")).toBe(false);
    expect(shouldSayName("celebrations", "celebrate", "Ada")).toBe(true);
    expect(shouldSayName("celebrations", "target", "Ada")).toBe(false);
    shouldSayName("sometimes", "celebrate", "Ada");
    shouldSayName("sometimes", "target", "Ada");
    shouldSayName("often", "target", "Ada");
  });

  it("covers streaks and complete", () => {
    expect(getStreakPhrase(5)).toMatch(/streak|roll|Super/i);
    expect(getStreakPhrase(5, "Ada")).toMatch(/Ada|streak|roll|Super/i);
    expect(getStreakPhrase(3)).toMatch(/Three|Awesome|Fantastic|Amazing|Super|roll|Wow/i);
    expect(getStreakPhrase(3, "Ada")).toMatch(/Ada|Three|Awesome|Fantastic|Amazing|Super|roll|Wow/i);
    expect(getLessonCompletePhrase()).toMatch(/did it|Adventure|Amazing/i);
    expect(getLessonCompletePhrase("Ada")).toMatch(/Ada|did it|Adventure/i);
    expect(getPreviewPhrase()).toContain("J");
    expect(pickFresh(["only"])).toBe("only");
    expect(pickFresh(["only"])).toBe("only");
    expect(pickFresh([])).toBe("");
  });
});
