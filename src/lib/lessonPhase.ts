export const SUCCESS_HOLD_MS = 1500;

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
    if (streak >= 5) return 1300;
    if (streak >= 3) return 1200;
    return 1100;
  }
  if (streak >= 5) return 1900;
  if (streak >= 3) return 1700;
  return SUCCESS_HOLD_MS;
}
