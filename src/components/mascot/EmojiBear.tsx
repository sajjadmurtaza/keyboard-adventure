"use client";

import type { MascotViewProps } from "@/components/mascot/types";

export function EmojiBear({ mood, tiny = false }: MascotViewProps) {
  const badge =
    mood === "complete" || mood === "success" || mood === "streak"
      ? "🎉"
      : mood === "encourage"
        ? "😮"
        : null;

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-[#FFD85A] shadow-[0_8px_20px_rgba(255,216,90,0.45)] ${
        mood === "idle" ? "mascot-bob" : "mascot-jump"
      }`}
      style={{
        width: tiny ? 40 : "var(--mascot-size)",
        height: tiny ? 40 : "var(--mascot-size)",
        fontSize: tiny ? 20 : "calc(var(--mascot-size) * 0.55)",
      }}
      data-mascot-mood={mood}
      aria-hidden
    >
      🐻
      {badge ? (
        <span className="absolute -right-1 -bottom-1 text-lg leading-none">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
