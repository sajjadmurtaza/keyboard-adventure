import { isLessonUnlocked, loadProgress, resetProgress, saveProgress } from "@/utils/storage";
import { afterEach, describe, expect, it } from "vitest";

describe("progress storage", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("starts empty and unlocks lesson 1", () => {
    const fresh = loadProgress();
    expect(fresh.completedLessons).toEqual([]);
    expect(isLessonUnlocked(1, [])).toBe(true);
    expect(isLessonUnlocked(2, [])).toBe(false);
    expect(isLessonUnlocked(2, [1])).toBe(true);
    expect(isLessonUnlocked(3, [1], true)).toBe(true);
  });

  it("survives corrupt JSON and odd shapes", () => {
    window.localStorage.setItem("keyboard-adventure-progress-v1", "{not json");
    expect(loadProgress().currentLesson).toBe(1);
    window.localStorage.setItem(
      "keyboard-adventure-progress-v1",
      JSON.stringify({ completedLessons: "nope", lessonBestResults: 3, newlyUnlocked: undefined }),
    );
    expect(loadProgress().completedLessons).toEqual([]);
    window.localStorage.setItem(
      "keyboard-adventure-progress-v1",
      JSON.stringify({
        childName: "<script>alert(1)</script>",
        completedLessons: [1, "nope", 99, 1],
        starsEarned: -8,
      }),
    );
    expect(loadProgress().childName).toBe("");
    expect(loadProgress().completedLessons).toEqual([1]);
    expect(loadProgress().starsEarned).toBe(0);
    window.localStorage.setItem("keyboard-adventure-progress-v1", "[]");
    expect(loadProgress().currentLesson).toBe(1);
    window.localStorage.setItem(
      "keyboard-adventure-progress-v1",
      JSON.stringify({
        currentLesson: 0,
        newlyUnlocked: 7,
        lessonBestResults: { "1": 4, xx: 9, "2": -1 },
      }),
    );
    expect(loadProgress().currentLesson).toBe(1);
    expect(loadProgress().newlyUnlocked).toBe(7);
    expect(loadProgress().lessonBestResults).toEqual({ "1": 4 });
    window.localStorage.setItem(
      "keyboard-adventure-progress-v1",
      JSON.stringify({ completedLessons: [1] }),
    );
    expect(loadProgress().introducedKeys).toEqual(["f", "j"]);
    window.localStorage.setItem(
      "keyboard-adventure-progress-v1",
      JSON.stringify({ completedLessons: [1], introducedKeys: ["F"] }),
    );
    expect(loadProgress().introducedKeys).toEqual(["f"]);
  });

  it("saves and resets", () => {
    saveProgress({
      ...loadProgress(),
      completedLessons: [1],
      starsEarned: 3,
    });
    expect(loadProgress().starsEarned).toBe(3);
    expect(resetProgress("Ada").childName).toBe("Ada");
    expect(loadProgress().completedLessons).toEqual([]);
  });
});
