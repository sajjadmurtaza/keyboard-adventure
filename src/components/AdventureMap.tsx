"use client";

import { displayKey } from "@/utils/keys";
import { getLesson, worldForLesson, worlds, type Lesson } from "@/data/lessons";
import { planLesson } from "@/lib/curriculum/sequence";
import { isLessonUnlocked, type Progress } from "@/utils/storage";

type AdventureMapProps = {
  progress: Progress;
  unlockAll: boolean;
  allowReplay: boolean;
  showAll: boolean;
  onPlay: (id: number) => void;
  onHome: () => void;
  onToggleAll: () => void;
};

export function AdventureMap({
  progress,
  unlockAll,
  allowReplay,
  showAll,
  onPlay,
  onHome,
  onToggleAll,
}: AdventureMapProps) {
  const currentId = nextOpen(progress.completedLessons, unlockAll);
  const world = worldForLesson(currentId);
  const current = getLesson(currentId);
  const previousId = world.lessonIds
    .filter((id) => id < currentId && progress.completedLessons.includes(id))
    .at(-1);
  const upcomingId = world.lessonIds.find((id) => id > currentId);
  const currentPlan = current ? planLesson(current, progress.completedLessons, 0) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 py-4">
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#34364A]">
        Where should we go?
      </p>
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#7657E8]">
          {world.emoji} {world.name}
        </p>
        <p className="mt-1 text-lg text-[#5A5C72]">{world.blurb}</p>
      </div>

      {current && currentPlan ? (
        <CurrentCard
          lesson={current}
          isNew={progress.newlyUnlocked === current.id}
          reviewKeys={currentPlan.reviewPool}
          newKeys={currentPlan.newKeys}
          onPlay={() => onPlay(current.id)}
        />
      ) : null}

      <div className="flex w-full max-w-lg flex-col items-stretch justify-center gap-3 max-[500px]:px-1 min-[501px]:flex-row min-[501px]:flex-wrap">
        {previousId ? (
          <SoftLesson
            lesson={getLesson(previousId)!}
            kind="done"
            onPlay={() => {
              if (allowReplay) onPlay(previousId);
            }}
            clickable={allowReplay}
          />
        ) : null}
        {upcomingId ? (
          <SoftLesson
            lesson={getLesson(upcomingId)!}
            kind="soon"
            onPlay={() => undefined}
            clickable={false}
          />
        ) : null}
      </div>

      <WorldPath
        ids={world.lessonIds}
        completed={progress.completedLessons}
        currentId={currentId}
      />

      <div className="flex items-center gap-6">
        <button
          type="button"
          className="font-[family-name:var(--font-display)] font-semibold text-[#7657E8]"
          onClick={onToggleAll}
        >
          {showAll ? "Hide all lessons" : "View all lessons"}
        </button>
        <button
          type="button"
          className="text-sm text-[#B7BCCD]"
          onClick={onHome}
        >
          Home
        </button>
      </div>

      {showAll ? (
        <div className="grid w-full grid-cols-1 gap-3 min-[501px]:grid-cols-2">
          {worlds.map((item) => (
            <div key={item.id} className="rounded-[24px] bg-white/80 p-4">
              <p className="font-bold">
                {item.emoji} {item.name}
              </p>
              {item.lessonIds.map((id) => {
                const lesson = getLesson(id);
                if (!lesson) return null;
                const open = isLessonUnlocked(
                  id,
                  progress.completedLessons,
                  unlockAll,
                );
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!open}
                    onClick={() => onPlay(id)}
                    className="mt-2 block w-full rounded-2xl bg-[#F4FBFF] px-3 py-2 text-left disabled:opacity-50"
                  >
                    Lesson {id}: {lesson.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CurrentCard({
  lesson,
  isNew,
  newKeys,
  reviewKeys,
  onPlay,
}: {
  lesson: Lesson;
  isNew: boolean;
  newKeys: readonly string[];
  reviewKeys: readonly string[];
  onPlay: () => void;
}) {
  const shown = newKeys.length > 0 ? newKeys : lesson.keys;
  return (
    <div
      className={`w-full max-w-lg rounded-[28px] border-4 border-[#7657E8] bg-gradient-to-b from-[#FFF6C8] to-white p-6 text-center shadow-[0_16px_40px_rgba(118,87,232,0.18)] ${
        isNew ? "new-pulse" : ""
      }`}
    >
      <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8]">
        {isNew ? "⭐ NEW! ⭐" : "⭐ YOUR NEXT ADVENTURE"}
      </p>
      <MiniKeys keys={shown} />
      {reviewKeys.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#5A5C72]">Old friends may visit</p>
          <MiniKeys keys={[...reviewKeys]} compact />
        </div>
      ) : null}
      <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold">
        {lesson.description}
      </p>
      <button
        type="button"
        onClick={onPlay}
        className="pressable mt-5 min-h-16 rounded-full bg-[#7657E8] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-white"
      >
        PLAY ▶
      </button>
    </div>
  );
}

function MiniKeys({ keys, compact = false }: { keys: readonly string[]; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${compact ? "mt-2" : "mt-5"}`}>
      {keys.map((key) => {
        const space = key === " ";
        return (
          <span
            key={key === " " ? "space" : key}
            className={`flex items-center justify-center rounded-2xl border-4 border-[#7657E8] bg-[#FFD85A] font-[family-name:var(--font-display)] font-bold ${
              compact
                ? space
                  ? "h-10 min-w-24 px-3 text-sm"
                  : "h-10 w-10 text-lg"
                : space
                  ? "h-16 min-w-[9.5rem] px-5 text-2xl tracking-wide"
                  : "h-16 w-16 text-3xl"
            }`}
          >
            {displayKey(key)}
          </span>
        );
      })}
    </div>
  );
}

function SoftLesson({
  lesson,
  kind,
  onPlay,
  clickable,
}: {
  lesson: Lesson;
  kind: "done" | "soon";
  onPlay: () => void;
  clickable: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      disabled={!clickable}
      className={`w-full rounded-[22px] px-4 py-3 text-left min-[501px]:min-w-44 ${
        kind === "done" ? "bg-[#E9FBE9]" : "bg-[#F3F4F8] text-[#8B90A5]"
      }`}
    >
      {kind === "done" ? (
        <>
          <p className="text-sm">⭐ ⭐ ⭐</p>
          <p className="font-bold">Lesson {lesson.id}</p>
          <p className="text-sm">{lesson.title}</p>
          <p className="text-sm text-[#2F9E5C]">COMPLETED! 🎉</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold uppercase tracking-wide">
            Coming next
          </p>
          <p className="font-bold">Lesson {lesson.id}</p>
          <p className="text-sm">{lesson.title}</p>
        </>
      )}
    </button>
  );
}

function WorldPath({
  ids,
  completed,
  currentId,
}: {
  ids: number[];
  completed: number[];
  currentId: number;
}) {
  return (
    <ol className="flex items-center" aria-label="World progress">
      {ids.map((id, index) => {
        const done = completed.includes(id);
        const here = id === currentId && !done;
        return (
          <li key={id} className="flex items-center">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                done
                  ? "bg-[#FFD85A]"
                  : here
                    ? "bg-[#7657E8] text-white"
                    : "bg-[#E8E4F8] text-[#B7BCCD]"
              }`}
              title={`Lesson ${id}`}
            >
              {done ? "⭐" : here ? "▶" : ""}
            </span>
            {index < ids.length - 1 ? (
              <span className="mx-1 h-1 w-7 rounded-full bg-[#E8E4F8]" />
            ) : null}
          </li>
        );
      })}
      <li className="ml-1 flex h-9 w-9 items-center justify-center text-xl" aria-hidden>
        🏆
      </li>
    </ol>
  );
}

function nextOpen(completed: number[], unlockAll: boolean) {
  for (let id = 1; id <= 16; id += 1) {
    if (!completed.includes(id) && isLessonUnlocked(id, completed, unlockAll)) {
      return id;
    }
  }
  return 16;
}
