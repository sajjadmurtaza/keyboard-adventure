import { describe, expect, it } from "vitest";
import { fallbackMirrorProp } from "@/lib/dressUp/fallbackMirrorProp";
import { isCanvasLessonCostume } from "@/data/lessonMirrorCostumes";

describe("fallbackMirrorProp", () => {
  it("builds a LetterArt companion — never a data-URI circle ring", () => {
    const prop = fallbackMirrorProp("kite", "Kite", "#4FC3F7");
    expect(prop.art).toBe("kite");
    expect(prop.name).toBe("Kite");
    expect(prop.fallback).toBe(true);
    expect(prop.style).toBe("companion");
    expect(prop.assetPath).toBe("");
    expect(isCanvasLessonCostume(prop)).toBe(false);
  });

  it("keeps drum and juice as dedicated arts (companion only when missing)", () => {
    const drum = fallbackMirrorProp("drum", "Drum");
    expect(drum.style).toBe("companion");
    expect(drum.assetPath).toBe("");
  });
});
