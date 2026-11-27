/**
 * Lazy MediaPipe Face Landmarker — loaded only when Start Magic Mirror runs.
 * WASM + model must be served from /mediapipe (no CDN).
 */

import { LOCAL_MEDIAPIPE_PATHS } from "@/lib/dressUp/privacy";

export type FaceLandmarkerDelegate = "GPU" | "CPU";

export type FaceLandmarkerHandle = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => { faceLandmarks: Array<Array<{ x: number; y: number; z?: number }>> };
  close: () => void;
  /** Which inference delegate succeeded for this instance. */
  readonly delegate: FaceLandmarkerDelegate;
};

type TasksVisionModule = typeof import("@mediapipe/tasks-vision");
type Delegate = FaceLandmarkerDelegate;

let visionModulePromise: Promise<TasksVisionModule> | null = null;
let landmarkerPromise: Promise<FaceLandmarkerHandle> | null = null;
let quietDepth = 0;
let originalConsoleError: typeof console.error | null = null;

function isBenignTfLiteNoise(args: unknown[]): boolean {
  const text = args.map((a) => String(a)).join(" ");
  return (
    text.includes("TensorFlow Lite") ||
    text.includes("XNNPACK") ||
    text.includes("Inference Feedback Manager") ||
    /^INFO:/i.test(text)
  );
}

/** TFLite INFO lines use console.error and trip the Next.js error overlay. */
function beginQuietTfLiteLogs(): void {
  if (quietDepth === 0) {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      if (isBenignTfLiteNoise(args)) return;
      originalConsoleError?.apply(console, args as Parameters<typeof console.error>);
    };
  }
  quietDepth += 1;
}

function endQuietTfLiteLogs(): void {
  quietDepth = Math.max(0, quietDepth - 1);
  if (quietDepth === 0 && originalConsoleError) {
    console.error = originalConsoleError;
    originalConsoleError = null;
  }
}

async function loadVisionModule(): Promise<TasksVisionModule> {
  visionModulePromise ??= import("@mediapipe/tasks-vision");
  return visionModulePromise;
}

async function createLandmarker(
  vision: TasksVisionModule,
  wasm: Awaited<ReturnType<typeof vision.FilesetResolver.forVisionTasks>>,
  delegate: Delegate,
) {
  beginQuietTfLiteLogs();
  try {
    return await vision.FaceLandmarker.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath: LOCAL_MEDIAPIPE_PATHS.model,
        delegate,
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
  } finally {
    endQuietTfLiteLogs();
  }
}

/** True when a Face Landmarker instance is already loading or ready (warm Start). */
export function isFaceLandmarkerWarm(): boolean {
  return landmarkerPromise !== null;
}

/**
 * Create (or reuse) a Face Landmarker configured for local assets, 1 face.
 * Tries GPU first, then CPU — Safari/iPad often need the CPU path.
 */
export async function getFaceLandmarker(): Promise<FaceLandmarkerHandle> {
  landmarkerPromise ??= (async () => {
    const vision = await loadVisionModule();
    const wasm = await vision.FilesetResolver.forVisionTasks(LOCAL_MEDIAPIPE_PATHS.wasmRoot);
    let landmarker;
    let delegate: Delegate = "GPU";
    try {
      landmarker = await createLandmarker(vision, wasm, "GPU");
      delegate = "GPU";
    } catch {
      landmarker = await createLandmarker(vision, wasm, "CPU");
      delegate = "CPU";
    }
    let lastTimestamp = -1;
    // Keep quiet for the whole open session — TFLite may log after detect returns.
    beginQuietTfLiteLogs();
    return {
      delegate,
      detectForVideo(video, timestampMs) {
        // VIDEO mode requires strictly increasing timestamps.
        let ts = timestampMs;
        if (ts <= lastTimestamp) ts = lastTimestamp + 1;
        lastTimestamp = ts;
        const result = landmarker.detectForVideo(video, ts);
        return {
          faceLandmarks: (result.faceLandmarks ?? []) as Array<
            Array<{ x: number; y: number; z?: number }>
          >,
        };
      },
      close() {
        try {
          landmarker.close();
        } finally {
          endQuietTfLiteLogs();
          landmarkerPromise = null;
        }
      },
    };
  })();

  try {
    return await landmarkerPromise;
  } catch (err) {
    landmarkerPromise = null;
    throw err;
  }
}

export function resetFaceLandmarkerCache(): void {
  landmarkerPromise = null;
  visionModulePromise = null;
  while (quietDepth > 0) endQuietTfLiteLogs();
}
