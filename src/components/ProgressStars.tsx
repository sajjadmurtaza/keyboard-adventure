"use client";

type ProgressStarsProps = {
  total: number;
  filled: number;
};

export function ProgressStars({ total, filled }: ProgressStarsProps) {
  return (
    <div className="flex justify-center gap-2" aria-label="Lesson progress">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className="text-2xl" aria-hidden>
          {index < filled ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
