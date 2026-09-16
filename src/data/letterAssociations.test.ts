import { LETTER_ASSOCIATIONS, associationFor, associationsFor } from "@/data/letterAssociations";
import { LETTER_ART_IDS } from "@/components/illustrations/LetterArt";
import { describe, expect, it } from "vitest";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

describe("letter associations", () => {
  it("covers A–Z with three words and illustrations", () => {
    expect(Object.keys(LETTER_ASSOCIATIONS).sort().join("")).toBe(ALPHABET.join(""));
    for (const letter of ALPHABET) {
      const items = associationsFor(letter);
      expect(items, letter).toHaveLength(3);
      for (const item of items) {
        expect(item.word.length).toBeGreaterThan(0);
        expect(LETTER_ART_IDS).toContain(item.art);
      }
      expect(associationFor(letter)?.art).toBe(items[0]?.art);
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
    expect(associationsFor("c").map((item) => item.word)).toEqual(["Cat", "Car", "Cake"]);
  });
});
