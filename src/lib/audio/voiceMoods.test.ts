import { moodTone } from "@/lib/audio/voiceMoods";
import { describe, expect, it } from "vitest";

describe("voice moods", () => {
  it("keeps pitch in a safe range", () => {
    const success = moodTone("success", "playful", 0.9);
    const hint = moodTone("hint", "playful", 0.9);
    const streak = moodTone("streak", "playful", 0.9);
    const calm = moodTone("instruction", "calm", 0.78);
    expect(success.pitch).toBeGreaterThan(hint.pitch);
    expect(streak.rate).toBeGreaterThan(success.rate);
    expect(success.pitch).toBeLessThanOrEqual(1.08);
    expect(calm.rate).toBeLessThan(1);
    expect(moodTone("celebration", "playful", 0.95).pitch).toBeGreaterThanOrEqual(1);
    expect(moodTone("instruction", "playful", 0.95).rate).toBeGreaterThanOrEqual(0.9);
    expect(moodTone("success", "playful", 0.95).rate).toBeLessThanOrEqual(1.08);
  });
});
