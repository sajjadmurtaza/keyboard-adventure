import { describe, expect, it } from "vitest";
import { associationsFor } from "@/data/letterAssociations";
import {
  LESSON_MIRROR_COSTUMES,
  isCanvasLessonCostume,
  isDomCompanionCostume,
  isLessonMirrorArt,
  isSceneLessonCostume,
  lessonMirrorCostumeForArt,
} from "@/data/lessonMirrorCostumes";

describe("lessonMirrorCostumes — hybrid Magic Mirror", () => {
  it("covers every F and J association with tracked hybrid styles", () => {
    for (const letter of ["f", "j"] as const) {
      const items = associationsFor(letter);
      expect(items).toHaveLength(3);
      for (const item of items) {
        const costume = lessonMirrorCostumeForArt(item.art);
        expect(costume).not.toBeNull();
        expect(costume!.art).toBe(item.art);
        expect(costume!.name.toLowerCase()).toBe(item.word.toLowerCase());
        expect(isLessonMirrorArt(item.art)).toBe(true);
      }
    }

    const fish = lessonMirrorCostumeForArt("fish");
    expect(fish!.style).toBe("companion");
    expect(isCanvasLessonCostume(fish)).toBe(true);
    expect(isSceneLessonCostume(fish)).toBe(false);
    expect(fish!.assetPath).toContain("/lesson-mirror/wearables/fish.png");

    expect(lessonMirrorCostumeForArt("frog")!.style).toBe("face-frame");
    expect(isCanvasLessonCostume(lessonMirrorCostumeForArt("frog"))).toBe(true);

    expect(lessonMirrorCostumeForArt("juice")!.style).toBe("hand-prop");
    expect(lessonMirrorCostumeForArt("juice")!.anchor).toBe("mouth");
    expect(lessonMirrorCostumeForArt("juice")!.assetPath).toContain(
      "/lesson-mirror/objects/juice.png",
    );

    expect(lessonMirrorCostumeForArt("jacket")!.style).toBe("body-wear");
    expect(lessonMirrorCostumeForArt("jacket")!.anchor).toBe("torso");
    expect(lessonMirrorCostumeForArt("jacket")!.assetPath).toContain(
      "/lesson-mirror/objects/jacket.png",
    );
  });

  it("tracks sun rays on the head while heat ambient fills the world", () => {
    const sun = lessonMirrorCostumeForArt("sun");
    expect(sun).not.toBeNull();
    expect(sun!.name).toBe("Sun");
    expect(sun!.style).toBe("head-accessory");
    expect(sun!.anchor).toBe("hat");
    expect(isCanvasLessonCostume(sun)).toBe(true);
    expect(isSceneLessonCostume(sun)).toBe(false);
    expect(sun!.assetPath).toContain("/lesson-mirror/wearables/sun.png");
  });

  it("keeps octopus as a head-relative companion (not a face hat)", () => {
    const octopus = lessonMirrorCostumeForArt("octopus");
    expect(octopus).not.toBeNull();
    expect(octopus!.style).toBe("companion");
    expect(octopus!.offsetX).toBeGreaterThan(0.5);
    expect(isCanvasLessonCostume(octopus)).toBe(true);
    expect(isSceneLessonCostume(octopus)).toBe(false);
    expect(isDomCompanionCostume(octopus)).toBe(false);
    expect(octopus!.assetPath).toContain("/lesson-mirror/wearables/octopus.png");
  });

  it("places the drum as a musical hand prop, not a face frame", () => {
    const drum = lessonMirrorCostumeForArt("drum");
    expect(drum?.style).toBe("hand-prop");
    expect(drum?.anchor).toBe("torso");
    expect(drum?.assetPath).toContain("/lesson-mirror/objects/drum.png");
    expect(isCanvasLessonCostume(drum)).toBe(true);
  });

  it("exposes dedicated local lesson-mirror accessories from the art sheets", () => {
    expect(LESSON_MIRROR_COSTUMES.map((c) => c.art)).toEqual([
      "apple",
      "ant",
      "bear",
      "cat",
      "dog",
      "duck",
      "drum",
      "elephant",
      "fish",
      "frog",
      "flower",
      "goat",
      "hat",
      "horse",
      "insect",
      "juice",
      "jelly",
      "jacket",
      "kite",
      "king",
      "lion",
      "mouse",
      "milk",
      "owl",
      "octopus",
      "panda",
      "pig",
      "queen",
      "robot",
      "sun",
      "star",
      "snake",
      "umbrella",
      "unicorn",
      "zebra",
    ]);
  });

  it("tracks animal face-frames and royal crowns as canvas wearables", () => {
    const lion = lessonMirrorCostumeForArt("lion");
    expect(lion?.style).toBe("face-frame");
    expect(isCanvasLessonCostume(lion)).toBe(true);

    const robot = lessonMirrorCostumeForArt("robot");
    expect(robot?.style).toBe("face-frame");
    expect(isCanvasLessonCostume(robot)).toBe(true);

    const king = lessonMirrorCostumeForArt("king");
    expect(king?.style).toBe("head-accessory");
    expect(king?.assetPath).toContain("/lesson-mirror/wearables/king.png");
  });

  it("never uses a generic circle — vehicles become Magic World scenes", () => {
    const van = lessonMirrorCostumeForArt("van");
    expect(van).not.toBeNull();
    expect(van!.style).toBe("scene");
    expect(van!.assetPath).toBe("");
    expect(isLessonMirrorArt("van")).toBe(false);
    expect(isCanvasLessonCostume(van)).toBe(false);
    expect(isSceneLessonCostume(van)).toBe(true);
  });

  it("places Apple in the orchard world (not a face hat)", () => {
    const apple = lessonMirrorCostumeForArt("apple");
    expect(apple).not.toBeNull();
    expect(apple!.style).toBe("scene");
    expect(isSceneLessonCostume(apple)).toBe(true);
    expect(isLessonMirrorArt("apple")).toBe(true);
  });

  it("titles known association arts and unknown slugs", () => {
    const ice = lessonMirrorCostumeForArt("ice-cream");
    expect(ice?.name).toBe("Ice cream");
    expect(ice?.style).toBe("scene");
    const madeUp = lessonMirrorCostumeForArt("zz-unknown" as never);
    expect(madeUp?.name).toBe("Zz Unknown");
    expect(madeUp?.fallback).toBe(true);
    expect(madeUp?.style).toBe("companion");
  });

  it("titles Space-bar association arts and rejects empty art", () => {
    const spaceItems = associationsFor(" ");
    expect(spaceItems.length).toBeGreaterThan(0);
    const first = lessonMirrorCostumeForArt(spaceItems[0]!.art);
    expect(first?.name.toLowerCase()).toBe(spaceItems[0]!.word.toLowerCase());
    expect(lessonMirrorCostumeForArt(undefined)).toBeNull();
    expect(isCanvasLessonCostume(null)).toBe(false);
    expect(isCanvasLessonCostume(undefined)).toBe(false);
  });

  it("treats head accessories as canvas wearables", () => {
    const hat = lessonMirrorCostumeForArt("hat");
    expect(hat?.style).toBe("head-accessory");
    expect(isCanvasLessonCostume(hat)).toBe(true);
    expect(hat?.assetPath).toContain("/lesson-mirror/wearables/hat.png");
  });

  it("flies the kite as a head-relative companion", () => {
    const kite = lessonMirrorCostumeForArt("kite");
    expect(kite?.style).toBe("companion");
    expect(isCanvasLessonCostume(kite)).toBe(true);
    expect(isSceneLessonCostume(kite)).toBe(false);
    expect(isLessonMirrorArt("kite")).toBe(true);
    expect(kite?.assetPath).toContain("/lesson-mirror/wearables/kite.png");
  });

  it("uses DOM companions only when no canvas asset is available", () => {
    const fallback = lessonMirrorCostumeForArt("zz-unknown" as never);
    expect(isDomCompanionCostume(fallback)).toBe(true);
    expect(isDomCompanionCostume(lessonMirrorCostumeForArt("octopus"))).toBe(
      false,
    );
    expect(isDomCompanionCostume(null)).toBe(false);
  });
});
