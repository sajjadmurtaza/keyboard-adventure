"use client";

import { useEffect } from "react";
import {
  isInspectShortcut,
  isSelectAllShortcut,
  shouldBlockSelection,
  shouldLockPageTools,
} from "@/utils/pageLock";

export function ProductionGuards() {
  useEffect(() => {
    const blockSelect = (event: Event) => {
      if (!shouldBlockSelection(event.target)) return;
      event.preventDefault();
    };
    const blockSelectAll = (event: KeyboardEvent) => {
      if (!shouldBlockSelection(event.target)) return;
      if (!isSelectAllShortcut(event)) return;
      event.preventDefault();
    };

    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("dragstart", blockSelect);
    document.addEventListener("keydown", blockSelectAll);

    if (!shouldLockPageTools(window.location.hostname)) {
      return () => {
        document.removeEventListener("selectstart", blockSelect);
        document.removeEventListener("dragstart", blockSelect);
        document.removeEventListener("keydown", blockSelectAll);
      };
    }

    const blockMenu = (event: Event) => event.preventDefault();
    const blockCopy = (event: ClipboardEvent) => {
      if (!shouldBlockSelection(event.target)) return;
      event.preventDefault();
    };
    const blockInspect = (event: KeyboardEvent) => {
      if (!shouldBlockSelection(event.target)) return;
      if (isSelectAllShortcut(event)) return;
      if (!isInspectShortcut(event)) return;
      event.preventDefault();
    };

    document.addEventListener("contextmenu", blockMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("keydown", blockInspect);
    return () => {
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("dragstart", blockSelect);
      document.removeEventListener("keydown", blockSelectAll);
      document.removeEventListener("contextmenu", blockMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("keydown", blockInspect);
    };
  }, []);

  return null;
}
