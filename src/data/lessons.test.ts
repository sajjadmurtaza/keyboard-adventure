import { associationFor } from "@/data/letterAssociations";
import { buildPracticeSequence, getLesson, lessons, nextAdventureId, worldForLesson, worlds } from "@/data/lessons";
import { getTargetInstruction, spokenKey } from "@/lib/audio/speechPhrases";
import { displayKey, tinyHint } from "@/utils/keys";
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

  it("keeps every lesson key on-screen as the real key, with a spoken name", () => {
    const ids = worlds.flatMap((world) => world.lessonIds);
    expect(ids).toEqual(lessons.map((lesson) => lesson.id));

    for (const lesson of lessons) {
      expect(new Set(lesson.sequence).size).toBe(lesson.keys.length);
      for (const key of lesson.sequence) {
        expect(lesson.keys, lesson.title).toContain(key);
        expect(displayKey(key).toLowerCase()).not.toBe("and");
        expect(spokenKey(key).toLowerCase()).not.toBe("and");
        const letter = /^[a-z]$/.test(key);
        if (letter) {
          expect(associationFor(key), key).toBeTruthy();
          expect(getTargetInstruction(key)).toMatch(/is for/i);
          expect(getTargetInstruction(key)).toContain(spokenKey(key));
          expect(getTargetInstruction(key)).not.toMatch(/\bAND\b/);
        } else {
          expect(tinyHint(key) || key === " ").toBeTruthy();
        }
      }
    }

    expect(getLesson(7)?.keys).toEqual(["e", "i"]);
    expect(displayKey("e")).toBe("E");
    expect(spokenKey("e")).toBe("ee");
    expect(getTargetInstruction("e")).toContain("Egg");
    expect(displayKey("i")).toBe("I");
    expect(spokenKey("i")).toBe("eye");
    expect(getTargetInstruction(";")).toContain("semicolon");
    expect(getTargetInstruction(" ")).toContain("space bar");
  });
});

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
