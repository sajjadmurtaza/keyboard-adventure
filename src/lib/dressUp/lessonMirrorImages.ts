import {
  LESSON_MIRROR_COSTUMES,
  type LessonMirrorCostume,
} from "@/data/lessonMirrorCostumes";
import type { LetterArtId } from "@/data/letterAssociations";

const cache = new Map<LetterArtId, HTMLImageElement>();
let preloadPromise: Promise<void> | null = null;

export function getCachedLessonMirrorImage(
  art: LetterArtId,
): HTMLImageElement | null {
  const img = cache.get(art);
  if (!img || !img.complete || img.naturalWidth === 0) return null;
  return img;
}

function loadOne(costume: LessonMirrorCostume): Promise<HTMLImageElement> {
  const existing = cache.get(costume.art);
  if (existing?.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cache.set(costume.art, img);
      resolve(img);
    };
    img.onerror = () =>
      reject(new Error(`Failed to load lesson mirror costume ${costume.art}`));
    img.src = costume.assetPath;
    cache.set(costume.art, img);
  });
}

/** Preload F/J association costume SVGs (same-origin only). */
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
  preloadPromise = null;
}
