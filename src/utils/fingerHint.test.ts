import { fingerHint } from "@/utils/keys";
import {
  detectKeyboardLayout,
  detectLayoutFromMap,
  keyboardLayout,
  layoutFromTypedKey,
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
  it("defaults to Auto", () => {
    expect(parseKeyboardLayout(undefined)).toBe("auto");
    expect(parseKeyboardLayout("de-de")).toBe("de-de");
    expect(parseKeyboardLayout("auto")).toBe("auto");
    expect(keyboardLayout("fr-fr").label).toBe("French");
    expect(keyboardLayout("xx" as "en-us").id).toBe("en-us");
  });

  it("detects QWERTZ and AZERTY from a layout map", () => {
    const map = (pairs: Record<string, string>) => ({
      get(code: string) {
        return pairs[code];
      },
    });
    expect(detectLayoutFromMap(map({ KeyQ: "q", KeyY: "y", KeyZ: "z" }))).toBe("en-us");
    expect(detectLayoutFromMap(map({ KeyQ: "q", KeyY: "z", KeyZ: "y" }))).toBe("de-de");
    expect(detectLayoutFromMap(map({ KeyQ: "a", KeyA: "q", KeyZ: "w" }))).toBe("fr-fr");
    expect(layoutFromTypedKey("KeyY", "z")).toBe("de-de");
    expect(layoutFromTypedKey("KeyQ", "a")).toBe("fr-fr");
    expect(layoutFromTypedKey("KeyF", "f")).toBeNull();
  });

  it("reads the browser layout map when present", async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis.navigator, "keyboard");
    Object.defineProperty(globalThis.navigator, "keyboard", {
      configurable: true,
      value: {
        getLayoutMap: async () => ({
          get(code: string) {
            if (code === "KeyY") return "z";
            if (code === "KeyZ") return "y";
            if (code === "KeyQ") return "q";
            if (code === "KeyA") return "a";
            return "";
          },
        }),
      },
    });
    await expect(detectKeyboardLayout()).resolves.toBe("de-de");
    Object.defineProperty(globalThis.navigator, "keyboard", {
      configurable: true,
      value: {
        getLayoutMap: async () => {
          throw new Error("denied");
        },
      },
    });
    await expect(detectKeyboardLayout()).resolves.toBe("en-us");
    Object.defineProperty(globalThis.navigator, "keyboard", {
      configurable: true,
      value: undefined,
    });
    await expect(detectKeyboardLayout()).resolves.toBe("en-us");
    if (original) Object.defineProperty(globalThis.navigator, "keyboard", original);
  });
});
