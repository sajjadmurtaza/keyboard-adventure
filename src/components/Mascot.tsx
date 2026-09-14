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
  const badge =
    mood === "complete" || mood === "success"
      ? "🎉"
      : mood === "encourage"
        ? "😮"
        : null;

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`relative flex items-center justify-center rounded-full bg-[#FFD85A] shadow-[0_8px_20px_rgba(255,216,90,0.45)] ${
          mood === "success" || mood === "complete" || mood === "encourage"
            ? "mascot-jump"
            : "mascot-bob"
        }`}
        style={{
          width: tiny ? 40 : "var(--mascot-size)",
          height: tiny ? 40 : "var(--mascot-size)",
          fontSize: tiny ? 20 : "calc(var(--mascot-size) * 0.55)",
        }}
        aria-hidden
      >
        🐻
        {badge ? (
          <span className="absolute -right-1 -bottom-1 text-lg leading-none">
            {badge}
          </span>
        ) : null}
      </div>
      {tiny ? null : (
        <p
          className={`max-w-sm rounded-[22px] bg-white font-[family-name:var(--font-display)] font-semibold text-[#34364A] shadow-[0_8px_24px_rgba(118,87,232,0.12)] ${
            compact ? "px-2 py-1 text-sm" : "px-4 py-2 text-lg"
          }`}
        >
          {line}
        </p>
      )}
    </div>
  );
}
