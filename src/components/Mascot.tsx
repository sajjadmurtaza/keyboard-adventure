"use client";

type MascotMood = "idle" | "encourage" | "success" | "complete";

type MascotProps = {
  line: string;
  mood?: MascotMood;
  compact?: boolean;
  tiny?: boolean;
};

export function Mascot({
  line,
  mood = "idle",
  compact = false,
  tiny = false,
}: MascotProps) {
  const face =
    mood === "complete"
      ? "🐻🎉"
      : mood === "success"
        ? "🐻🎉"
        : mood === "encourage"
          ? "🐻✨"
          : "🐻";

  return (
    <div className={`flex items-center justify-center gap-3 ${compact ? "flex-col" : ""}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-[#FFD85A] shadow-[0_8px_20px_rgba(255,216,90,0.45)] ${
          tiny
            ? "h-11 w-11 text-2xl"
            : compact
              ? "h-16 w-16 text-4xl"
              : "h-20 w-20 text-5xl"
        } ${
          mood === "success" || mood === "complete" ? "mascot-jump" : "mascot-bob"
        }`}
        aria-hidden
      >
        {face}
      </div>
      {tiny ? null : (
      <p className={`max-w-sm rounded-[22px] bg-white font-[family-name:var(--font-display)] font-semibold text-[#34364A] shadow-[0_8px_24px_rgba(118,87,232,0.12)] ${
        compact ? "px-3 py-2 text-base" : "px-5 py-3 text-xl"
      }`}>
        {line}
      </p>
      )}
    </div>
  );
}
