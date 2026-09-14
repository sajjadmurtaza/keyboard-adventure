"use client";

type KeyTone = "idle" | "target" | "strong" | "success" | "miss";

type KeyboardKeyProps = {
  label: string;
  wide?: boolean;
  bump?: boolean;
  tone: KeyTone;
  point?: boolean;
};

export function KeyboardKey({
  label,
  wide,
  bump,
  tone,
  point,
}: KeyboardKeyProps) {
  const toneClass =
    tone === "success"
      ? "border-[#65D98B] bg-[#65D98B] text-[#1F4D32] scale-110"
      : tone === "miss"
        ? "border-[#FF7A7A] bg-[#FFE1E1] text-[#34364A]"
        : tone === "strong"
          ? "key-glow-strong border-[#7657E8] bg-[#FFD85A] text-[#34364A]"
          : tone === "target"
            ? "key-glow border-[#7657E8] bg-[#FFD85A] text-[#34364A] scale-110"
            : "border-[#E8E4F8] bg-[#FFFEFF] text-[#34364A] shadow-[0_4px_0_#E4DFF6]";

  return (
    <div className="relative">
      {point ? (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl" aria-hidden>
          👇
        </span>
      ) : null}
      <div
        className={`flex items-center justify-center rounded-[18px] border-[3px] font-bold shadow-[0_5px_0_rgba(118,87,232,0.12)] ${
          wide
            ? "h-14 w-[min(100%,36rem)] max-w-xl px-8 text-2xl md:h-16"
            : "h-12 w-10 text-lg sm:h-14 sm:w-12 sm:text-xl md:h-16 md:w-14 md:text-2xl"
        } ${toneClass}`}
      >
        <span className="flex flex-col items-center leading-none">
          {label}
          {bump ? (
            <span className="mt-1 h-1 w-5 rounded-full bg-[#7657E8]" />
          ) : null}
        </span>
      </div>
    </div>
  );
}
