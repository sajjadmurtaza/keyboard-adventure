"use client";

import { useEffect, useSyncExternalStore } from "react";
import { LetterArt } from "@/components/illustrations/LetterArt";
import { associationsFor, type LetterAssociation } from "@/data/letterAssociations";
import { useAudio } from "@/hooks/useAudio";

type LetterAssociationCloudProps = {
  letter: string;
  mode: "intro" | "hint" | "reward";
  compact?: boolean;
  badge?: boolean;
  inline?: boolean;
  reducedMotion?: boolean;
  onWord?: (word: string) => void;
};

const EMPTY_STEP = { key: "", index: 0 };

function Picture({
  item,
  motionClass,
  fallback,
}: {
  item: LetterAssociation | undefined;
  motionClass: string;
  fallback: string;
}) {
  if (!item) {
    return (
      <span className="grid h-full w-full place-items-center font-[family-name:var(--font-display)] font-bold text-[#7657E8]">
        {fallback}
      </span>
    );
  }
  return <LetterArt id={item.art} className={`h-full w-full ${motionClass}`} />;
}

export function LetterAssociationCloud({
  letter,
  mode,
  compact = false,
  badge = false,
  inline = false,
  reducedMotion = false,
  onWord,
}: LetterAssociationCloudProps) {
  const items = associationsFor(letter);
  const { audio } = useAudio();
  const step = useSyncExternalStore(
    audio?.subscribeAssociation ?? (() => () => undefined),
    () => audio?.getAssociation() ?? EMPTY_STEP,
    () => EMPTY_STEP,
  );
  const index = step.key === letter ? step.index : 0;
  const item = items[index] ?? items[0];
  const fallback = letter.toUpperCase();
  const motionClass =
    !reducedMotion && item && mode === "reward" ? `art-${item.motion}` : "";
  const slideClass = reducedMotion ? "" : "assoc-slide";

  useEffect(() => {
    onWord?.(item?.word ?? "");
  }, [item?.word, onWord]);

  if (inline) {
    return (
      <div
        className="association-area association-inline pointer-events-none flex h-[55px] w-full max-w-[11rem] items-center justify-center gap-1.5"
        data-testid="association"
        aria-hidden
      >
        <div className={`h-8 w-8 shrink-0 ${slideClass}`} key={item?.art ?? fallback}>
          <Picture item={item} motionClass={motionClass} fallback={fallback} />
        </div>
        <p className="font-[family-name:var(--font-display)] text-xs font-bold text-[#7657E8]">
          {item?.word.toUpperCase() ?? fallback}
        </p>
      </div>
    );
  }

  if (badge) {
    return (
      <div
        className={`association-area pointer-events-none flex h-[100px] w-[130px] flex-col items-center justify-center gap-1 rounded-[28px] border-2 border-[#D8E7FF] bg-white px-2 shadow ${
          reducedMotion ? "" : "assoc-cloud-in"
        }`}
        data-testid="association"
        aria-hidden
      >
        <div className={`h-[58px] w-[58px] shrink-0 ${slideClass}`} key={item?.art ?? fallback}>
          <Picture item={item} motionClass={motionClass} fallback={fallback} />
        </div>
        <p className="truncate font-[family-name:var(--font-display)] text-xs font-bold leading-tight text-[#7657E8]">
          {item?.word.toUpperCase() ?? fallback}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`association-area association-card pointer-events-none flex flex-col items-center ${
        reducedMotion ? "" : "assoc-cloud-in"
      }`}
      aria-hidden
      data-testid="association"
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[32px] border-[3px] border-[#D8E7FF] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(118,87,232,0.12)]">
        <div
          key={item?.art ?? fallback}
          className={slideClass}
          style={{ width: compact ? 64 : 88, height: compact ? 64 : 88 }}
        >
          <Picture item={item} motionClass={motionClass} fallback={fallback} />
        </div>
        <p className="mt-1 w-full truncate text-center font-[family-name:var(--font-display)] text-sm font-bold text-[#7657E8] max-[500px]:text-xs">
          {item?.word.toUpperCase() ?? fallback}
        </p>
      </div>
    </div>
  );
}
