import {
  LETTER_ASSOCIATIONS,
  PUNCTUATION_ASSOCIATIONS,
  associationFor,
  associationsFor,
} from "@/data/letterAssociations";
import { LETTER_ART_IDS } from "@/components/illustrations/LetterArt";
import { describe, expect, it } from "vitest";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const PUNCT = Object.keys(PUNCTUATION_ASSOCIATIONS);

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

  it("covers space and punctuation with three words and illustrations", () => {
    expect(PUNCT.sort()).toEqual([" ", ",", ".", "/", ";"].sort());
    for (const key of PUNCT) {
      const items = associationsFor(key);
      expect(items, JSON.stringify(key)).toHaveLength(3);
      for (const item of items) {
        expect(item.word.length).toBeGreaterThan(0);
        expect(LETTER_ART_IDS).toContain(item.art);
      }
    }
    expect(associationFor(";")?.word).toBe("Stop");
    expect(associationFor(" ")?.word).toBe("Jump");
  });

  it("ignores multi-character keys", () => {
    expect(associationFor("ff")).toBeNull();
    expect(associationsFor("abc")).toEqual([]);
  });

  it("keeps the illustration identity stable for F", () => {
    expect(associationFor("F")?.art).toBe("fish");
    expect(associationFor("f")?.word).toBe("Fish");
    expect(associationsFor("c").map((item) => item.word)).toEqual(["Cat", "Car", "Cake"]);
  });
});
