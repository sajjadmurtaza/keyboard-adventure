"use client";

type MascotProps = {
  line: string;
  celebrating?: boolean;
};

export function Mascot({ line, celebrating }: MascotProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD85A] text-4xl shadow-md ${
          celebrating ? "animate-pop" : "mascot-bob"
        }`}
        aria-hidden
      >
        🐻
      </div>
      <p className="max-w-xs rounded-3xl bg-white px-4 py-2 text-lg font-semibold text-[#34364A] shadow-sm">
        {line}
      </p>
    </div>
  );
}
