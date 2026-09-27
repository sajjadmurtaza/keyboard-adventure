"use client";

import { useEffect, useState } from "react";
import { Celebration } from "@/components/celebration/Celebration";
import { Mascot } from "@/components/Mascot";

type LessonCompleteProps = {
  onAgain: () => void;
  onNext: () => void;
  hasNext: boolean;
  learned: string;
  remembered: string[];
  nextLabel: string | null;
  childName: string;
  reducedMotion: boolean;
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
}: LessonCompleteProps) {
  const [stars, setStars] = useState(reducedMotion ? 5 : 0);
  const [showButtons, setShowButtons] = useState(reducedMotion);

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
        {showButtons ? (
          <div className="relative z-[4] flex flex-wrap justify-center gap-4">
            {hasNext && nextLabel ? (
              <button
                type="button"
                onClick={onNext}
                className="pressable min-h-16 rounded-full bg-[#7657E8] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-white shadow-lg"
              >
                Next: {nextLabel} →
              </button>
            ) : null}
            <button
              type="button"
              onClick={onAgain}
              className="pressable min-h-14 rounded-full bg-white px-8 font-[family-name:var(--font-display)] text-xl font-bold text-[#7657E8] shadow-md"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="h-16" />
        )}
      </div>
    </div>
  );
}
