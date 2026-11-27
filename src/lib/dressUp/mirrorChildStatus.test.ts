import { describe, expect, it } from "vitest";
import { mirrorChildStatus } from "@/lib/dressUp/mirrorChildStatus";

const base = {
  loadStep: 0,
  faceMissing: false,
  cameraAllowedByParent: true,
  cheerLine: null,
  errorMessage: null,
  justStopped: false,
} as const;

describe("mirrorChildStatus", () => {
  it("maps starting steps to magical loading lines", () => {
    expect(
      mirrorChildStatus({ ...base, mirror: "starting", loadStep: 1 }).line,
    ).toMatch(/Waking up/);
    expect(
      mirrorChildStatus({ ...base, mirror: "starting", loadStep: 2 }).line,
    ).toMatch(/Getting the magic/);
  });

  it("maps live face states without tech jargon", () => {
    expect(
      mirrorChildStatus({ ...base, mirror: "live", faceMissing: true }).line,
    ).toMatch(/Come into the mirror/);
    expect(
      mirrorChildStatus({ ...base, mirror: "live", faceMissing: false }).line,
    ).toMatch(/Looking magical/);
  });

  it("prefers costume cheer when present", () => {
    expect(
      mirrorChildStatus({
        ...base,
        mirror: "live",
        cheerLine: "🎉 Wow! You're an astronaut!",
      }).line,
    ).toMatch(/astronaut/);
  });

  it("shows resting after stop and grown-up help when gated", () => {
    expect(
      mirrorChildStatus({ ...base, mirror: "idle", justStopped: true }).line,
    ).toMatch(/resting/);
    expect(
      mirrorChildStatus({
        ...base,
        mirror: "idle",
        cameraAllowedByParent: false,
      }).line,
    ).toMatch(/grown-up/);
  });

  it("softens permission errors for kids", () => {
    expect(
      mirrorChildStatus({
        ...base,
        mirror: "error",
        errorMessage: "Ask a grown-up to allow Magic Mirror in Parent settings.",
      }).line,
    ).toMatch(/Ask a grown-up for help/);
  });
});
