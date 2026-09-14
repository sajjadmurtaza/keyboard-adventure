"use client";

import { useEffect } from "react";
import { isEditableTarget, isInspectShortcut, shouldLockPageTools } from "@/utils/pageLock";

export function ProductionGuards() {
  useEffect(() => {
    if (!shouldLockPageTools(window.location.hostname)) return;

    const blockMenu = (event: Event) => event.preventDefault();
    const blockCopy = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    };
    const blockInspect = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (!isInspectShortcut(event)) return;
      event.preventDefault();
    };

    document.addEventListener("contextmenu", blockMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("keydown", blockInspect);
    return () => {
      document.removeEventListener("contextmenu", blockMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockInspect);
    };
  }, []);

  return null;
}
