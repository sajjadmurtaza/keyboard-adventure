"use client";

import { useEffect, useSyncExternalStore } from "react";
import { LetterArt } from "@/components/illustrations/LetterArt";
import {
  associationsFor,
  type LetterAssociation,
} from "@/data/letterAssociations";
import { livingSceneForArt } from "@/data/livingScenes";
import { useAudio } from "@/hooks/useAudio";
import { highlightLetterInWord } from "@/lib/letterHighlight";
import { displayKey, tinyHint } from "@/utils/keys";

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
  /** Compact card for Magic Learning Stage (no invite line). */
  stage?: boolean;
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
    <p className={className} data-testid="association-word">
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
  stage = false,
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
  const hintName =
    tinyHint(letter) ?? (letter === " " ? "Space" : displayKey(letter));
  // Never show the same lonely glyph twice — empty keys use the spoken name once.
  const fallback = items.length === 0 ? hintName : letter.toUpperCase();
  const emptyLabel = items.length === 0 ? hintName : null;
  const reaction = resolveReaction(reactionProp, mode);
  const motionClass = motionClassFor(item, reaction, reducedMotion, living);
  const slideClass = reducedMotion ? "" : "assoc-slide";
  const scene = living ? livingSceneForArt(item?.art) : null;
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
        data-scene={scene?.art ?? ""}
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
        className={`association-area pointer-events-none flex h-[100px] w-[130px] flex-col items-center justify-center gap-0.5 rounded-[28px] border-2 px-2 shadow ${
          reducedMotion ? "" : "assoc-cloud-in"
        } ${frameClass}`}
        style={
          scene
            ? { background: scene.tint, borderColor: scene.border }
            : { background: "#fff", borderColor: "#D8E7FF" }
        }
        data-testid="association"
        data-reaction={reaction}
        data-scene={scene?.art ?? ""}
        aria-hidden
      >
        {scene ? (
          <p
            className="max-w-full truncate font-[family-name:var(--font-nunito)] text-[9px] font-semibold text-[#5A5C72]"
            data-testid="association-place"
          >
            {scene.place}
          </p>
        ) : null}
        <div className={`h-[52px] w-[52px] shrink-0 ${slideClass}`} key={item?.art ?? fallback}>
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
        stage ? "association-stage" : ""
      } ${reducedMotion ? "" : "assoc-cloud-in"}`}
      aria-hidden
      data-testid="association"
      data-reaction={reaction}
      data-scene={scene?.art ?? ""}
      data-assoc-index={String(index)}
      data-assoc-word={item?.word ?? fallback}
      data-assoc-count={String(items.length)}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-[32px] border-[3px] px-3 py-2 shadow-[0_10px_24px_rgba(118,87,232,0.12)] ${frameClass}`}
        style={
          scene
            ? { background: scene.tint, borderColor: scene.border }
            : { background: "#fff", borderColor: "#D8E7FF" }
        }
      >
        {scene ? (
          <p
            className={`mb-0.5 font-[family-name:var(--font-nunito)] font-semibold tracking-wide text-[#5A5C72] ${
              stage ? "text-[10px]" : "text-xs sm:text-sm"
            }`}
            data-testid="association-place"
          >
            {scene.place}
          </p>
        ) : null}
        {emptyLabel ? (
          <>
            <p
              className={`w-full truncate text-center font-[family-name:var(--font-display)] font-bold text-[#7048D7] ${
                stage ? "text-lg" : "text-3xl max-[500px]:text-xl"
              }`}
              data-testid="association-empty-label"
            >
              {emptyLabel}
            </p>
            <p className="mt-1 text-center font-[family-name:var(--font-nunito)] text-xs font-semibold text-[#5A5C72]">
              Find this key!
            </p>
          </>
        ) : (
          <>
            <div
              key={`${item?.art ?? fallback}-${reaction}`}
              className={`assoc-art-slot shrink-0 ${slideClass}`}
              style={
                compact || stage
                  ? {
                      width: stage ? "clamp(56px, 10vh, 84px)" : 64,
                      height: stage ? "clamp(56px, 10vh, 84px)" : 64,
                    }
                  : undefined
              }
            >
              <Picture item={item} motionClass={motionClass} fallback={fallback} />
            </div>
            <WordLabel
              word={item?.word ?? fallback}
              letter={letter}
              living={living}
              className={`mt-1 w-full truncate text-center font-[family-name:var(--font-display)] font-bold text-[#7048D7] ${
                stage
                  ? "text-lg"
                  : "text-xl sm:text-2xl"
              }`}
            />
            {items.length > 1 && !stage && !inline && !badge ? (
              <div
                className="association-picker"
                data-testid="association-tour-cards"
                aria-hidden
              >
                {items.map((entry, i) => {
                  const cardScene = living
                    ? livingSceneForArt(entry.art)
                    : null;
                  const active = i === index;
                  return (
                    <div
                      key={`${entry.art}-${i}`}
                      className={`association-picker-card ${
                        active ? "association-picker-card--active" : ""
                      }`}
                      data-active={active ? "true" : "false"}
                      data-art={entry.art}
                      style={
                        cardScene
                          ? {
                              background: cardScene.tint,
                              borderColor: active
                                ? cardScene.border
                                : "transparent",
                            }
                          : undefined
                      }
                    >
                      <div className="association-picker-card__art">
                        <LetterArt id={entry.art} className="h-full w-full" />
                      </div>
                      <span className="association-picker-card__label">
                        {entry.word}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
