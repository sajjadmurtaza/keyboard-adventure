import {
  getLessonCompletePhrase,
  getNameTestPhrase,
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
    expect(getTargetInstruction("f", "Ada")).toBe(
      "eff is for Fish! Ada, type eff for Fish.",
    );
    expect(getTargetInstruction("f")).toBe("eff is for Fish! Type eff for Fish.");
    expect(getTargetInstruction("e")).toBe("ee is for Egg! Type ee for Egg.");
    expect(spokenKey("e")).toBe("ee");
    expect(getTargetInstruction(",", "Ada")).toBe("Ada, type the comma.");
    expect(getTargetInstruction(",")).toBe("Type the comma.");
    expect(getTargetInstruction("1", "Ada")).toBe("Ada, type 1.");
    expect(getTargetInstruction("1")).toBe("Type 1.");
  });

  it("paces wrong-key help", () => {
    expect(getWrongInstruction("j", 1)).toBeNull();
    expect(getWrongInstruction("j", 2, "Ada")).toBe("Almost, Ada. Find jay.");
    expect(getWrongInstruction("j", 3, "Ada")).toBe("You can do it, Ada. Find jay.");
    expect(getWrongInstruction("j", 6)).toBe("Try jay again.");
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
    expect(getLessonCompletePhrase("Ada")).toMatch(/Ada|did it|Adventure|Fantastic/i);
    expect(getPreviewPhrase()).toContain("Fantastic");
    expect(getPreviewPhrase()).toContain("F");
    expect(getNameTestPhrase("Fatima")).toBe("Hello, Fatima! Let's start typing!");
    expect(getNameTestPhrase("   ")).toBe("Hello! Let's start typing!");
    expect(pickFresh(["only"])).toBe("only");
    expect(pickFresh(["only"])).toBe("only");
    expect(pickFresh([])).toBe("");
  });
});
