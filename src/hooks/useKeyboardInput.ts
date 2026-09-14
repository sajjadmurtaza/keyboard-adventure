"use client";

import { useEffect } from "react";
import { eventToKey } from "@/utils/keys";

export function useKeyboardInput(onKey: (key: string) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handle(event: KeyboardEvent) {
      const key = eventToKey(event);
      if (!key) return;
      const fromField = event.target instanceof HTMLInputElement;
      if (!fromField) event.preventDefault();
      onKey(key);
    }

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [enabled, onKey]);
}
