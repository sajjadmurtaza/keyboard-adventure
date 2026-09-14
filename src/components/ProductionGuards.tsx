"use client";

import { useEffect } from "react";
import { isInspectShortcut, shouldBlockSelection, shouldLockPageTools } from "@/utils/pageLock";

export function ProductionGuards() {
  useEffect(() => {
    if (!shouldLockPageTools(window.location.hostname)) return;

    const blockMenu = (event: Event) => event.preventDefault();
    const blockCopy = (event: ClipboardEvent) => {
      if (!shouldBlockSelection(event.target)) return;
      event.preventDefault();
    };
    const blockInspect = (event: KeyboardEvent) => {
      if (!shouldBlockSelection(event.target)) return;
      if (!isInspectShortcut(event)) return;
      event.preventDefault();
    };

    const blockSelect = (event: Event) => {
      if (!shouldBlockSelection(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener("contextmenu", blockMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("keydown", blockInspect);
    return () => {
      document.removeEventListener("contextmenu", blockMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("keydown", blockInspect);
    };
  }, []);

  return null;
}
