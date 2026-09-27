import { getLesson } from "@/data/lessons";
import {
  keysFromLessons,
  planLesson,
  recallWord,
  visitTone,
} from "@/lib/curriculum/sequence";
import { describe, expect, it } from "vitest";

function share(turns: readonly string[], keys: readonly string[]): number {
  const hits = turns.filter((key) => keys.includes(key)).length;
  return hits / turns.length;
}

function duplicates(turns: readonly string[]): boolean {
  return turns.some((key, index) => index > 0 && key === turns[index - 1]);
}

describe("lesson sequence", () => {
  it("keeps lesson 1 on F and J only", () => {
    const lesson = getLesson(1)!;
    const run = planLesson(lesson, [], 0);
    expect(run.newKeys).toEqual(["f", "j"]);
    expect(run.reviewVisits).toEqual([]);
    expect(run.turns).toEqual(["f", "j", "f", "j", "f", "j", "f", "j"]);
    expect(duplicates(run.turns)).toBe(false);
  });

  it("teaches space by switching with F and J", () => {
    const lesson = getLesson(2)!;
    const run = planLesson(lesson, [1], 0);
    expect(run.newKeys).toEqual([" "]);
    expect(run.turns[0]).toBe(" ");
    expect(run.turns.at(-1)).toBe(" ");
    expect(run.turns).toEqual([" ", "f", " ", "j", " ", "f", " ", "j", " "]);
    expect(share(run.turns, [" "])).toBeCloseTo(5 / 9);
    expect(duplicates(run.turns)).toBe(false);
  });

  it("lets D and K dominate and borrows only finished keys", () => {
    const lesson = getLesson(3)!;
    const cold = planLesson(lesson, [], 0);
    expect(cold.turns.every((key) => key === "d" || key === "k")).toBe(true);
    expect(cold.turns[0]).toBe("d");
    expect(cold.turns.at(-1)).toBe("k");

    const run = planLesson(lesson, [1, 2], 0);
    expect(run.newKeys).toEqual(["d", "k"]);
    expect(run.turns[0]).toBe("d");
    expect(["d", "k"]).toContain(run.turns.at(-1));
    expect(share(run.turns, ["d", "k"])).toBeGreaterThanOrEqual(0.7);
    expect(share(run.turns, run.reviewVisits)).toBeLessThanOrEqual(0.3);
    expect(run.reviewVisits.every((key) => ["f", "j", " "].includes(key))).toBe(true);
    expect(run.turns).not.toContain("s");
    expect(duplicates(run.turns)).toBe(false);
    expect(run.turns.filter((key) => !run.newKeys.includes(key))).toEqual(run.reviewVisits);
  });

  it("rotates which finished keys visit without changing the opening letter", () => {
    const lesson = getLesson(3)!;
    const first = planLesson(lesson, [1, 2], 0);
    const later = planLesson(lesson, [1, 2], 1);
    expect(later.turns[0]).toBe(first.turns[0]);
    expect(later.reviewVisits).not.toEqual(first.reviewVisits);
  });

  it("raises later lessons toward two fifths review and keeps lesson 6 a home-row mix", () => {
    const top = planLesson(getLesson(7)!, [1, 2, 3, 4, 5, 6], 0);
    expect(top.newKeys).toEqual(["e", "i"]);
    expect(top.reviewVisits).toHaveLength(3);
    expect(share(top.turns, top.newKeys)).toBeGreaterThanOrEqual(0.6);
    expect(share(top.turns, top.reviewVisits)).toBeLessThanOrEqual(0.4);
    expect(top.turns).not.toContain("t");
    expect(top.turns[0]).toBe("e");
    expect(["e", "i"]).toContain(top.turns.at(-1));

    const mix = planLesson(getLesson(6)!, [1, 2, 3, 4, 5], 0);
    expect(mix.newKeys).toEqual([]);
    expect(mix.reviewVisits).toEqual([]);
    expect(mix.turns.every((key) => getLesson(6)!.keys.includes(key))).toBe(true);
    expect(duplicates(mix.turns)).toBe(false);
  });

  it("remembers keys from completed lessons in catalog order", () => {
    expect(keysFromLessons([2, 1])).toEqual(["f", "j", " "]);
  });
});

describe("visit tone and recall picture", () => {
  it("gives the first meeting the introduction and later meetings one word", () => {
    expect(visitTone("f", ["f", "j"], [])).toBe("introduce");
    expect(visitTone("f", ["f", "j"], ["f"])).toBe("new");
    expect(visitTone("j", ["d", "k"], ["j"])).toBe("review");
    expect(visitTone(" ", [" "], [])).toBe("introduce");
    expect(recallWord("f", 0)).toBe("Frog");
    expect(recallWord("f", 1)).toBe("Flower");
    expect(recallWord("f", 2)).toBe("Frog");
    expect(recallWord(" ", 0)).toBeUndefined();
  });
});
