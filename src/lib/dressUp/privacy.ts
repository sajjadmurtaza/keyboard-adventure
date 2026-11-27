/**
 * Privacy contract helpers for Magic Dress-Up.
 * Camera frames and landmarks must never leave the device.
 */

/** Hostnames that must never receive dress-up media payloads. */
export const FORBIDDEN_DRESS_UP_HOST_FRAGMENTS = [
  "decart",
  "openai.com",
  "googleapis.com",
  "gstatic.com",
  "mediapipe.run",
  "storage.googleapis.com",
] as const;

export type DressUpNetworkProbe = {
  url: string;
  method?: string;
  bodyKind?: "blob" | "arraybuffer" | "formdata" | "json" | "text" | "unknown";
};

/**
 * Returns true if a request looks like it could exfiltrate camera/landmark data.
 * Used in tests; production code never uploads frames.
 */
export function looksLikeCameraExfiltration(probe: DressUpNetworkProbe): boolean {
  const url = probe.url.toLowerCase();
  if (url.startsWith("blob:") || url.startsWith("data:")) return false;
  // Local app assets are fine
  if (url.startsWith("/") || url.startsWith("./") || url.includes("localhost")) {
    if (probe.bodyKind === "blob" || probe.bodyKind === "arraybuffer" || probe.bodyKind === "formdata") {
      // Still suspicious if posting binary to a non-asset path
      if (url.includes("/api/") || url.includes("upload")) return true;
    }
    return false;
  }
  for (const frag of FORBIDDEN_DRESS_UP_HOST_FRAGMENTS) {
    if (url.includes(frag)) return true;
  }
  if (probe.bodyKind === "blob" || probe.bodyKind === "arraybuffer" || probe.bodyKind === "formdata") {
    return true;
  }
  return false;
}

/** Absolute paths allowed for MediaPipe assets (no CDN). */
export const LOCAL_MEDIAPIPE_PATHS = {
  wasmRoot: "/mediapipe/wasm",
  model: "/mediapipe/face_landmarker.task",
  /** Optional — jacket try-on uses face shoulders until this is synced locally. */
  poseModel: "/mediapipe/pose_landmarker_lite.task",
  /** Optional — underwater person cutout when synced locally. */
  segmenterModel: "/mediapipe/selfie_segmenter.tflite",
} as const;

export function isLocalMediapipeUrl(url: string): boolean {
  try {
    // Relative app paths only — reject absolute http(s) CDNs even if path matches
    if (
      url.startsWith("/mediapipe/") ||
      url.startsWith("/dress-up/") ||
      url.startsWith("/lesson-mirror/")
    ) {
      return true;
    }
    if (/^https?:\/\//i.test(url) || url.startsWith("//")) return false;
    const u = new URL(url, "http://localhost");
    return (
      u.pathname.startsWith("/mediapipe/") ||
      u.pathname.startsWith("/dress-up/") ||
      u.pathname.startsWith("/lesson-mirror/")
    );
  } catch {
    return false;
  }
}
