"use client";

import type { MascotViewProps } from "@/components/mascot/types";

export function EmojiBear({ mood, tiny = false }: MascotViewProps) {
  const clapping = mood === "complete" || mood === "success" || mood === "streak";

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
      {clapping ? (
        <>
          <span className="mascot-clap-emoji absolute -right-2 -top-1 text-lg leading-none">
            👏
          </span>
          <span className="mascot-clap-emoji mascot-clap-emoji-delay absolute -bottom-1 -left-2 text-base leading-none">
            👏
          </span>
        </>
      ) : mood === "encourage" ? (
        <span className="absolute -right-1 -bottom-1 text-lg leading-none">😮</span>
      ) : null}
    </div>
  );
}
