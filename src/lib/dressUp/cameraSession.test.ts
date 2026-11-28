import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getActiveCameraStream,
  startCameraSession,
  stopCameraTracks,
} from "@/lib/dressUp/cameraSession";

function fakeStream() {
  const track = {
    stop: vi.fn(),
    kind: "video",
  };
  return {
    getTracks: () => [track],
    getAudioTracks: () => [] as MediaStreamTrack[],
    getVideoTracks: () => [track as unknown as MediaStreamTrack],
    removeTrack: vi.fn(),
    _track: track,
  } as unknown as MediaStream & { _track: { stop: ReturnType<typeof vi.fn> } };
}

describe("cameraSession", () => {
  afterEach(() => {
    stopCameraTracks();
    vi.unstubAllGlobals();
  });

  it("refuses when parent has not allowed camera", async () => {
    const result = await startCameraSession({ parentAllowed: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("parent-disabled");
    expect(getActiveCameraStream()).toBeNull();
  });

  it("starts video-only and stops tracks", async () => {
    const stream = fakeStream();
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
      configurable: true,
    });

    const gum = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    const result = await startCameraSession({ parentAllowed: true });
    expect(result.ok).toBe(true);
    expect(getActiveCameraStream()).toBe(stream);
    expect(gum).toHaveBeenCalledWith({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: { ideal: 16 / 9 },
      },
    });

    stopCameraTracks();
    expect(stream._track.stop).toHaveBeenCalled();
    expect(getActiveCameraStream()).toBeNull();
  });

  it("maps permission denial", async () => {
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")),
      },
      configurable: true,
    });
    const result = await startCameraSession({ parentAllowed: true });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("not-allowed");
  });

  it("stops a stream that arrives after the child leaves (stale async)", async () => {
    let resolveGet: (stream: MediaStream) => void = () => undefined;
    const pending = new Promise<MediaStream>((resolve) => {
      resolveGet = resolve;
    });
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn().mockReturnValue(pending) },
      configurable: true,
    });

    const starting = startCameraSession({ parentAllowed: true });
    // Child leaves before getUserMedia resolves
    stopCameraTracks();
    const late = fakeStream();
    resolveGet(late);
    const result = await starting;
    expect(result.ok).toBe(true);
    // Caller must stop stale stream — simulate MagicDressUp gen check cleanup
    if (result.ok) stopCameraTracks(result.stream);
    expect(late._track.stop).toHaveBeenCalled();
    expect(getActiveCameraStream()).toBeNull();
  });
});
