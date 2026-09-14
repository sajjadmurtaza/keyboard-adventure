"use client";

import { Mascot } from "@/components/Mascot";

type LessonCompleteProps = {
  onAgain: () => void;
  onNext: () => void;
  hasNext: boolean;
};

export function LessonComplete({ onAgain, onNext, hasNext }: LessonCompleteProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center gap-6 text-5xl">
        <span>🎊</span>
        <span>⭐</span>
        <span>🎉</span>
        <span>⭐</span>
        <span>🎊</span>
      </div>
      <Mascot line="You did it!" celebrating />
      <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[#7657E8] sm:text-6xl">
        YOU DID IT!
      </h1>
      <p className="text-3xl">⭐⭐⭐⭐⭐</p>
      <p className="text-2xl font-semibold text-[#34364A]">Great typing!</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={onAgain}
          className="min-h-14 rounded-full bg-white px-8 text-xl font-bold text-[#7657E8] shadow-md"
        >
          Play Again
        </button>
        {hasNext ? (
          <button
            type="button"
            onClick={onNext}
            className="min-h-14 rounded-full bg-[#7657E8] px-8 text-xl font-bold text-white shadow-md"
          >
            Next Lesson
          </button>
        ) : (
          <button
            type="button"
            onClick={onAgain}
            className="min-h-14 rounded-full bg-[#64D98B] px-8 text-xl font-bold text-[#1F4D32] shadow-md"
          >
            More Practice
          </button>
        )}
      </div>
    </div>
  );
}
