import { describe, expect, it } from "vitest";
import {
  isLocalMediapipeUrl,
  LOCAL_MEDIAPIPE_PATHS,
  looksLikeCameraExfiltration,
} from "@/lib/dressUp/privacy";

describe("dress-up privacy", () => {
  it("allows only local MediaPipe and costume asset paths", () => {
    expect(isLocalMediapipeUrl(LOCAL_MEDIAPIPE_PATHS.model)).toBe(true);
    expect(isLocalMediapipeUrl("/mediapipe/wasm/vision_wasm_internal.js")).toBe(true);
    expect(isLocalMediapipeUrl("/dress-up/astronaut.svg")).toBe(true);
    expect(isLocalMediapipeUrl("/lesson-mirror/frog.svg")).toBe(true);
    expect(isLocalMediapipeUrl("https://cdn.example/mediapipe/wasm.js")).toBe(false);
  });

  it("flags camera-like uploads and cloud VTON hosts", () => {
    expect(
      looksLikeCameraExfiltration({
        url: "https://platform.decart.ai/v1/tryon",
        bodyKind: "blob",
      }),
    ).toBe(true);
    expect(
      looksLikeCameraExfiltration({
        url: "https://storage.googleapis.com/upload",
        bodyKind: "arraybuffer",
      }),
    ).toBe(true);
    expect(
      looksLikeCameraExfiltration({
        url: "/mediapipe/face_landmarker.task",
        method: "GET",
      }),
    ).toBe(false);
    expect(
      looksLikeCameraExfiltration({
        url: "/api/upload",
        bodyKind: "blob",
      }),
    ).toBe(true);
  });
});
