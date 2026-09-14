import { LETTER_ASSOCIATIONS, associationFor } from "@/data/letterAssociations";
import { LETTER_ART_IDS } from "@/components/illustrations/LetterArt";
import { describe, expect, it } from "vitest";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

describe("letter associations", () => {
  it("covers A–Z with a word and illustration", () => {
    expect(Object.keys(LETTER_ASSOCIATIONS).sort().join("")).toBe(ALPHABET.join(""));
    for (const letter of ALPHABET) {
      const item = associationFor(letter);
      expect(item, letter).toBeTruthy();
      expect(item?.word.length).toBeGreaterThan(0);
      expect(LETTER_ART_IDS).toContain(item?.art);
    }
  });

  it("ignores non-letters", () => {
    expect(associationFor(" ")).toBeNull();
    expect(associationFor(";")).toBeNull();
    expect(associationFor("ff")).toBeNull();
  });

  it("keeps the illustration identity stable for F", () => {
    expect(associationFor("F")?.art).toBe("fish");
    expect(associationFor("f")?.word).toBe("Fish");
  });
});
