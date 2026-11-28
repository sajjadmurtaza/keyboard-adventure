/**
 * Single owner for Magic Dress-Up / Learning Mirror getUserMedia lifecycle.
 * Callers must have parent consent. Learning Mirror may auto-start when the
 * parent setting is on; Dress-Up still uses an explicit Start control.
 */

export type CameraSessionError =
  | "not-allowed"
  | "not-found"
  | "unavailable"
  | "insecure"
  | "parent-disabled";

export type CameraSessionResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; error: CameraSessionError; message: string };

let activeStream: MediaStream | null = null;

export function getActiveCameraStream(): MediaStream | null {
  return activeStream;
}

export function stopCameraTracks(stream: MediaStream | null = activeStream): void {
  if (!stream) {
    activeStream = null;
    return;
  }
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      /* ignore */
    }
  }
  if (activeStream === stream) activeStream = null;
}

/**
 * Start a user-facing camera preview. Caller must have verified parent toggle.
 * Does not auto-restart; each Start Mirror is an explicit request.
 */
export async function startCameraSession(opts: {
  parentAllowed: boolean;
}): Promise<CameraSessionResult> {
  stopCameraTracks();

  if (!opts.parentAllowed) {
    return {
      ok: false,
      error: "parent-disabled",
      message: "Ask a grown-up to allow Magic Mirror in Parent settings.",
    };
  }

  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      error: "unavailable",
      message: "This device cannot open a camera.",
    };
  }

  if (!window.isSecureContext) {
    return {
      ok: false,
      error: "insecure",
      message: "Camera needs a secure page (https or localhost).",
    };
  }

  try {
    // Prefer a wide landscape capture — standing-mirror framing, not a
    // tight selfie crop. Browsers pick the closest available mode.
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: { ideal: 16 / 9 },
      },
    });
    // Never keep a mic track even if the browser misbehaves
    for (const track of stream.getAudioTracks()) {
      track.stop();
      stream.removeTrack(track);
    }
    activeStream = stream;
    return { ok: true, stream };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return {
        ok: false,
        error: "not-allowed",
        message: "Camera permission was denied. Typing still works!",
      };
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return {
        ok: false,
        error: "not-found",
        message: "No camera found. Typing still works!",
      };
    }
    return {
      ok: false,
      error: "unavailable",
      message: "Could not start the camera. Typing still works!",
    };
  }
}
