export const SUCCESS_HOLD_MS = 3000;

export type LessonPhase =
  | "preparing"
  | "ready"
  | "wrong-feedback"
  | "success"
  | "transitioning"
  | "complete";

export function canAcceptTyping(phase: LessonPhase): boolean {
  return phase === "ready" || phase === "wrong-feedback";
}

export function successHoldMs(streak: number, reducedMotion = false): number {
  if (reducedMotion) {
    if (streak >= 5) return 2200;
    if (streak >= 3) return 2000;
    return 1800;
  }
  if (streak >= 5) return 3800;
  if (streak >= 3) return 3400;
  return SUCCESS_HOLD_MS;
}
