import { displayKey, eventToKey, instructionFor, isIgnoredKey, keysMatch, normalizeTarget, tinyHint, typedCharFromText } from "@/utils/keys";
import { describe, expect, it } from "vitest";

function keyEvent(partial: Partial<KeyboardEvent> & { key: string }): KeyboardEvent {
  return {
    repeat: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...partial,
  } as KeyboardEvent;
}

describe("keys", () => {
  it("normalizes letters and space", () => {
    expect(normalizeTarget("F")).toBe("f");
    expect(normalizeTarget(" ")).toBe(" ");
    expect(normalizeTarget("space")).toBe(" ");
    expect(normalizeTarget("Space")).toBe(" ");
  });

  it("matches case-insensitively", () => {
    expect(keysMatch("F", "f")).toBe(true);
    expect(keysMatch("g", "f")).toBe(false);
  });

  it("ignores repeats and modifiers", () => {
    expect(isIgnoredKey(keyEvent({ key: "f", repeat: true }))).toBe(true);
    expect(isIgnoredKey(keyEvent({ key: "f", ctrlKey: true }))).toBe(true);
    expect(eventToKey(keyEvent({ key: "F" }))).toBe("f");
    expect(eventToKey(keyEvent({ key: " " }))).toBe(" ");
    expect(eventToKey(keyEvent({ key: "Shift" }))).toBeNull();
    expect(eventToKey(keyEvent({ key: "F1" }))).toBeNull();
    expect(eventToKey(keyEvent({ key: "Enter" }))).toBeNull();
  });

  it("reads last typed character and punctuation hints", () => {
    expect(typedCharFromText("")).toBeNull();
    expect(typedCharFromText("F")).toBe("f");
    expect(typedCharFromText("ab")).toBe("b");
    expect(typedCharFromText("\n")).toBeNull();
    expect(tinyHint(";")).toBe("Semicolon");
    expect(tinyHint(",")).toBe("Comma");
    expect(tinyHint(".")).toBe("Period");
    expect(tinyHint("/")).toBe("Slash");
    expect(tinyHint("f")).toBeNull();
    expect(eventToKey(keyEvent({ key: "Dead" }))).toBeNull();
  });

  it("displays keys for children", () => {
    expect(displayKey(" ")).toBe("SPACE");
    expect(displayKey("f")).toBe("F");
    expect(instructionFor(" ")).toBe("Press the space bar");
    expect(instructionFor("j")).toBe("Press the J key");
  });
});
