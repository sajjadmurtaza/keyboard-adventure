import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LESSON_COMPLETE_AUTO_ADVANCE_SEC,
  LessonComplete,
} from "@/components/LessonComplete";

describe("LessonComplete auto-advance", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("auto-continues to the next adventure after 15 seconds", () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    const onAgain = vi.fn();
    render(
      <LessonComplete
        onAgain={onAgain}
        onNext={onNext}
        hasNext
        learned="A"
        remembered={[]}
        nextLabel="B"
        childName=""
        reducedMotion
      />,
    );

    expect(screen.getByTestId("lesson-complete-auto-advance").textContent).toContain(
      String(LESSON_COMPLETE_AUTO_ADVANCE_SEC),
    );

    act(() => {
      vi.advanceTimersByTime(LESSON_COMPLETE_AUTO_ADVANCE_SEC * 1000 + 300);
    });

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onAgain).not.toHaveBeenCalled();
  });

  it("cancels auto-advance when the child taps Next", () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    render(
      <LessonComplete
        onAgain={vi.fn()}
        onNext={onNext}
        hasNext
        learned="A"
        remembered={[]}
        nextLabel="B"
        childName=""
        reducedMotion
      />,
    );

    fireEvent.click(screen.getByTestId("lesson-complete-next"));
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(LESSON_COMPLETE_AUTO_ADVANCE_SEC * 1000 + 500);
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("replays when there is no next adventure", () => {
    vi.useFakeTimers();
    const onAgain = vi.fn();
    render(
      <LessonComplete
        onAgain={onAgain}
        onNext={vi.fn()}
        hasNext={false}
        learned="Z"
        remembered={[]}
        nextLabel={null}
        childName=""
        reducedMotion
      />,
    );

    act(() => {
      vi.advanceTimersByTime(LESSON_COMPLETE_AUTO_ADVANCE_SEC * 1000 + 300);
    });
    expect(onAgain).toHaveBeenCalledTimes(1);
  });
});
