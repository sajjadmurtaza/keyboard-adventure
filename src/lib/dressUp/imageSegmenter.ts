/**
 * Optional local Image Segmenter for person cutout compositing.
 * Lazy-loaded only when parent authorizes and a local model is present.
 * Never uploads frames, masks, or landmarks.
 */

import { LOCAL_MEDIAPIPE_PATHS } from "@/lib/dressUp/privacy";

export type ImageSegmenterHandle = {
  /**
   * Run segmentation for the current video frame.
   * Returns a canvas sized to the video with alpha = person confidence,
   * or null when inference fails (caller keeps rectangular overlay).
   */
  segmentPerson: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => HTMLCanvasElement | null;
  close: () => void;
  readonly modelBytesApprox: number;
};

let segmenterPromise: Promise<ImageSegmenterHandle | null> | null = null;

/** Probe whether the selfie segmenter model is hosted locally (no CDN). */
export async function segmenterModelAvailable(): Promise<boolean> {
  try {
    const res = await fetch(LOCAL_MEDIAPIPE_PATHS.segmenterModel, {
      method: "HEAD",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Create an Image Segmenter when the local model is bundled and parent-authorized.
 * Returns null when missing or unsupported — callers must keep live-video overlay.
 */
export async function getImageSegmenter(): Promise<ImageSegmenterHandle | null> {
  if (segmenterPromise) return segmenterPromise;
  segmenterPromise = (async () => {
    if (!(await segmenterModelAvailable())) return null;
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const wasm = await vision.FilesetResolver.forVisionTasks(
        LOCAL_MEDIAPIPE_PATHS.wasmRoot,
      );
      let segmenter;
      try {
        segmenter = await vision.ImageSegmenter.createFromOptions(wasm, {
          baseOptions: {
            modelAssetPath: LOCAL_MEDIAPIPE_PATHS.segmenterModel,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch {
        segmenter = await vision.ImageSegmenter.createFromOptions(wasm, {
          baseOptions: {
            modelAssetPath: LOCAL_MEDIAPIPE_PATHS.segmenterModel,
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      }

      let lastTimestamp = -1;
      const maskCanvas =
        typeof document !== "undefined" ? document.createElement("canvas") : null;
      const personCanvas =
        typeof document !== "undefined" ? document.createElement("canvas") : null;
      if (!maskCanvas || !personCanvas) return null;

      return {
        modelBytesApprox: 249_537,
        segmentPerson(video, timestampMs) {
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (!w || !h) return null;
          let ts = timestampMs;
          if (ts <= lastTimestamp) ts = lastTimestamp + 1;
          lastTimestamp = ts;

          const result = segmenter.segmentForVideo(video, ts);
          try {
            const mask = result.confidenceMasks?.[0];
            if (!mask) return null;

            if (maskCanvas.width !== w || maskCanvas.height !== h) {
              maskCanvas.width = w;
              maskCanvas.height = h;
            }
            if (personCanvas.width !== w || personCanvas.height !== h) {
              personCanvas.width = w;
              personCanvas.height = h;
            }

            const maskCtx = maskCanvas.getContext("2d");
            const personCtx = personCanvas.getContext("2d");
            if (!maskCtx || !personCtx) return null;

            // Draw confidence mask into an ImageData alpha channel.
            const floatData = mask.getAsFloat32Array();
            const mw = mask.width;
            const mh = mask.height;
            const imageData = maskCtx.createImageData(mw, mh);
            for (let i = 0; i < floatData.length; i += 1) {
              const conf = floatData[i] ?? 0;
              // Soft threshold keeps hair/shoulder edges natural.
              const a = conf > 0.35 ? Math.min(255, Math.round(conf * 255)) : 0;
              const o = i * 4;
              imageData.data[o] = 255;
              imageData.data[o + 1] = 255;
              imageData.data[o + 2] = 255;
              imageData.data[o + 3] = a;
            }
            if (mw !== w || mh !== h) {
              const tmp = document.createElement("canvas");
              tmp.width = mw;
              tmp.height = mh;
              const tctx = tmp.getContext("2d");
              if (!tctx) return null;
              tctx.putImageData(imageData, 0, 0);
              maskCtx.clearRect(0, 0, w, h);
              maskCtx.drawImage(tmp, 0, 0, w, h);
            } else {
              maskCtx.putImageData(imageData, 0, 0);
            }

            personCtx.clearRect(0, 0, w, h);
            personCtx.drawImage(video, 0, 0, w, h);
            personCtx.globalCompositeOperation = "destination-in";
            personCtx.drawImage(maskCanvas, 0, 0, w, h);
            personCtx.globalCompositeOperation = "source-over";
            return personCanvas;
          } finally {
            try {
              result.close();
            } catch {
              /* ignore */
            }
          }
        },
        close() {
          try {
            segmenter.close();
          } catch {
            /* ignore */
          }
        },
      };
    } catch {
      return null;
    }
  })();
  return segmenterPromise;
}

export function resetImageSegmenterCache(): void {
  segmenterPromise = null;
}
