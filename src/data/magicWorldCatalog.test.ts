import { describe, expect, it } from "vitest";
import {
  allAssociationArtIds,
  magicWorldForArt,
  MAGIC_WORLD_CATALOG,
} from "@/data/magicWorldCatalog";
import { livingSceneForArt } from "@/data/livingScenes";
import { mirrorExperienceForArt } from "@/data/lessonMirrorExperiences";
import {
  isSceneLessonCostume,
  lessonMirrorCostumeForArt,
} from "@/data/lessonMirrorCostumes";
import { ILLUSTRATIONS } from "@/components/illustrations/LetterArt";

describe("magicWorldCatalog — full 93 coverage", () => {
  const arts = allAssociationArtIds();

  it("covers every curriculum association art exactly once", () => {
    expect(arts).toHaveLength(93);
    expect(Object.keys(MAGIC_WORLD_CATALOG)).toHaveLength(93);
    for (const art of arts) {
      expect(MAGIC_WORLD_CATALOG[art], art).toBeDefined();
    }
  });

  it("gives every art a named scene, ambient, feel line, reactions, and picture", () => {
    for (const art of arts) {
      const world = magicWorldForArt(art);
      expect(world, art).not.toBeNull();
      expect(world!.place.length).toBeGreaterThan(2);
      expect(world!.feelLine.length).toBeGreaterThan(3);
      expect(world!.ambient).not.toBe("none" as never);
      expect(world!.tint).toMatch(/^#/);
      expect(world!.successAction.length).toBeGreaterThan(2);
      expect(world!.failAction).toBe("encourage");
      expect(world!.supportsCameraOff).toBe(true);
      expect(world!.supportsCameraOn).toBe(true);
      expect(livingSceneForArt(art)?.place).toBe(world!.place);

      const experience = mirrorExperienceForArt(art);
      expect(experience.id).not.toBe("default-play");
      expect(experience.ambient).toBe(world!.ambient);
      expect(experience.feelLine).toBe(world!.feelLine);
      expect(experience.art).toBe(art);

      expect(ILLUSTRATIONS[art], `LetterArt missing for ${art}`).toBeTypeOf(
        "function",
      );
    }
  });

  it("configures a meaningful camera costume for every art (no blank)", () => {
    for (const art of arts) {
      const costume = lessonMirrorCostumeForArt(art);
      expect(costume, art).not.toBeNull();
      expect(costume!.art).toBe(art);
      expect(costume!.name.length).toBeGreaterThan(0);
      const world = magicWorldForArt(art)!;
      if (world.mirrorMode === "scene") {
        expect(isSceneLessonCostume(costume)).toBe(true);
        expect(costume!.style).toBe("scene");
      } else if (world.mirrorMode === "companion") {
        expect(costume!.style).toBe("companion");
        expect(costume!.assetPath.length).toBeGreaterThan(0);
      } else {
        expect([
          "face-frame",
          "head-accessory",
          "eye-accessory",
          "body-wear",
          "hand-prop",
        ]).toContain(costume!.style);
        expect(costume!.assetPath.length).toBeGreaterThan(0);
      }
    }
  });

  it("hybrid: Orange scene, Owl wearable, Octopus companion — all immersive", () => {
    expect(magicWorldForArt("orange")!.mirrorMode).toBe("scene");
    expect(isSceneLessonCostume(lessonMirrorCostumeForArt("orange"))).toBe(true);

    expect(magicWorldForArt("owl")!.mirrorMode).toBe("wearable");
    expect(lessonMirrorCostumeForArt("owl")!.style).toBe("face-frame");

    expect(magicWorldForArt("octopus")!.mirrorMode).toBe("companion");
    expect(lessonMirrorCostumeForArt("octopus")!.style).toBe("companion");

    for (const art of ["orange", "owl", "octopus"] as const) {
      expect(mirrorExperienceForArt(art).ambient).not.toBe("none");
      expect(livingSceneForArt(art)?.place.length).toBeGreaterThan(3);
    }
    expect(magicWorldForArt("orange")!.environment).toBe("orchard");
    expect(magicWorldForArt("owl")!.environment).toBe("woodland");
    expect(magicWorldForArt("octopus")!.environment).toBe("ocean");
    expect(magicWorldForArt("orange")!.successAction).toBe("basket-catch");
    expect(magicWorldForArt("owl")!.successAction).toBe("flap-hoot");
    expect(magicWorldForArt("octopus")!.successAction).toBe("swim-splash");
    expect(magicWorldForArt(undefined)).toBeNull();
  });
});
