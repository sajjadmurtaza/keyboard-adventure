/** Seconds with no keypress before the target key gets a big find-me pulse. */
export const FIND_HELP_IDLE_SEC = 5;

/** Seconds with no keypress before force highlight + voice nudge. */
export const FIND_HELP_FORCE_SEC = 15;

export type KeyFindTone =
  | "idle"
  | "lit"
  | "pulse"
  | "strong"
  | "pump"
  | "force"
  | "success"
  | "miss";

/**
 * How loudly to advertise the target key on the virtual keyboard.
 * - lit: gentle yellow (just arrived)
 * - pump: big repeating bounce (5s idle or after a miss)
 * - force: maximum bounce + glow (15s idle — child still stuck)
 * - strong: brief glow (legacy / reduced-motion path still maps here)
 */
export function targetKeyTone(opts: {
  key: string;
  wanted: string;
  highlightOn: boolean;
  mood: "idle" | "success" | "retry";
  helpLevel: number;
  missedKey: string | null;
  arrive: boolean;
}): KeyFindTone {
  const { key, wanted, highlightOn, mood, helpLevel, missedKey, arrive } = opts;
  if (missedKey && missedKey === key) return "miss";
  if (!highlightOn) return "idle";
  if (wanted !== key) return "idle";
  if (mood === "success") return "success";
  // 15s idle force escalation — biggest find-me signal.
  if (helpLevel >= 3) return "force";
  // Wrong press or 5s idle escalation → big pump so kids can find it fast.
  if (mood === "retry" || helpLevel >= 1) return "pump";
  if (arrive) return "pulse";
  return "lit";
}

export function showTargetFingerPoint(
  helpLevel: number,
  mood: "idle" | "success" | "retry",
): boolean {
  return helpLevel >= 2 || mood === "retry";
}

/** True when idle help has escalated to the 15s force nudge. */
export function isForceFindHelp(helpLevel: number): boolean {
  return helpLevel >= 3;
}
