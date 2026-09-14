import { fingerHint } from "@/utils/keys";
import {
  keyboardLayout,
  parseKeyboardLayout,
} from "@/utils/keyboardLayouts";
import { describe, expect, it } from "vitest";

describe("finger hints", () => {
  it("maps home-row keys", () => {
    expect(fingerHint("f").hand).toBe("left");
    expect(fingerHint("f").label).toMatch(/index/i);
    expect(fingerHint("j").hand).toBe("right");
    expect(fingerHint("j").label).toMatch(/index/i);
    expect(fingerHint("d").hand).toBe("left");
    expect(fingerHint("d").label).toMatch(/middle/i);
    expect(fingerHint("k").hand).toBe("right");
    expect(fingerHint("k").label).toMatch(/middle/i);
    expect(fingerHint(" ").hand).toBe("thumbs");
    expect(fingerHint("~").label).toBe("Find this key");
  });

  it("follows German and French key positions", () => {
    expect(fingerHint("z", "de-de").hand).toBe("right");
    expect(fingerHint("z", "de-de").label).toMatch(/index/i);
    expect(fingerHint("y", "de-de").hand).toBe("left");
    expect(fingerHint("y", "de-de").label).toMatch(/pinky/i);
    expect(fingerHint("ü", "de-de").hand).toBe("right");
    expect(fingerHint("a", "fr-fr").hand).toBe("left");
    expect(fingerHint("a", "fr-fr").label).toMatch(/pinky/i);
    expect(fingerHint("q", "fr-fr").label).toMatch(/pinky/i);
    expect(fingerHint("/", "de-de").label).toBe("Find this key");
  });
});

describe("keyboard layouts", () => {
  it("defaults to English", () => {
    expect(parseKeyboardLayout(undefined)).toBe("en-us");
    expect(parseKeyboardLayout("de-de")).toBe("de-de");
    expect(keyboardLayout("fr-fr").label).toBe("French");
    expect(keyboardLayout("xx" as "en-us").id).toBe("en-us");
  });
});
