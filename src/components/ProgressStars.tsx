"use client";

const MAX_STARS = 8;

type ProgressStarsProps = {
  total: number;
  filled: number;
  compact?: boolean;
};

export function ProgressStars({ total, filled, compact = false }: ProgressStarsProps) {
  const steps = Math.max(total, 1);
  const done = Math.min(Math.max(filled, 0), steps);
  const count = Math.min(steps, MAX_STARS);
  const lit =
    steps <= MAX_STARS
      ? done
      : Math.min(count, Math.round((done / steps) * count));
  const showCount = steps > MAX_STARS;

  return (
    <div
      className={`flex items-center justify-center ${compact ? "gap-1 text-lg" : "gap-1.5 text-2xl max-[500px]:text-xl"}`}
      aria-label={`Lesson progress ${done} of ${steps}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={index === lit - 1 ? "star-pop relative inline-block" : "inline-block"}
          aria-hidden
        >
          {index < lit ? "⭐" : "☆"}
          {index === lit - 1 && index < lit ? (
            <span className="absolute -right-1 -top-1 text-xs">✨</span>
          ) : null}
        </span>
      ))}
      {showCount ? (
        <span className="pl-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#7657E8]">
          {done}/{steps}
        </span>
      ) : null}
    </div>
  );
}
