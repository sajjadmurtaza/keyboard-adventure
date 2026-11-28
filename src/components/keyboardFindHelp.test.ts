import { describe, expect, it } from "vitest";
import {
  FIND_HELP_FORCE_SEC,
  FIND_HELP_IDLE_SEC,
  isForceFindHelp,
  showTargetFingerPoint,
  targetKeyTone,
} from "@/components/keyboardFindHelp";

describe("keyboardFindHelp", () => {
  it("uses a calm yellow highlight when the key first appears", () => {
    expect(
      targetKeyTone({
        key: "a",
        wanted: "a",
        highlightOn: true,
        mood: "idle",
        helpLevel: 0,
        missedKey: null,
        arrive: false,
      }),
    ).toBe("lit");
  });

  it("pumps the target after a miss or help escalation", () => {
    expect(
      targetKeyTone({
        key: "a",
        wanted: "a",
        highlightOn: true,
        mood: "retry",
        helpLevel: 1,
        missedKey: null,
        arrive: false,
      }),
    ).toBe("pump");
    expect(
      targetKeyTone({
        key: "a",
        wanted: "a",
        highlightOn: true,
        mood: "idle",
        helpLevel: 1,
        missedKey: null,
        arrive: false,
      }),
    ).toBe("pump");
  });

  it("forces the loudest highlight after the 15s idle escalation", () => {
    expect(
      targetKeyTone({
        key: "f",
        wanted: "f",
        highlightOn: true,
        mood: "idle",
        helpLevel: 3,
        missedKey: null,
        arrive: false,
      }),
    ).toBe("force");
    expect(isForceFindHelp(2)).toBe(false);
    expect(isForceFindHelp(3)).toBe(true);
  });

  it("points at the key after idle help or a wrong press", () => {
    expect(showTargetFingerPoint(0, "idle")).toBe(false);
    expect(showTargetFingerPoint(2, "idle")).toBe(true);
    expect(showTargetFingerPoint(1, "retry")).toBe(true);
  });

  it("documents the idle waits used by the play screen", () => {
    expect(FIND_HELP_IDLE_SEC).toBe(5);
    expect(FIND_HELP_FORCE_SEC).toBe(15);
  });
});
