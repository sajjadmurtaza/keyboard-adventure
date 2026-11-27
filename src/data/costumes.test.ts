import { describe, expect, it } from "vitest";
import {
  COSTUMES,
  costumeForLetter,
  getCostume,
  grantOnLetterIntro,
  isCostumeId,
  parseCostumeIds,
  unlockedFromLetters,
} from "@/data/costumes";

describe("costumes", () => {
  it("maps five letter unlocks", () => {
    expect(COSTUMES).toHaveLength(5);
    expect(costumeForLetter("F")?.id).toBe("fish-hat");
    expect(costumeForLetter("c")?.id).toBe("cat-ears");
    expect(costumeForLetter(" ")).toBeUndefined();
  });

  it("grants only on first introduction", () => {
    const first = grantOnLetterIntro("f", []);
    expect(first?.id).toBe("fish-hat");
    expect(grantOnLetterIntro("f", ["fish-hat"])).toBeNull();
    expect(grantOnLetterIntro("q", [])).toBeNull();
  });

  it("derives unlocks from introduced letters", () => {
    expect(unlockedFromLetters(["f", "j", "c"])).toEqual(["fish-hat", "cat-ears"]);
  });

  it("sanitizes stored ids", () => {
    expect(parseCostumeIds(["fish-hat", "nope", "fish-hat", 3])).toEqual(["fish-hat"]);
  });

  it("looks up costumes by id", () => {
    expect(getCostume("fish-hat").name).toBe("Fish Hat");
    expect(isCostumeId("fish-hat")).toBe(true);
    expect(isCostumeId("bogus")).toBe(false);
  });
});
