"use client";

import { LetterArt } from "@/components/illustrations/LetterArt";
import { associationFor } from "@/data/letterAssociations";

type LetterAssociationCloudProps = {
  letter: string;
  mode: "intro" | "hint" | "reward";
  compact?: boolean;
  reducedMotion?: boolean;
};

export function LetterAssociationCloud({
  letter,
  mode,
  compact = false,
  reducedMotion = false,
}: LetterAssociationCloudProps) {
  const item = associationFor(letter);
  if (!item) return null;

  const size = compact ? (mode === "reward" ? 56 : 72) : mode === "reward" ? 88 : 120;
  const label =
    mode === "hint" ? `${letter.toUpperCase()} is for ${item.word}` : item.word.toUpperCase();

  return (
    <div
      className={`pointer-events-none flex flex-col items-center ${
        reducedMotion ? "" : mode === "reward" ? "assoc-reward" : "assoc-cloud-in"
      }`}
      aria-hidden
    >
      {mode !== "reward" ? (
        <div className="mb-1 flex items-end gap-1 opacity-70">
          <span className="h-2 w-2 rounded-full bg-white shadow" />
          <span className="mb-1 h-3 w-3 rounded-full bg-white shadow" />
          <span className="h-4 w-4 rounded-full bg-white shadow" />
        </div>
      ) : null}
      <div
        className="flex flex-col items-center rounded-[40px] border-[3px] border-[#D8E7FF] bg-white px-5 py-3 shadow-[0_10px_24px_rgba(118,87,232,0.12)]"
        style={{ minWidth: compact ? 96 : 132 }}
      >
        <div style={{ width: size, height: size }}>
          <LetterArt
            id={item.art}
            className={reducedMotion ? "h-full w-full" : `h-full w-full art-${item.motion}`}
          />
        </div>
        <p className="mt-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#7657E8] max-[500px]:text-xs">
          {label}
        </p>
      </div>
    </div>
  );
}
