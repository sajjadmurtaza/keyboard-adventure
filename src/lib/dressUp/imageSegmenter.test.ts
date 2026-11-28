import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCAL_MEDIAPIPE_PATHS } from "@/lib/dressUp/privacy";
import {
  resetImageSegmenterCache,
  segmenterModelAvailable,
} from "@/lib/dressUp/imageSegmenter";

describe("imageSegmenter", () => {
  afterEach(() => {
    resetImageSegmenterCache();
    vi.unstubAllGlobals();
  });

  it("reports local model availability from HEAD probe", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        expect(url).toBe(LOCAL_MEDIAPIPE_PATHS.segmenterModel);
        return { ok: true } as Response;
      }),
    );
    await expect(segmenterModelAvailable()).resolves.toBe(true);
  });

  it("returns false when the local model is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false }) as Response),
    );
    await expect(segmenterModelAvailable()).resolves.toBe(false);
  });

  it("uses only the privacy-contract local path", () => {
    expect(LOCAL_MEDIAPIPE_PATHS.segmenterModel).toBe(
      "/mediapipe/selfie_segmenter.tflite",
    );
  });
});
