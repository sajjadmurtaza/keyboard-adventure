import {
  DRESS_UP_COSTUMES,
  getDressUpCostume,
  type DressUpId,
} from "@/data/dressUpCostumes";

const cache = new Map<DressUpId, HTMLImageElement>();
let preloadPromise: Promise<void> | null = null;

export function costumeAssetUrl(id: DressUpId): string {
  return getDressUpCostume(id).assetPath;
}

export function getCachedCostumeImage(id: DressUpId): HTMLImageElement | null {
  const img = cache.get(id);
  if (!img || !img.complete || img.naturalWidth === 0) return null;
  return img;
}

function loadOne(id: DressUpId): Promise<HTMLImageElement> {
  const existing = cache.get(id);
  if (existing?.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cache.set(id, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load costume ${id}`));
    img.src = costumeAssetUrl(id);
    cache.set(id, img);
  });
}

/** Preload all six local costume SVGs (same-origin only). */
export function preloadCostumeImages(): Promise<void> {
  preloadPromise ??= Promise.all(DRESS_UP_COSTUMES.map((c) => loadOne(c.id))).then(() => undefined);
  return preloadPromise.catch((err) => {
    preloadPromise = null;
    throw err;
  });
}

export function resetCostumeImageCache(): void {
  cache.clear();
  preloadPromise = null;
}
