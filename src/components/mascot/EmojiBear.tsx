"use client";

import type { MascotViewProps } from "@/components/mascot/types";

export function EmojiBear({ mood, tiny = false, accessories = [] }: MascotViewProps) {
  const clapping = mood === "complete" || mood === "success" || mood === "streak";
  const worn = accessories.slice(0, 3);

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
      {worn.map((emoji, i) => (
        <span
          key={`${emoji}-${i}`}
          className={`absolute leading-none ${
            i === 0
              ? "-top-1 left-1/2 -translate-x-1/2 text-[0.85em]"
              : i === 1
                ? "-right-1 top-1 text-[0.75em]"
                : "-left-1 bottom-0 text-[0.75em]"
          }`}
        >
          {emoji}
        </span>
      ))}
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
