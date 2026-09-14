import { getSuccessPraise, resetLetterPraiseMemory } from "@/data/letterPraise";
import { getTargetInstruction, getWrongInstruction } from "@/lib/audio/speechPhrases";
import { beforeEach, describe, expect, it } from "vitest";

describe("named success praise", () => {
  beforeEach(() => {
    resetLetterPraiseMemory();
  });

  it("speaks Fatima with F and keeps Fish on screen", () => {
    const praise = getSuccessPraise("f", {
      firstLook: true,
      streak: 1,
      name: "Fatima",
      random: () => 0,
    });
    expect(praise.spoken).toBe("Fantastic job, Fatima!");
    expect(praise.banner).toBe("FANTASTIC!");
    expect(praise.teachLine).toBe("F is for Fish!");
    expect(praise.speakTeach).toBe(false);
    expect(praise.showObject).toBe(true);
  });
});

describe("named target speech", () => {
  it("introduces letter, object, and name together", () => {
    expect(getTargetInstruction("f", "Fatima")).toBe(
      "F is for Fish! Fatima, type F for Fish.",
    );
    expect(getTargetInstruction("f", "Fatima", { shortened: true })).toBe("F, F, Fish!");
    expect(getTargetInstruction(" ", "Fatima")).toBe("Fatima, press the space bar.");
    expect(getTargetInstruction(",", "Fatima")).toBe("Fatima, type the comma.");
    expect(getWrongInstruction("f", 1, "Fatima")).toBeNull();
    expect(getWrongInstruction("f", 2, "Fatima")).toBe("Almost, Fatima. Find F.");
    expect(getWrongInstruction("f", 3, "Fatima")).toBe("You can do it, Fatima. Find F.");
  });
});
