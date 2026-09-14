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
