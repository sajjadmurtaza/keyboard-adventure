import { describe, expect, it } from "vitest";
import { associationsFor } from "@/data/letterAssociations";
import {
  isLivingLetter,
  livingSceneForArt,
  LIVING_SCENES,
} from "@/data/livingScenes";

describe("livingScenes", () => {
  it("covers every F and J association with a named place", () => {
    expect(isLivingLetter("f")).toBe(true);
    expect(isLivingLetter("j")).toBe(true);
    expect(isLivingLetter("a")).toBe(false);

    for (const letter of ["f", "j"] as const) {
      for (const item of associationsFor(letter)) {
        const scene = livingSceneForArt(item.art);
        expect(scene).not.toBeNull();
        expect(scene!.place.length).toBeGreaterThan(3);
        expect(scene!.invite).toContain("letter");
      }
    }
    expect(Object.keys(LIVING_SCENES)).toHaveLength(6);
  });
});
