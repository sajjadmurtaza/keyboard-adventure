import { describe, expect, it } from "vitest";
import { associationsFor } from "@/data/letterAssociations";
import {
  LESSON_MIRROR_COSTUMES,
  isCanvasLessonCostume,
  isLessonMirrorArt,
  isSceneLessonCostume,
  lessonMirrorCostumeForArt,
} from "@/data/lessonMirrorCostumes";

describe("lessonMirrorCostumes", () => {
  it("covers every F and J association with meaningful world styles", () => {
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
    expect(lessonMirrorCostumeForArt("fish")!.style).toBe("scene");
    expect(isSceneLessonCostume(lessonMirrorCostumeForArt("fish"))).toBe(true);
    expect(isCanvasLessonCostume(lessonMirrorCostumeForArt("fish"))).toBe(false);

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

  it("uses an environmental sun world (not a face ring)", () => {
    const sun = lessonMirrorCostumeForArt("sun");
    expect(sun).not.toBeNull();
    expect(sun!.name).toBe("Sun");
    expect(sun!.style).toBe("scene");
    expect(isSceneLessonCostume(sun)).toBe(true);
    expect(isCanvasLessonCostume(sun)).toBe(false);
    expect(isLessonMirrorArt("sun")).toBe(true);
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
      "unicorn",
      "zebra",
    ]);
  });

  it("uses sheet wearables for lion, robot, and royal accessories", () => {
    const lion = lessonMirrorCostumeForArt("lion");
    expect(lion?.assetPath).toContain("/lesson-mirror/wearables/lion.png");
    expect(lion?.style).toBe("face-frame");
    expect(lion?.fallback).toBeFalsy();

    const robot = lessonMirrorCostumeForArt("robot");
    expect(robot?.assetPath).toContain("/lesson-mirror/wearables/robot.png");

    const king = lessonMirrorCostumeForArt("king");
    expect(king?.style).toBe("head-accessory");
    expect(king?.assetPath).toContain("/lesson-mirror/wearables/king.png");
  });

  it("never uses a generic circle — missing arts become LetterArt companions", () => {
    const van = lessonMirrorCostumeForArt("van");
    expect(van).not.toBeNull();
    expect(van!.fallback).toBe(true);
    expect(van!.style).toBe("companion");
    expect(van!.assetPath).toBe("");
    expect(isLessonMirrorArt("van")).toBe(false);
    expect(isCanvasLessonCostume(van)).toBe(false);
  });

  it("uses a real apple hood for Apple", () => {
    const apple = lessonMirrorCostumeForArt("apple");
    expect(apple).not.toBeNull();
    expect(apple!.fallback).toBeFalsy();
    expect(apple!.assetPath).toContain("/lesson-mirror/apple.svg");
    expect(isLessonMirrorArt("apple")).toBe(true);
  });

  it("titles known association arts and unknown slugs as companions", () => {
    const ice = lessonMirrorCostumeForArt("ice-cream");
    expect(ice?.name).toBe("Ice cream");
    expect(ice?.fallback).toBe(true);
    expect(ice?.style).toBe("companion");
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

  it("promotes kite from companion to a head accessory", () => {
    const kite = lessonMirrorCostumeForArt("kite");
    expect(kite?.style).toBe("head-accessory");
    expect(kite?.fallback).toBeFalsy();
    expect(isLessonMirrorArt("kite")).toBe(true);
    expect(isCanvasLessonCostume(kite)).toBe(true);
  });
});
