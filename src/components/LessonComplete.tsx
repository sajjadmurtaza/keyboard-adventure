"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/Mascot";

type LessonCompleteProps = {
  onAgain: () => void;
  onNext: () => void;
  hasNext: boolean;
  childName: string;
  reducedMotion: boolean;
};

export function LessonComplete({
  onAgain,
  onNext,
  hasNext,
  childName,
  reducedMotion,
}: LessonCompleteProps) {
  const [stars, setStars] = useState(reducedMotion ? 5 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    let shown = 0;
    const timer = window.setInterval(() => {
      shown += 1;
      setStars(shown);
      if (shown >= 5) window.clearInterval(timer);
    }, 220);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const wow = childName ? `Amazing typing, ${childName}!` : "Amazing typing!";

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      {!reducedMotion ? <Confetti /> : null}
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
      <div className="flex flex-wrap justify-center gap-4">
        {hasNext ? (
          <button
            type="button"
            onClick={onNext}
            className="pressable min-h-16 rounded-full bg-[#7657E8] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-white shadow-lg"
          >
            Next Adventure →
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
    </div>
  );
}

function Confetti() {
  const bits = ["🎊", "⭐", "🎉", "✦", "⭐", "🎊", "✨", "🎉", "⭐", "✦", "🎊", "⭐", "✨", "🎉", "⭐", "✦", "🎊", "⭐"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((bit, index) => (
        <span
          key={index}
          className="confetti-piece absolute text-3xl"
          style={{
            left: `${4 + (index % 10) * 9.5}%`,
            animationDelay: `${index * 0.06}s`,
          }}
        >
          {bit}
        </span>
      ))}
    </div>
  );
}
