import {
  LESSON_MIRROR_COSTUMES,
  type LessonMirrorCostume,
} from "@/data/lessonMirrorCostumes";
import type { LetterArtId } from "@/data/letterAssociations";

type MirrorImage = HTMLImageElement | HTMLCanvasElement;

const cache = new Map<LetterArtId, MirrorImage>();
const pathByArt = new Map<LetterArtId, string>();
let preloadPromise: Promise<void> | null = null;

export function getCachedLessonMirrorImage(
  art: LetterArtId,
): MirrorImage | null {
  const img = cache.get(art);
  if (!img) return null;
  if (img instanceof HTMLCanvasElement) {
    return img.width > 0 && img.height > 0 ? img : null;
  }
  if (!img.complete || img.naturalWidth === 0) return null;
  return img;
}

/** Paint SVG/PNG into a canvas so costume overlays stay visible on Safari. */
function bakeImage(img: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  const w = img.naturalWidth || 320;
  const h = img.naturalHeight || 320;
  if (w <= 0 || h <= 0) return img;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img;
  try {
    ctx.drawImage(img, 0, 0, w, h);
  } catch {
    return img;
  }
  return canvas;
}

function loadOne(costume: LessonMirrorCostume): Promise<MirrorImage> {
  const priorPath = pathByArt.get(costume.art);
  if (priorPath && priorPath !== costume.assetPath) {
    cache.delete(costume.art);
  }
  pathByArt.set(costume.art, costume.assetPath);

  const existing = cache.get(costume.art);
  if (existing instanceof HTMLCanvasElement && existing.width > 0) {
    return Promise.resolve(existing);
  }
  if (
    existing instanceof HTMLImageElement &&
    existing.complete &&
    existing.naturalWidth > 0
  ) {
    const baked = bakeImage(existing);
    cache.set(costume.art, baked);
    return Promise.resolve(baked);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const baked = bakeImage(img);
      cache.set(costume.art, baked);
      resolve(baked);
    };
    img.onerror = () =>
      reject(new Error(`Failed to load lesson mirror costume ${costume.art}`));
    img.src = costume.assetPath;
  });
}

/** Load one canvas wearable. Companion props (empty assetPath) skip the network. */
export function ensureLessonMirrorImage(
  costume: LessonMirrorCostume,
): Promise<MirrorImage | null> {
  if (!costume.assetPath || costume.style === "companion") {
    return Promise.resolve(null);
  }
  return loadOne(costume);
}

/** Preload dedicated lesson-mirror SVGs (same-origin + sun). */
export function preloadLessonMirrorImages(): Promise<void> {
  preloadPromise ??= Promise.all(LESSON_MIRROR_COSTUMES.map(loadOne)).then(
    () => undefined,
  );
  return preloadPromise.catch((err) => {
    preloadPromise = null;
    throw err;
  });
}

export function resetLessonMirrorImageCache(): void {
  cache.clear();
  pathByArt.clear();
  preloadPromise = null;
}
