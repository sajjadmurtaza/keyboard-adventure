/**
 * Session preference for the in-lesson Magic Mirror.
 * Parent settings allow the camera; this remembers whether the child
 * (or auto-start) wants it live during this browser tab visit.
 *
 * Stop sets "paused" so we do not immediately reopen the camera.
 * Closing the tab clears sessionStorage naturally.
 */

const PAUSED_KEY = "ka-lesson-mirror-paused";

export function isLessonMirrorPaused(): boolean {
  try {
    return sessionStorage.getItem(PAUSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setLessonMirrorPaused(paused: boolean): void {
  try {
    if (paused) sessionStorage.setItem(PAUSED_KEY, "1");
    else sessionStorage.removeItem(PAUSED_KEY);
  } catch {
    /* private / blocked storage */
  }
}
