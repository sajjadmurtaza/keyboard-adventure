"use client";

type KeyboardKeyProps = {
  label: string;
  wide?: boolean;
  bump?: boolean;
  highlighted: boolean;
  highlightOn: boolean;
};

export function KeyboardKey({
  label,
  wide,
  bump,
  highlighted,
  highlightOn,
}: KeyboardKeyProps) {
  const active = highlighted && highlightOn;
  return (
    <div
      className={`flex h-11 items-center justify-center rounded-2xl border-2 text-lg font-bold sm:h-12 md:h-14 ${
        wide ? "w-full max-w-xl px-8" : "w-9 sm:w-11 md:w-12"
      } ${
        active
          ? "key-glow border-[#7657E8] bg-[#FFD85A] text-[#34364A]"
          : "border-[#D8D4F0] bg-white text-[#34364A]"
      }`}
    >
      <span className="flex flex-col items-center leading-none">
        {label}
        {bump ? <span className="mt-0.5 h-0.5 w-4 rounded bg-[#7657E8]" /> : null}
      </span>
    </div>
  );
}
