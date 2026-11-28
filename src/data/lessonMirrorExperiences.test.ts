import { describe, expect, it } from "vitest";
import { mirrorExperienceForArt } from "@/data/lessonMirrorExperiences";

describe("lessonMirrorExperiences", () => {
  it("maps sun, jacket, juice, fish, drum from the Magic World catalog", () => {
    expect(mirrorExperienceForArt("sun")).toMatchObject({
      ambient: "heat",
      effectType: "weather",
    });
    expect(mirrorExperienceForArt("jacket")).toMatchObject({
      ambient: "cozy",
      effectType: "clothing",
    });
    expect(mirrorExperienceForArt("juice")).toMatchObject({
      ambient: "snack",
      effectType: "food-drink",
    });
    expect(mirrorExperienceForArt("fish")).toMatchObject({
      ambient: "sea",
      effectType: "underwater",
    });
    expect(mirrorExperienceForArt("drum")).toMatchObject({
      ambient: "music",
      effectType: "music",
    });
  });

  it("never leaves known associations on generic default-play", () => {
    expect(mirrorExperienceForArt(undefined).id).toBe("default-play");
    expect(mirrorExperienceForArt("van").id).not.toBe("default-play");
    expect(mirrorExperienceForArt("orange").ambient).toBe("orchard");
    expect(mirrorExperienceForArt("owl").ambient).toBe("woodland");
  });
});
