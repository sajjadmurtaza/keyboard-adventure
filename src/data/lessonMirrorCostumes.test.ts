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
      }
    }
  });

  it("exposes exactly six local lesson-mirror assets", () => {
    expect(LESSON_MIRROR_COSTUMES).toHaveLength(6);
    expect(lessonMirrorCostumeForArt("apple")).toBeNull();
  });
});
