"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Celebration } from "@/components/celebration/Celebration";
import { Mascot } from "@/components/Mascot";

/** Seconds to wait before auto-advancing if the child doesn't tap a button. */
export const LESSON_COMPLETE_AUTO_ADVANCE_SEC = 15;

type LessonCompleteProps = {
  onAgain: () => void;
  onNext: () => void;
  hasNext: boolean;
  learned: string;
  remembered: string[];
  nextLabel: string | null;
  childName: string;
  reducedMotion: boolean;
  /** Optional wardrobe reward — never gates next lesson. */
  costumeUnlock?: { name: string; emoji: string } | null;
  onVisitWardrobe?: () => void;
};

export function LessonComplete({
  onAgain,
  onNext,
  hasNext,
  learned,
  remembered,
  nextLabel,
  childName,
  reducedMotion,
  costumeUnlock = null,
  onVisitWardrobe,
}: LessonCompleteProps) {
  const [stars, setStars] = useState(reducedMotion ? 5 : 0);
  const [showButtons, setShowButtons] = useState(reducedMotion);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const cancelledRef = useRef(false);
  const advancedRef = useRef(false);
  const hasNextRef = useRef(hasNext);
  const onNextRef = useRef(onNext);
  const onAgainRef = useRef(onAgain);

  hasNextRef.current = hasNext;
  onNextRef.current = onNext;
  onAgainRef.current = onAgain;

  const cancelAutoAdvance = useCallback(() => {
    cancelledRef.current = true;
    setSecondsLeft(null);
  }, []);

  const goNextOrAgain = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    cancelledRef.current = true;
    setSecondsLeft(null);
    if (hasNextRef.current) onNextRef.current();
    else onAgainRef.current();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let shown = 0;
    const timer = window.setInterval(() => {
      shown += 1;
      setStars(shown);
      if (shown >= 5) window.clearInterval(timer);
    }, 220);
    const buttons = window.setTimeout(() => setShowButtons(true), 3000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(buttons);
    };
  }, [reducedMotion]);

  // Auto-advance after celebration buttons appear, unless the child taps first.
  // Keep deps to showButtons only — parent onNext identity must not reset the timer
  // or double-fire next lesson (that remount race crashed the mirror).
  useEffect(() => {
    if (!showButtons) return;
    if (advancedRef.current) return;
    cancelledRef.current = false;
    setSecondsLeft(LESSON_COMPLETE_AUTO_ADVANCE_SEC);
    const started = Date.now();
    const tick = window.setInterval(() => {
      if (cancelledRef.current || advancedRef.current) {
        window.clearInterval(tick);
        return;
      }
      const left = Math.max(
        0,
        LESSON_COMPLETE_AUTO_ADVANCE_SEC -
          Math.floor((Date.now() - started) / 1000),
      );
      setSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(tick);
        goNextOrAgain();
      }
    }, 250);
    return () => {
      window.clearInterval(tick);
    };
  }, [showButtons, goNextOrAgain]);

  const wow = childName ? `Fantastic, ${childName}!` : "Fantastic work!";

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <Celebration level="complete" reducedMotion={reducedMotion} seed={1} />
      <div className="relative z-[3] flex flex-col items-center gap-6">
        <Mascot line={childName ? `You did it, ${childName}!` : "You did it!"} mood="complete" />
        <h1 className="title-bounce font-[family-name:var(--font-display)] text-4xl font-bold text-[#7657E8] max-[500px]:px-2 sm:text-7xl">
          🎉 YOU DID IT! 🎉
        </h1>
        <p className="text-4xl" aria-hidden>
          {"⭐".repeat(stars)}
          {"☆".repeat(Math.max(0, 5 - stars))}
        </p>
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#34364A]">
          {wow}
        </p>
        <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#7657E8]">
          {learned} learned!
        </p>
        {remembered.length > 0 ? (
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#34364A]">
            You also remembered {remembered.join(" · ")}
          </p>
        ) : null}
        {costumeUnlock ? (
          <p
            className="rounded-2xl bg-white px-5 py-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#7657E8] shadow-md"
            data-testid="costume-unlock-banner"
          >
            {costumeUnlock.emoji} You unlocked {costumeUnlock.name}!
          </p>
        ) : null}
        {showButtons ? (
          <div className="relative z-[4] flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-4">
              {costumeUnlock && onVisitWardrobe ? (
                <button
                  type="button"
                  data-testid="visit-wardrobe"
                  onClick={() => {
                    advancedRef.current = true;
                    cancelAutoAdvance();
                    onVisitWardrobe();
                  }}
                  className="pressable min-h-16 rounded-full bg-[#FFD85A] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-[#34364A] shadow-lg"
                >
                  Visit Magic Mirror ✨
                </button>
              ) : null}
              {hasNext && nextLabel ? (
                <button
                  type="button"
                  data-testid="lesson-complete-next"
                  onClick={() => {
                    cancelAutoAdvance();
                    goNextOrAgain();
                  }}
                  className="pressable min-h-16 rounded-full bg-[#7657E8] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-white shadow-lg"
                >
                  {nextLabel === "Keep playing"
                    ? "▶ Keep playing!"
                    : `Next adventure: ${nextLabel} →`}
                </button>
              ) : null}
              <button
                type="button"
                data-testid="lesson-complete-again"
                onClick={() => {
                  advancedRef.current = true;
                  cancelAutoAdvance();
                  onAgain();
                }}
                className="pressable min-h-14 rounded-full bg-white px-8 font-[family-name:var(--font-display)] text-xl font-bold text-[#7657E8] shadow-md"
              >
                {nextLabel === "Keep playing" ? "Play again" : "Shuffle & play again"}
              </button>
            </div>
            {secondsLeft != null && secondsLeft > 0 ? (
              <p
                className="font-[family-name:var(--font-nunito)] text-sm font-semibold text-[#5A5C72]"
                data-testid="lesson-complete-auto-advance"
              >
                {hasNext
                  ? `Next adventure in ${secondsLeft}…`
                  : `Play again in ${secondsLeft}…`}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="h-16" />
        )}
      </div>
    </div>
  );
}
