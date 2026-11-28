/** Seconds with no keypress before the target key gets a big find-me pulse. */
export const FIND_HELP_IDLE_SEC = 5;

export type KeyFindTone = "idle" | "lit" | "pulse" | "strong" | "pump" | "success" | "miss";

/**
 * How loudly to advertise the target key on the virtual keyboard.
 * - lit: gentle yellow (just arrived)
 * - pump: big repeating bounce (idle too long or after a miss)
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
  // Wrong press or 5s idle escalation → big pump so kids can find it fast.
  if (mood === "retry" || helpLevel >= 1) return "pump";
  if (arrive) return "pulse";
  return "lit";
}

export function showTargetFingerPoint(helpLevel: number, mood: "idle" | "success" | "retry"): boolean {
  return helpLevel >= 2 || mood === "retry";
}
