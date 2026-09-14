"use client";

import { useEffect, useSyncExternalStore } from "react";

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

export function useCoarsePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(pointer: coarse)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    () => false,
  );
}

function keyboardLooksOpen() {
  const viewport = window.visualViewport;
  const visible = viewport?.height ?? window.innerHeight;
  const narrow = window.matchMedia("(max-width: 500px)").matches;
  if (narrow && visible < 540) return true;
  if (!viewport) return false;
  return window.innerHeight - viewport.height > 80;
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
    keyboardLooksOpen,
    () => false,
  );
}

export function useHeightDensity() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      window.visualViewport?.addEventListener("resize", onChange);
      return () => {
        window.removeEventListener("resize", onChange);
        window.visualViewport?.removeEventListener("resize", onChange);
      };
    },
    () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      if (height < 650) return "tight" as const;
      if (height < 760) return "compact" as const;
      if (height < 900) return "normal" as const;
      return "tall" as const;
    },
    () => "tall" as const,
  );
}

export function useVisualViewportVar() {
  useEffect(() => {
    function sync() {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty(
        "--visual-viewport-height",
        `${Math.round(height)}px`,
      );
    }
    sync();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
}
