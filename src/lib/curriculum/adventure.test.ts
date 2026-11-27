import { describe, expect, it } from "vitest";
import {
  curriculumKeys,
  lessonsReadyToComplete,
  planPlaySession,
  recordKeyResult,
  type KeyPractice,
} from "@/lib/curriculum/adventure";

describe("planPlaySession", () => {
  it("never permanently locks a child on only F and J", () => {
    const run = planPlaySession({
      introducedKeys: ["f", "j"],
      keyPractice: {
        f: { hits: 20, misses: 0, lastShown: 1 },
        j: { hits: 20, misses: 0, lastShown: 2 },
      },
      seed: 42,
      turnCount: 12,
    });
    const unique = [...new Set(run.turns)];
    expect(unique.some((key) => key !== "f" && key !== "j")).toBe(true);
    expect(run.newKeys.length).toBeGreaterThan(0);
    expect(unique.length).toBeGreaterThan(1);
  });

  it("starts a new child with more than one home-row letter", () => {
    const run = planPlaySession({
      introducedKeys: [],
      keyPractice: {},
      seed: 1,
      turnCount: 8,
    });
    expect(new Set(run.turns).size).toBeGreaterThanOrEqual(2);
  });

  it("avoids long identical runs when alternatives exist", () => {
    const run = planPlaySession({
      introducedKeys: curriculumKeys().slice(0, 6),
      keyPractice: {},
      seed: 99,
      turnCount: 10,
    });
    let maxRun = 1;
    let current = 1;
    for (let i = 1; i < run.turns.length; i += 1) {
      if (run.turns[i] === run.turns[i - 1]) {
        current += 1;
        maxRun = Math.max(maxRun, current);
      } else {
        current = 1;
      }
    }
    expect(maxRun).toBe(1);
  });

  it("is deterministic for the same seed", () => {
    const a = planPlaySession({
      introducedKeys: ["f"],
      keyPractice: {},
      seed: 7,
      turnCount: 8,
    });
    const b = planPlaySession({
      introducedKeys: ["f"],
      keyPractice: {},
      seed: 7,
      turnCount: 8,
    });
    expect(a.turns).toEqual(b.turns);
  });

  it("eventually makes every curriculum letter eligible across sessions", () => {
    let introduced: string[] = [];
    const practice: KeyPractice = {};
    const seen = new Set<string>();
    for (let seed = 0; seed < 40; seed += 1) {
      const run = planPlaySession({
        introducedKeys: introduced,
        keyPractice: practice,
        seed,
        turnCount: 8,
      });
      for (const key of run.turns) {
        seen.add(key);
        introduced = introduced.includes(key) ? introduced : [...introduced, key];
        Object.assign(practice, recordKeyResult(practice, key, "hit", seed));
      }
    }
    expect(seen.size).toBe(curriculumKeys().length);
  });

  it("does not grant mastery credit via recordKeyResult on miss", () => {
    const afterMiss = recordKeyResult({}, "f", "miss", 1);
    expect(afterMiss.f?.hits).toBe(0);
    expect(afterMiss.f?.misses).toBe(1);
    const afterHit = recordKeyResult(afterMiss, "f", "hit", 2);
    expect(afterHit.f?.hits).toBe(1);
  });
});

describe("lessonsReadyToComplete", () => {
  it("marks a lesson ready only after its keys are introduced and hit", () => {
    const ready = lessonsReadyToComplete(
      [],
      ["f", "j"],
      {
        f: { hits: 1, misses: 0, lastShown: 1 },
        j: { hits: 1, misses: 0, lastShown: 2 },
      },
    );
    expect(ready).toContain(1);
  });
});
