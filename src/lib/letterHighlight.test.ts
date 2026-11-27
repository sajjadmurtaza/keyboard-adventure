import { describe, expect, it } from "vitest";
import { firstLetterIndex } from "@/lib/letterHighlight";

describe("firstLetterIndex", () => {
  it("finds the first matching letter case-insensitively", () => {
    expect(firstLetterIndex("Fish", "f")).toBe(0);
    expect(firstLetterIndex("Jelly", "J")).toBe(0);
    expect(firstLetterIndex("Jacket", "a")).toBe(1);
  });

  it("returns -1 when missing or invalid", () => {
    expect(firstLetterIndex("Fish", "z")).toBe(-1);
    expect(firstLetterIndex("Fish", "")).toBe(-1);
    expect(firstLetterIndex("", "f")).toBe(-1);
  });
});
