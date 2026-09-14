import { buildPracticeSequence, getLesson, nextAdventureId, worldForLesson } from "@/data/lessons";
import { describe, expect, it } from "vitest";

describe("lessons catalog", () => {
  it("finds lessons and worlds", () => {
    expect(getLesson(1)?.title).toBe("F and J");
    expect(getLesson(99)).toBeUndefined();
    expect(worldForLesson(1).name).toMatch(/Home Row/);
    expect(worldForLesson(99).id).toBe(1);
    expect(nextAdventureId([])).toBe(1);
    expect(nextAdventureId([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBe(16);
  });

  it("builds practice sequences", () => {
    expect(buildPracticeSequence([], 5)).toEqual([]);
    const seq = buildPracticeSequence(["f", "j"], 6);
    expect(seq).toHaveLength(6);
    expect(seq.every((key) => key === "f" || key === "j")).toBe(true);
  });
});
