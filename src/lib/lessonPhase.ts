export const SUCCESS_HOLD_MS = 4500;
export const TARGET_ARRIVE_MS = 520;
export const WRONG_FEEDBACK_MS = 500;

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

export function targetArriveMs(reducedMotion = false): number {
  return reducedMotion ? 200 : TARGET_ARRIVE_MS;
}

export function wrongFeedbackMs(reducedMotion = false): number {
  return reducedMotion ? 280 : WRONG_FEEDBACK_MS;
}

export function successHoldMs(streak: number, reducedMotion = false): number {
  if (reducedMotion) {
    if (streak >= 5) return 2800;
    if (streak >= 3) return 2600;
    return 2400;
  }
  if (streak >= 5) return 5200;
  if (streak >= 3) return 4800;
  return SUCCESS_HOLD_MS;
}
