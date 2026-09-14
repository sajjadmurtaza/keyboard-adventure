"use client";

import { useSyncExternalStore } from "react";

const LAYOUT_QUERY = "(max-width: 500px)";

export function useNarrowLayout() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(LAYOUT_QUERY);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(LAYOUT_QUERY).matches,
    () => false,
  );
}

export function useSoftwareKeyboardOpen() {
  return useSyncExternalStore(
    (onChange) => {
      const viewport = window.visualViewport;
      viewport?.addEventListener("resize", onChange);
      viewport?.addEventListener("scroll", onChange);
      window.addEventListener("resize", onChange);
      return () => {
        viewport?.removeEventListener("resize", onChange);
        viewport?.removeEventListener("scroll", onChange);
        window.removeEventListener("resize", onChange);
      };
    },
    () => {
      const viewport = window.visualViewport;
      if (!viewport) return false;
      return window.innerHeight - viewport.height > 90;
    },
    () => false,
  );
}
