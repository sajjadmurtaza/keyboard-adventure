import { describe, expect, it } from "vitest";
import { fallbackMirrorProp } from "@/lib/dressUp/fallbackMirrorProp";

describe("fallbackMirrorProp", () => {
  it("builds a data-URI face ring for any art", () => {
    const prop = fallbackMirrorProp("kite", "Kite", "#4FC3F7");
    expect(prop.art).toBe("kite");
    expect(prop.name).toBe("Kite");
    expect(prop.fallback).toBe(true);
    expect(prop.assetPath.startsWith("data:image/svg+xml")).toBe(true);
    expect(decodeURIComponent(prop.assetPath)).toContain("Kite");
  });
});
