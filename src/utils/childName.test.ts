import { CHILD_NAME_MAX, isValidChildName, parseChildName } from "@/utils/childName";
import { describe, expect, it } from "vitest";

describe("child name", () => {
  it("accepts international names and rejects blanks", () => {
    expect(parseChildName("  Fatima  ")).toBe("Fatima");
    expect(parseChildName("José")).toBe("José");
    expect(parseChildName("あかり")).toBe("あかり");
    expect(parseChildName("Mary-Jane O'Neil")).toBe("Mary-Jane O'Neil");
    expect(parseChildName("")).toBeNull();
    expect(parseChildName("   ")).toBeNull();
    expect(parseChildName("a".repeat(CHILD_NAME_MAX + 1))).toBeNull();
    expect(isValidChildName("Fatima")).toBe(true);
    expect(isValidChildName("")).toBe(false);
  });
});
