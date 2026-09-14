"use client";

import { LetterArt } from "@/components/illustrations/LetterArt";
import { associationFor } from "@/data/letterAssociations";

type LetterAssociationCloudProps = {
  letter: string;
  mode: "intro" | "hint" | "reward";
  compact?: boolean;
  badge?: boolean;
  inline?: boolean;
  reducedMotion?: boolean;
};

export function LetterAssociationCloud({
  letter,
  mode,
  compact = false,
  badge = false,
  inline = false,
  reducedMotion = false,
}: LetterAssociationCloudProps) {
  const item = associationFor(letter);
  const label = item?.word.toUpperCase() ?? letter.toUpperCase();
  const motionClass =
    !reducedMotion && item && mode === "reward" ? `art-${item.motion}` : "";

  if (inline) {
    return (
      <div
        className="association-area association-inline pointer-events-none flex h-[55px] w-full max-w-[11rem] items-center justify-center gap-1.5"
        data-testid="association"
        aria-hidden
      >
        <div className="h-8 w-8 shrink-0">
          {item ? (
            <LetterArt id={item.art} className={`h-full w-full ${motionClass}`} />
          ) : (
            <span className="grid h-full w-full place-items-center font-[family-name:var(--font-display)] font-bold text-[#7657E8]">
              {letter.toUpperCase()}
            </span>
          )}
        </div>
        <p className="font-[family-name:var(--font-display)] text-xs font-bold text-[#7657E8]">
          {label}
        </p>
      </div>
    );
  }

  if (badge) {
    return (
      <div
        className={`association-area pointer-events-none flex h-[100px] w-[130px] flex-col items-center justify-center gap-1 rounded-[28px] border-2 border-[#D8E7FF] bg-white px-2 shadow ${
          reducedMotion ? "" : mode === "reward" ? "assoc-reward" : "assoc-cloud-in"
        }`}
        data-testid="association"
        aria-hidden
      >
        <div className="h-[58px] w-[58px] shrink-0">
          {item ? (
            <LetterArt id={item.art} className={`h-full w-full ${motionClass}`} />
          ) : (
            <span className="grid h-full w-full place-items-center font-[family-name:var(--font-display)] text-3xl font-bold text-[#7657E8]">
              {letter.toUpperCase()}
            </span>
          )}
        </div>
        <p className="truncate font-[family-name:var(--font-display)] text-xs font-bold leading-tight text-[#7657E8]">
          {label}
        </p>
      </div>
    );
  }

  const caption =
    mode === "hint" || mode === "reward"
      ? item
        ? `${letter.toUpperCase()} is for ${item.word}`
        : letter.toUpperCase()
      : label;

  return (
    <div
      className={`association-area association-card pointer-events-none flex min-h-[100px] min-w-[130px] flex-col items-center ${
        reducedMotion ? "" : mode === "reward" ? "assoc-reward" : "assoc-cloud-in"
      }`}
      aria-hidden
      data-testid="association"
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center rounded-[32px] border-[3px] border-[#D8E7FF] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(118,87,232,0.12)]"
      >
        <div style={{ width: compact ? 64 : 88, height: compact ? 64 : 88 }}>
          {item ? (
            <LetterArt
              id={item.art}
              className={reducedMotion ? "h-full w-full" : `h-full w-full ${motionClass}`}
            />
          ) : (
            <span className="grid h-full w-full place-items-center font-[family-name:var(--font-display)] text-3xl font-bold">
              {letter.toUpperCase()}
            </span>
          )}
        </div>
        <p className="mt-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#7657E8] max-[500px]:text-xs">
          {caption}
        </p>
      </div>
    </div>
  );
}
