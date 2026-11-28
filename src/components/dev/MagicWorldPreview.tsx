"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LetterArt } from "@/components/illustrations/LetterArt";
import { LessonLearningMirror } from "@/components/LessonLearningMirror";
import {
  allAssociationArtIds,
  magicWorldForArt,
} from "@/data/magicWorldCatalog";
import {
  LETTER_ASSOCIATIONS,
  PUNCTUATION_ASSOCIATIONS,
  type LetterArtId,
} from "@/data/letterAssociations";
import { livingSceneForArt } from "@/data/livingScenes";
import {
  isSceneLessonCostume,
  lessonMirrorCostumeForArt,
} from "@/data/lessonMirrorCostumes";
import { mirrorExperienceForArt } from "@/data/lessonMirrorExperiences";
function letterForArt(art: LetterArtId): string {
  for (const [letter, items] of Object.entries(LETTER_ASSOCIATIONS)) {
    if (items.some((item) => item.art === art)) return letter;
  }
  for (const [key, items] of Object.entries(PUNCTUATION_ASSOCIATIONS)) {
    if (items.some((item) => item.art === art)) return key;
  }
  return "a";
}

export function MagicWorldPreview() {
  const params = useSearchParams();
  const arts = useMemo(() => allAssociationArtIds(), []);
  const raw = params.get("art") ?? arts[0] ?? "orange";
  const art = (arts.includes(raw as LetterArtId) ? raw : arts[0]) as LetterArtId;
  const world = magicWorldForArt(art)!;
  const scene = livingSceneForArt(art)!;
  const costume = lessonMirrorCostumeForArt(art)!;
  const experience = mirrorExperienceForArt(art);
  const letter = letterForArt(art);
  const moodParam = params.get("mood");
  const mood =
    moodParam === "success" || moodParam === "retry" ? moodParam : "idle";

  return (
    <div
      className="min-h-screen bg-[#F1F8FF] p-4 font-[family-name:var(--font-nunito)] text-[#303047]"
      data-testid="magic-world-preview"
      data-preview-art={art}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#7048D7]">
            Dev preview — not shown to children
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {world.word} · {world.place}
          </h1>
        </div>
        <p className="text-sm text-[#5A5C72]">
          {arts.indexOf(art) + 1}/{arts.length}
        </p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {arts.map((id) => (
          <a
            key={id}
            href={`/dev/magic-worlds?art=${encodeURIComponent(id)}`}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              id === art
                ? "bg-[#7048D7] text-white"
                : "bg-white text-[#7048D7] shadow"
            }`}
            data-testid={`preview-link-${id}`}
          >
            {id}
          </a>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="flex flex-col items-center justify-center rounded-[28px] border-[3px] p-6 shadow"
          style={{ background: scene.tint, borderColor: scene.border }}
          data-testid="preview-learning-panel"
        >
          <p className="mb-2 text-sm font-semibold text-[#5A5C72]">{scene.place}</p>
          <div className="h-48 w-48" data-testid="preview-main-art">
            <LetterArt id={art} className="h-full w-full" />
          </div>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#7048D7]">
            {world.word.toUpperCase()}
          </p>
          <p className="mt-1 text-sm">Target key: {letter === " " ? "SPACE" : letter}</p>
        </section>

        <section
          className="flex min-h-[420px] flex-col overflow-hidden rounded-[28px]"
          data-testid="preview-mirror-panel"
        >
          <div className="play-board flex min-h-[420px] flex-1 flex-col">
            <LessonLearningMirror
              letter={letter}
              cameraAllowedByParent
              personCutoutAllowedByParent
              mood={mood}
              reducedMotion={false}
              onOpenParentSettings={() => undefined}
              stageLayout={false}
              forceArt={art}
            />
          </div>
        </section>
      </div>

      <dl
        className="mt-4 grid gap-2 rounded-2xl bg-white p-4 text-sm shadow sm:grid-cols-2"
        data-testid="preview-meta"
      >
        <div>
          <dt className="font-bold">Environment</dt>
          <dd>{world.environment}</dd>
        </div>
        <div>
          <dt className="font-bold">Ambient</dt>
          <dd>{experience.ambient}</dd>
        </div>
        <div>
          <dt className="font-bold">Mirror mode</dt>
          <dd>
            {costume.style}
            {isSceneLessonCostume(costume) ? " (scene)" : ""}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Success action</dt>
          <dd>{world.successAction}</dd>
        </div>
        <div>
          <dt className="font-bold">Fail action</dt>
          <dd>{world.failAction}</dd>
        </div>
        <div>
          <dt className="font-bold">Mirror AR asset</dt>
          <dd data-testid="preview-mirror-src">
            {costume.assetPath || "(companion / ambient LetterArt)"}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Camera-off</dt>
          <dd>{world.supportsCameraOff ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt className="font-bold">Camera-on</dt>
          <dd>{world.supportsCameraOn ? "yes" : "no"}</dd>
        </div>
      </dl>
    </div>
  );
}
