"use client";

type ProgressStarsProps = {
  total: number;
  filled: number;
};

export function ProgressStars({ total, filled }: ProgressStarsProps) {
  const count = Math.min(Math.max(total, 1), 10);
  return (
    <div className="flex justify-center gap-2 text-3xl max-[500px]:gap-1 max-[500px]:text-2xl" aria-label="Lesson progress">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={index === filled - 1 ? "star-pop inline-block" : "inline-block"}
          aria-hidden
        >
          {index < filled ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
