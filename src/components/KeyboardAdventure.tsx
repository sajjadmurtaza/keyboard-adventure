"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { FingerGuide } from "@/components/FingerGuide";
import { LessonCard } from "@/components/LessonCard";
import { LessonComplete } from "@/components/LessonComplete";
import { Mascot } from "@/components/Mascot";
import { ParentSettingsPanel } from "@/components/ParentSettings";
import { ProgressStars } from "@/components/ProgressStars";
import { TargetLetter } from "@/components/TargetLetter";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import {
  buildPracticeSequence,
  getLesson,
  lessons,
  PRACTICE_KEY_OPTIONS,
} from "@/data/lessons";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { playComplete, playMiss, playSuccess } from "@/utils/audio";
import { displayKey, instructionFor, keysMatch, normalizeTarget } from "@/utils/keys";
import { defaultSettings, loadSettings, saveSettings, type ParentSettings } from "@/utils/settings";
import {
  isLessonUnlocked,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/utils/storage";

type View = "home" | "lessons" | "practice" | "play" | "complete" | "parent";
type Mood = "idle" | "success" | "retry";

const PRAISE = ["Great!", "Awesome!", "You got it!", "Super!"];
const RETRY = ["Try again!", "Almost!"];

function pick(list: string[]) {
  return list[Math.floor(Math.random() * list.length)] ?? list[0]!;
}

export function KeyboardAdventure() {
  const [view, setView] = useState<View>("home");
  const [settings, setSettings] = useState<ParentSettings>(defaultSettings);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [lessonId, setLessonId] = useState(1);
  const [index, setIndex] = useState(0);
  const [mood, setMood] = useState<Mood>("idle");
  const [feedback, setFeedback] = useState("Find this key!");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [starFlash, setStarFlash] = useState(false);
  const [practiceKeys, setPracticeKeys] = useState<string[]>(["f", "j", " "]);
  const lockRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  const target = sequence[index] ?? "f";
  const lesson = getLesson(lessonId);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage once */
    setSettings(loadSettings());
    setProgress(loadProgress());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function persistProgress(next: Progress) {
    setProgress(next);
    saveProgress(next);
  }

  function persistSettings(next: ParentSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function startSequence(keys: string[], id: number) {
    let seq = keys;
    if (id > 0 && settings.difficulty === "growing") {
      seq = [...keys, ...keys].slice(0, settings.questionCount);
    } else if (id > 0 && settings.difficulty === "practice") {
      seq = keys.slice(0, settings.questionCount);
    }
    setLessonId(id);
    setSequence(seq.length ? seq : keys);
    setIndex(0);
    setMood("idle");
    setFeedback("Find this key!");
    setCorrect(0);
    setWrong(0);
    setView("play");
  }

  function startLesson(id: number) {
    const data = getLesson(id);
    if (!data) return;
    startSequence(data.sequence, id);
  }

  function startPractice() {
    const seq = buildPracticeSequence(practiceKeys, settings.questionCount);
    startSequence(seq, 0);
  }

  const finishLesson = useCallback(() => {
    if (settings.sound) playComplete();
    if (lessonId > 0 && progress) {
      const completed = progress.completedLessons.includes(lessonId)
        ? progress.completedLessons
        : [...progress.completedLessons, lessonId];
      persistProgress({
        ...progress,
        completedLessons: completed,
        currentLesson: lessonId + 1,
        starsEarned: progress.starsEarned + 1,
        correctAttempts: progress.correctAttempts + correct,
        incorrectAttempts: progress.incorrectAttempts + wrong,
      });
    }
    setView("complete");
  }, [correct, lessonId, progress, settings.sound, wrong]);

  const onKey = useCallback(
    (pressed: string) => {
      if (view !== "play" || lockRef.current) return;
      const wanted = sequence[index];
      if (!wanted) return;

      if (!keysMatch(pressed, wanted)) {
        setWrong((value) => value + 1);
        setMood("retry");
        setFeedback(
          `${pick(RETRY)} Find the ${displayKey(wanted)} key!`,
        );
        if (settings.sound) playMiss();
        return;
      }

      lockRef.current = true;
      setCorrect((value) => {
        const next = value + 1;
        if (next > 0 && next % 5 === 0) {
          setStarFlash(true);
          window.setTimeout(() => setStarFlash(false), 900);
        }
        return next;
      });
      setMood("success");
      setFeedback(pick(PRAISE));
      if (settings.sound && settings.celebrations) playSuccess();
      else if (settings.sound) playSuccess();

      window.setTimeout(
        () => {
          const nextIndex = index + 1;
          if (nextIndex >= sequence.length) {
            lockRef.current = false;
            finishLesson();
            return;
          }
          setIndex(nextIndex);
          setMood("idle");
          setFeedback("Find this key!");
          lockRef.current = false;
        },
        reducedMotion || !settings.celebrations ? 250 : 650,
      );
    },
    [
      finishLesson,
      index,
      reducedMotion,
      sequence,
      settings.celebrations,
      settings.sound,
      view,
    ],
  );

  useKeyboardInput(onKey, view === "play");

  const accuracy = useMemo(() => {
    if (!progress) return null;
    const total = progress.correctAttempts + progress.incorrectAttempts;
    if (total === 0) return null;
    return Math.round((progress.correctAttempts / total) * 100);
  }, [progress]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#F4FBFF] px-4 py-4 text-[#34364A]">
      <Decor />
      <header className="relative z-10 flex items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8] sm:text-2xl">
          ⭐ Keyboard Adventure
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-full bg-white text-xl shadow"
            aria-label={settings.sound ? "Mute sounds" : "Turn sounds on"}
            onClick={() => persistSettings({ ...settings, sound: !settings.sound })}
          >
            {settings.sound ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className="min-h-8 min-w-8 rounded-full text-sm text-[#9AA0B8]"
            aria-label="Parent settings"
            onClick={() => setView("parent")}
          >
            ⚙️
          </button>
        </div>
      </header>

      <p className="relative z-10 mt-2 hidden text-center text-sm text-[#7657E8] md:hidden">
        For the best typing practice, use a computer with a keyboard.
      </p>
      <p className="relative z-10 mt-2 text-center text-sm text-[#7657E8] sm:hidden">
        For the best typing practice, use a computer with a keyboard.
      </p>

      <main className="relative z-10 flex flex-1 flex-col">
        {view === "home" ? (
          <Home
            onStart={() => setView("lessons")}
            onPractice={() => setView("practice")}
            onParent={() => setView("parent")}
          />
        ) : null}

        {view === "lessons" && progress ? (
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 overflow-y-auto py-4 sm:grid-cols-2">
            {lessons.map((item) => (
              <LessonCard
                key={item.id}
                title={`Lesson ${item.id} · ${item.title}`}
                description={item.description}
                locked={!isLessonUnlocked(item.id, progress.completedLessons)}
                completed={progress.completedLessons.includes(item.id)}
                onSelect={() => startLesson(item.id)}
              />
            ))}
            <button
              type="button"
              className="min-h-12 rounded-full bg-white font-bold text-[#7657E8]"
              onClick={() => setView("home")}
            >
              Back
            </button>
          </div>
        ) : null}

        {view === "practice" ? (
          <PracticePicker
            selected={practiceKeys}
            onToggle={(key) =>
              setPracticeKeys((current) =>
                current.includes(key)
                  ? current.filter((item) => item !== key)
                  : [...current, key],
              )
            }
            onStart={startPractice}
            onBack={() => setView("home")}
          />
        ) : null}

        {view === "play" ? (
          <Play
            title={lessonId === 0 ? "Practice" : (lesson?.title ?? "Lesson")}
            total={sequence.length}
            filled={index}
            target={normalizeTarget(target)}
            mood={mood}
            feedback={feedback}
            instruction={instructionFor(target)}
            settings={settings}
            reducedMotion={reducedMotion}
            starFlash={starFlash}
            onHome={() => setView("home")}
          />
        ) : null}

        {view === "complete" ? (
          <LessonComplete
            onAgain={() =>
              lessonId === 0 ? startPractice() : startLesson(lessonId)
            }
            onNext={() => startLesson(lessonId + 1)}
            hasNext={lessonId > 0 && Boolean(getLesson(lessonId + 1))}
          />
        ) : null}

        {view === "parent" ? (
          <ParentSettingsPanel
            settings={settings}
            accuracy={accuracy}
            onChange={persistSettings}
            onClose={() => setView("home")}
          />
        ) : null}
      </main>
    </div>
  );
}

function Home({
  onStart,
  onPractice,
  onParent,
}: {
  onStart: () => void;
  onPractice: () => void;
  onParent: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Mascot line="Let's learn to type!" />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#7657E8] sm:text-6xl">
        Keyboard Adventure
      </h1>
      <p className="text-2xl font-semibold">Let&apos;s learn to type!</p>
      <button
        type="button"
        onClick={onStart}
        className="min-h-16 w-72 rounded-full bg-[#7657E8] text-2xl font-bold text-white shadow-lg"
      >
        Start Learning
      </button>
      <button
        type="button"
        onClick={onPractice}
        className="min-h-14 w-72 rounded-full bg-[#FFD85A] text-xl font-bold text-[#34364A] shadow-md"
      >
        Practice
      </button>
      <button
        type="button"
        onClick={onParent}
        className="text-sm text-[#9AA0B8] underline"
      >
        Parent Settings
      </button>
    </div>
  );
}

function Play({
  title,
  total,
  filled,
  target,
  mood,
  feedback,
  instruction,
  settings,
  reducedMotion,
  starFlash,
  onHome,
}: {
  title: string;
  total: number;
  filled: number;
  target: string;
  mood: Mood;
  feedback: string;
  instruction: string;
  settings: ParentSettings;
  reducedMotion: boolean;
  starFlash: boolean;
  onHome: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-2 py-1">
      <div className="flex w-full max-w-4xl items-center justify-between">
        <p className="text-sm font-semibold text-[#7657E8] sm:text-lg">{title}</p>
        <button type="button" className="text-sm text-[#9AA0B8]" onClick={onHome}>
          Home
        </button>
      </div>
      <ProgressStars total={Math.min(total, 8)} filled={Math.min(filled, 8)} />
      {starFlash ? (
        <p className="text-xl font-bold text-[#7657E8]">⭐ STAR EARNED!</p>
      ) : null}
      <Mascot
        line={mood === "success" ? feedback : mood === "retry" ? feedback : "Find this key!"}
        celebrating={mood === "success"}
      />
      <TargetLetter
        target={target}
        mood={reducedMotion || !settings.celebrations ? "idle" : mood}
        reducedMotion={reducedMotion || !settings.celebrations}
      />
      <FeedbackMessage text={instruction} kind="idle" />
      <FeedbackMessage text={mood === "idle" ? " " : feedback} kind={mood} />
      <VirtualKeyboard
        target={target}
        highlightOn={settings.keyboardHighlight || mood === "retry"}
      />
      <FingerGuide target={target} enabled={settings.fingerHints} />
    </div>
  );
}

function PracticePicker({
  selected,
  onToggle,
  onStart,
  onBack,
}: {
  selected: string[];
  onToggle: (key: string) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-6">
      <h1 className="text-3xl font-bold">Practice</h1>
      <p>Pick the keys to practice. We will show only those keys, one at a time.</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {PRACTICE_KEY_OPTIONS.map((key) => (
          <label
            key={key}
            className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-3 font-bold"
          >
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={() => onToggle(key)}
            />
            {key === " " ? "SPACE" : key.toUpperCase()}
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={onStart}
        className="min-h-14 rounded-full bg-[#7657E8] text-xl font-bold text-white disabled:opacity-50"
      >
        Start Practice
      </button>
      <button type="button" onClick={onBack} className="font-semibold text-[#7657E8]">
        Back
      </button>
    </div>
  );
}

function Decor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <span className="absolute top-16 left-8 text-4xl opacity-50">☁️</span>
      <span className="absolute top-24 right-12 text-3xl opacity-50">⭐</span>
      <span className="absolute bottom-28 left-10 text-4xl opacity-40">🎈</span>
      <span className="absolute right-16 bottom-40 text-3xl opacity-40">☁️</span>
    </div>
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
