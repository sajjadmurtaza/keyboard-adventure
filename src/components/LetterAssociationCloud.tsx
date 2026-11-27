"use client";

import { useEffect, useSyncExternalStore } from "react";
import { LetterArt } from "@/components/illustrations/LetterArt";
import {
  associationsFor,
  type LetterAssociation,
} from "@/data/letterAssociations";
import { useAudio } from "@/hooks/useAudio";
import { highlightLetterInWord } from "@/lib/letterHighlight";

export type AssociationReaction = "idle" | "thinking" | "reward" | "encourage";

type LetterAssociationCloudProps = {
  letter: string;
  /** @deprecated Prefer `reaction` — kept for older call sites */
  mode?: "intro" | "hint" | "reward";
  reaction?: AssociationReaction;
  compact?: boolean;
  badge?: boolean;
  inline?: boolean;
  reducedMotion?: boolean;
  /** Living Alphabet enhancements (F/J experiment): highlight + idle loops */
  living?: boolean;
  onWord?: (word: string) => void;
};

const EMPTY_STEP = { key: "", index: 0 };

function resolveReaction(
  reaction: AssociationReaction | undefined,
  mode: "intro" | "hint" | "reward" | undefined,
): AssociationReaction {
  if (reaction) return reaction;
  if (mode === "reward") return "reward";
  if (mode === "hint") return "thinking";
  return "idle";
}

function motionClassFor(
  item: LetterAssociation | undefined,
  reaction: AssociationReaction,
  reducedMotion: boolean,
  living: boolean,
): string {
  if (reducedMotion || !item) return "";
  if (reaction === "reward") return `art-${item.motion} art-react-happy`;
  if (reaction === "encourage") return "art-react-encourage";
  if (reaction === "thinking") return "art-react-think";
  if (living) return `art-idle-${item.motion}`;
  return "";
}

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

function WordLabel({
  word,
  letter,
  living,
  className,
}: {
  word: string;
  letter: string;
  living: boolean;
  className: string;
}) {
  const display = word.toUpperCase();
  return (
    <p className={className}>
      {living ? highlightLetterInWord(display, letter.toUpperCase()) : display}
    </p>
  );
}

export function LetterAssociationCloud({
  letter,
  mode = "intro",
  reaction: reactionProp,
  compact = false,
  badge = false,
  inline = false,
  reducedMotion = false,
  living = false,
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
  const reaction = resolveReaction(reactionProp, mode);
  const motionClass = motionClassFor(item, reaction, reducedMotion, living);
  const slideClass = reducedMotion ? "" : "assoc-slide";
  const frameClass =
    reaction === "reward"
      ? "assoc-frame-happy"
      : reaction === "encourage"
        ? "assoc-frame-encourage"
        : reaction === "thinking"
          ? "assoc-frame-think"
          : "";

  useEffect(() => {
    onWord?.(item?.word ?? "");
  }, [item?.word, onWord]);

  if (inline) {
    return (
      <div
        className="association-area association-inline pointer-events-none flex h-[55px] w-full max-w-[11rem] items-center justify-center gap-1.5"
        data-testid="association"
        data-reaction={reaction}
        aria-hidden
      >
        <div className={`h-8 w-8 shrink-0 ${slideClass}`} key={item?.art ?? fallback}>
          <Picture item={item} motionClass={motionClass} fallback={fallback} />
        </div>
        <WordLabel
          word={item?.word ?? fallback}
          letter={letter}
          living={living}
          className="font-[family-name:var(--font-display)] text-xs font-bold text-[#7657E8]"
        />
      </div>
    );
  }

  if (badge) {
    return (
      <div
        className={`association-area pointer-events-none flex h-[100px] w-[130px] flex-col items-center justify-center gap-1 rounded-[28px] border-2 border-[#D8E7FF] bg-white px-2 shadow ${
          reducedMotion ? "" : "assoc-cloud-in"
        } ${frameClass}`}
        data-testid="association"
        data-reaction={reaction}
        aria-hidden
      >
        <div className={`h-[58px] w-[58px] shrink-0 ${slideClass}`} key={item?.art ?? fallback}>
          <Picture item={item} motionClass={motionClass} fallback={fallback} />
        </div>
        <WordLabel
          word={item?.word ?? fallback}
          letter={letter}
          living={living}
          className="truncate font-[family-name:var(--font-display)] text-xs font-bold leading-tight text-[#7657E8]"
        />
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
      data-reaction={reaction}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-[32px] border-[3px] border-[#D8E7FF] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(118,87,232,0.12)] ${frameClass}`}
      >
        <div
          key={`${item?.art ?? fallback}-${reaction}`}
          className={slideClass}
          style={{ width: compact ? 64 : living ? 104 : 88, height: compact ? 64 : living ? 104 : 88 }}
        >
          <Picture item={item} motionClass={motionClass} fallback={fallback} />
        </div>
        <WordLabel
          word={item?.word ?? fallback}
          letter={letter}
          living={living}
          className="mt-1 w-full truncate text-center font-[family-name:var(--font-display)] text-sm font-bold text-[#7657E8] max-[500px]:text-xs"
        />
      </div>
    </div>
  );
}
