import { describe, expect, it } from "vitest";
import { associationsFor } from "@/data/letterAssociations";
import {
  LESSON_MIRROR_COSTUMES,
  isLessonMirrorArt,
  lessonMirrorCostumeForArt,
} from "@/data/lessonMirrorCostumes";

describe("lessonMirrorCostumes", () => {
  it("covers every F and J association with a matching named costume", () => {
    for (const letter of ["f", "j"] as const) {
      const items = associationsFor(letter);
      expect(items).toHaveLength(3);
      for (const item of items) {
        const costume = lessonMirrorCostumeForArt(item.art);
        expect(costume).not.toBeNull();
        expect(costume!.art).toBe(item.art);
        expect(costume!.name.toLowerCase()).toBe(item.word.toLowerCase());
        expect(costume!.assetPath).toContain(`/lesson-mirror/${item.art}.svg`);
        expect(isLessonMirrorArt(item.art)).toBe(true);
        expect(costume!.fallback).toBeFalsy();
      }
    }
  });

  it("includes a dedicated sun-ray ring for SUN", () => {
    const sun = lessonMirrorCostumeForArt("sun");
    expect(sun).not.toBeNull();
    expect(sun!.name).toBe("Sun");
    expect(sun!.assetPath).toContain("/lesson-mirror/sun.svg");
    expect(sun!.fallback).toBeFalsy();
    expect(isLessonMirrorArt("sun")).toBe(true);
  });

  it("exposes dedicated local lesson-mirror assets including sun", () => {
    expect(LESSON_MIRROR_COSTUMES.map((c) => c.art)).toEqual([
      "frog",
      "fish",
      "flower",
      "juice",
      "jelly",
      "jacket",
      "sun",
    ]);
  });

  it("never blocks learning — missing arts get a fallback face-ring prop", () => {
    const apple = lessonMirrorCostumeForArt("apple");
    expect(apple).not.toBeNull();
    expect(apple!.fallback).toBe(true);
    expect(apple!.assetPath.startsWith("data:image/svg+xml")).toBe(true);
    expect(isLessonMirrorArt("apple")).toBe(false);
  });

  it("titles known association arts and unknown slugs", () => {
    const ice = lessonMirrorCostumeForArt("ice-cream");
    expect(ice?.name).toBe("Ice cream");
    expect(ice?.fallback).toBe(true);
    const madeUp = lessonMirrorCostumeForArt("zz-unknown" as never);
    expect(madeUp?.name).toBe("Zz Unknown");
    expect(madeUp?.fallback).toBe(true);
  });
});
