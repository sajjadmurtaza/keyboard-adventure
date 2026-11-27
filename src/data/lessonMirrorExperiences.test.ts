import { describe, expect, it } from "vitest";
import { mirrorExperienceForArt } from "@/data/lessonMirrorExperiences";

describe("lessonMirrorExperiences", () => {
  it("maps sun to heat, jacket to wear, juice to drink, fish to sea hunt", () => {
    expect(mirrorExperienceForArt("sun")).toMatchObject({
      id: "sun-heat",
      ambient: "heat",
      effectType: "weather",
    });
    expect(mirrorExperienceForArt("jacket")).toMatchObject({
      id: "wear-jacket",
      ambient: "cozy",
      effectType: "clothing",
    });
    expect(mirrorExperienceForArt("juice")).toMatchObject({
      id: "drink-juice",
      ambient: "snack",
      effectType: "food-drink",
    });
    expect(mirrorExperienceForArt("fish")).toMatchObject({
      id: "sea-hunt",
      ambient: "sea",
      effectType: "underwater",
    });
    expect(mirrorExperienceForArt("drum")).toMatchObject({
      id: "drum-beat",
      ambient: "music",
      effectType: "music",
    });
  });

  it("falls back safely for unknown arts", () => {
    expect(mirrorExperienceForArt(undefined).id).toBe("default-play");
    expect(mirrorExperienceForArt("van").id).toBe("default-play");
  });
});
