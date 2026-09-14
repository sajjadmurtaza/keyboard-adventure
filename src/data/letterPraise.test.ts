import {
  getSuccessPraise,
  resetLetterPraiseMemory,
} from "@/data/letterPraise";
import { beforeEach, describe, expect, it } from "vitest";

describe("letter-matched praise", () => {
  beforeEach(() => {
    resetLetterPraiseMemory();
  });

  it("uses F and G praise pools", () => {
    const f = getSuccessPraise("F", { firstLook: false, streak: 1, random: () => 0 });
    expect(f.spoken.split("!")[0] + "!").toMatch(/Fantastic/);
    expect(f.showObject).toBe(true);
    expect(f.teachLine).toBe("eff is for Fish!");
    const g = getSuccessPraise("g", { firstLook: false, streak: 1, random: () => 0 });
    expect(g.spoken.startsWith("Great")).toBe(true);
  });

  it("combines Fish on first look", () => {
    const praise = getSuccessPraise("f", { firstLook: true, streak: 1, random: () => 0 });
    expect(praise.teachLine).toContain("eff is for Fish");
    expect(praise.showObject).toBe(true);
    expect(praise.speak).toBe(true);
    expect(praise.speakTeach).toBe(true);
  });

  it("falls back for punctuation", () => {
    const praise = getSuccessPraise(";", { firstLook: false, streak: 1, random: () => 0 });
    expect(["Great job!", "Amazing!", "You got it!", "Super!"]).toContain(praise.spoken);
  });

  it("does not repeat the same F phrase consecutively", () => {
    const first = getSuccessPraise("f", { firstLook: false, streak: 1, random: () => 0 });
    const second = getSuccessPraise("f", { firstLook: false, streak: 1, random: () => 0 });
    expect(first.spoken).not.toBe(second.spoken);
  });

  it("keeps Fish visible on a later repeat and may skip the spoken teach line", () => {
    const praise = getSuccessPraise("f", { firstLook: false, streak: 1, random: () => 0.9 });
    expect(praise.showObject).toBe(true);
    expect(praise.spoken).not.toContain("Fish");
    expect(praise.speakTeach).toBe(false);
  });

  it("skips extra speech on streak milestones", () => {
    const praise = getSuccessPraise("f", { firstLook: true, streak: 3, random: () => 0 });
    expect(praise.speak).toBe(false);
    expect(praise.speakTeach).toBe(false);
  });

  it("handles space", () => {
    const praise = getSuccessPraise(" ", { firstLook: true, streak: 1, random: () => 0 });
    expect(praise.banner).toBe("SUPER!");
    expect(praise.showObject).toBe(false);
    const quiet = getSuccessPraise(" ", { firstLook: false, streak: 3, random: () => 0.9 });
    expect(quiet.speak).toBe(false);
  });
});
