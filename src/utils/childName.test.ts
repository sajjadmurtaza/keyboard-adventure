import { CHILD_NAME_MAX, isValidChildName, parseChildName } from "@/utils/childName";
import { describe, expect, it } from "vitest";

describe("child name", () => {
  it("accepts international names and rejects blanks", () => {
    expect(parseChildName("  Fatima  ")).toBe("Fatima");
    expect(parseChildName("José")).toBe("José");
    expect(parseChildName("あかり")).toBe("あかり");
    expect(parseChildName("Mary-Jane O'Neil")).toBe("Mary-Jane O'Neil");
    expect(parseChildName("www.scam.example")).toBeNull();
    expect(parseChildName("<img src=x>")).toBeNull();
    expect(parseChildName("Ada@scam.com")).toBeNull();
    expect(parseChildName("javascript:alert(1)")).toBeNull();
    expect(parseChildName("")).toBeNull();
    expect(parseChildName("   ")).toBeNull();
    expect(parseChildName("a".repeat(CHILD_NAME_MAX + 1))).toBeNull();
    expect(parseChildName("Ada\u0001")).toBeNull();
    expect(parseChildName(12)).toBeNull();
    expect(isValidChildName("Fatima")).toBe(true);
    expect(isValidChildName("")).toBe(false);
  });
});
