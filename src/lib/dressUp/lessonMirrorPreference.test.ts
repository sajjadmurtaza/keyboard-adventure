import { afterEach, describe, expect, it } from "vitest";
import {
  isLessonMirrorPaused,
  setLessonMirrorPaused,
} from "@/lib/dressUp/lessonMirrorPreference";

describe("lessonMirrorPreference", () => {
  afterEach(() => {
    setLessonMirrorPaused(false);
  });

  it("defaults to not paused", () => {
    setLessonMirrorPaused(false);
    expect(isLessonMirrorPaused()).toBe(false);
  });

  it("remembers an explicit Stop for this tab session", () => {
    setLessonMirrorPaused(true);
    expect(isLessonMirrorPaused()).toBe(true);
    setLessonMirrorPaused(false);
    expect(isLessonMirrorPaused()).toBe(false);
  });
});
