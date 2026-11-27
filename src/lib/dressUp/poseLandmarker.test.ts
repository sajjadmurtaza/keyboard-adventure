import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  poseModelAvailable,
  resetPoseLandmarkerCache,
  getPoseLandmarker,
} from "@/lib/dressUp/poseLandmarker";

describe("poseLandmarker", () => {
  beforeEach(() => {
    resetPoseLandmarkerCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetPoseLandmarkerCache();
  });

  it("reports missing local pose model without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false }) as Response),
    );
    expect(await poseModelAvailable()).toBe(false);
    expect(await getPoseLandmarker()).toBeNull();
  });
});
