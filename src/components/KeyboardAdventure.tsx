"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AdventureMap } from "@/components/AdventureMap";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { FingerGuide } from "@/components/FingerGuide";
import { LessonComplete } from "@/components/LessonComplete";
import { Mascot } from "@/components/Mascot";
import { ParentSettingsPanel } from "@/components/ParentSettings";
import { ProgressStars } from "@/components/ProgressStars";
import { TargetLetter } from "@/components/TargetLetter";
import { MiniKeyHint } from "@/components/MiniKeyHint";
import { MobileTypePad } from "@/components/MobileTypePad";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import {
  buildPracticeSequence,
  getLesson,
  PRACTICE_KEY_OPTIONS,
} from "@/data/lessons";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useNarrowLayout, useSoftwareKeyboardOpen } from "@/hooks/useViewport";
import { playComplete, playMiss, playSuccess } from "@/utils/audio";
import {
  displayKey,
  instructionFor,
  keysMatch,
  normalizeTarget,
} from "@/utils/keys";
import {
  celebrationMs,
  defaultSettings,
  loadSettings,
  saveSettings,
  type ParentSettings,
} from "@/utils/settings";
import {
  isLessonUnlocked,
  loadProgress,
  saveProgress,
  type Progress,
} from "@/utils/storage";

type View = "home" | "lessons" | "practice" | "play" | "complete" | "parent";
type Mood = "idle" | "success" | "retry";

const PRAISE = [
  "Great job!",
  "Awesome!",
  "You got it!",
  "Super!",
  "Fantastic!",
  "Wow!",
  "Great typing!",
];

function pick(list: string[]) {
  return list[Math.floor(Math.random() * list.length)] ?? list[0]!;
}

function spice(message: string, name: string) {
  if (!name || Math.random() > 0.35) return message;
  return message.replace("!", `, ${name}!`);
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
  const [helpLevel, setHelpLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakNote, setStreakNote] = useState<string | null>(null);
  const [missedKey, setMissedKey] = useState<string | null>(null);
  const [practiceKeys, setPracticeKeys] = useState<string[]>(["f", "j", " "]);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const lockRef = useRef(false);
  const recentKeyRef = useRef({ key: "", at: 0 });
  const [typingStarted, setTypingStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const narrow = useNarrowLayout();
  const quiet = reducedMotion || settings.reducedAnimations;

  const target = sequence[index] ?? "f";
  const lesson = getLesson(lessonId);
  const childName = settings.childName.trim();

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
    if (progress) {
      persistProgress({ ...progress, childName: next.childName.trim() });
    }
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
    setFeedback(childName ? `Find this key, ${childName}!` : "Find this key!");
    setCorrect(0);
    setWrong(0);
    setHelpLevel(0);
    setStreak(0);
    setStreakNote(null);
    setView("play");
    setTypingStarted(false);
    if (progress && progress.newlyUnlocked === id) {
      persistProgress({ ...progress, newlyUnlocked: null });
    }
  }

  function startLesson(id: number) {
    const data = getLesson(id);
    if (!data) return;
    if (
      !isLessonUnlocked(id, progress?.completedLessons ?? [], settings.unlockAll)
    ) {
      return;
    }
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
      const nextId = lessonId + 1;
      persistProgress({
        ...progress,
        childName,
        completedLessons: completed,
        currentLesson: nextId,
        starsEarned: progress.starsEarned + 1,
        correctAttempts: progress.correctAttempts + correct,
        incorrectAttempts: progress.incorrectAttempts + wrong,
        lessonBestResults: {
          ...progress.lessonBestResults,
          [String(lessonId)]: Math.max(
            progress.lessonBestResults[String(lessonId)] ?? 0,
            correct,
          ),
        },
        newlyUnlocked: getLesson(nextId) ? nextId : null,
      });
    }
    setView("complete");
    setTypingStarted(false);
  }, [childName, correct, lessonId, progress, settings.sound, wrong]);

  const onKey = useCallback(
    (pressed: string) => {
      if (view !== "play" || lockRef.current) return;
      const now = Date.now();
      if (
        pressed === recentKeyRef.current.key &&
        now - recentKeyRef.current.at < 80
      ) {
        return;
      }
      recentKeyRef.current = { key: pressed, at: now };
      const wanted = sequence[index];
      if (!wanted) return;

      if (!keysMatch(pressed, wanted)) {
        setWrong((value) => value + 1);
        setStreak(0);
        setHelpLevel((value) => Math.min(value + 1, 4));
        setMood("retry");
        setMissedKey(pressed);
        window.setTimeout(() => setMissedKey(null), 260);
        const misses = helpLevel + 1;
        const shown = displayKey(wanted);
        const retry =
          misses === 1
            ? "Almost! Try again."
            : misses === 2
              ? `Find ${shown} 👇`
              : "Press this one! 👇";
        setFeedback(spice(retry, childName));
        if (settings.sound) playMiss();
        return;
      }

      lockRef.current = true;
      setHelpLevel(0);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak === 3) setStreakNote("⭐ 3 IN A ROW! ⭐");
      if (nextStreak === 5) setStreakNote("🔥 SUPER STREAK! ⭐");
      if (nextStreak === 3 || nextStreak === 5) {
        window.setTimeout(() => setStreakNote(null), 900);
      }
      setCorrect((value) => value + 1);
      setMood("success");
      setFeedback(spice(pick(PRAISE), childName));
      if (settings.sound) playSuccess();

      window.setTimeout(() => {
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
      }, celebrationMs(settings, quiet));
    },
    [
      childName,
      finishLesson,
      helpLevel,
      index,
      quiet,
      sequence,
      settings,
      streak,
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
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#F4FBFF] px-4 py-3 text-[#34364A]">
      <Decor />
      <header className="relative z-10 flex h-12 items-center justify-between max-[500px]:h-10">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8] max-[500px]:text-base sm:text-2xl">
          <span className="max-[500px]:hidden">⭐ Keyboard Adventure</span>
          <span className="hidden max-[500px]:inline">⭐ Adventure</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="pressable min-h-11 min-w-11 rounded-full bg-white text-xl shadow"
            aria-label={settings.sound ? "Mute sounds" : "Turn sounds on"}
            onClick={() => persistSettings({ ...settings, sound: !settings.sound })}
          >
            {settings.sound ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className="min-h-10 min-w-10 rounded-full text-lg text-[#9AA0B8]"
            aria-label="Parent settings"
            onClick={() => setView("parent")}
          >
            ⚙️
          </button>
        </div>
      </header>

      <p className="relative z-10 mt-1 hidden text-center text-sm text-[#7657E8] min-[501px]:block">
        For extra finger practice, a computer keyboard is best.
      </p>

      <main className="relative z-10 flex flex-1 flex-col">
        {view === "home" ? (
          <Home
            name={childName}
            onStart={() => setView("lessons")}
            onPractice={() => setView("practice")}
          />
        ) : null}

        {view === "lessons" && progress ? (
          <AdventureMap
            progress={progress}
            unlockAll={settings.unlockAll}
            allowReplay={settings.allowReplay}
            showAll={showAllLessons}
            onPlay={startLesson}
            onHome={() => setView("home")}
            onToggleAll={() => setShowAllLessons((value) => !value)}
          />
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
            filled={index + (mood === "success" ? 1 : 0)}
            target={normalizeTarget(target)}
            mood={mood}
            feedback={feedback}
            instruction={instructionFor(target)}
            settings={settings}
            reducedMotion={quiet}
            streakNote={streakNote}
            helpLevel={helpLevel}
            missedKey={missedKey}
            compact={narrow}
            typingStarted={typingStarted}
            onTyped={onKey}
            onStartTyping={() => setTypingStarted(true)}
            onHome={() => setView("home")}
          />
        ) : null}

        {view === "complete" ? (
          <LessonComplete
            onAgain={() =>
              lessonId === 0 ? startPractice() : startLesson(lessonId)
            }
            onNext={() => {
              setView("lessons");
            }}
            hasNext={lessonId > 0}
            childName={childName}
            reducedMotion={quiet}
          />
        ) : null}

        {view === "parent" ? (
          <ParentSettingsPanel
            settings={settings}
            accuracy={accuracy}
            onChange={persistSettings}
            onClose={() => setView("home")}
            onOpenLesson={(id) => {
              const data = getLesson(id);
              if (data) startSequence(data.sequence, id);
            }}
          />
        ) : null}
      </main>
    </div>
  );
}

function Home({
  name,
  onStart,
  onPractice,
}: {
  name: string;
  onStart: () => void;
  onPractice: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <Mascot line={name ? `Ready, ${name}?` : "Ready to type?"} />
      <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[#7657E8] sm:text-7xl">
        Keyboard Adventure
      </h1>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Let&apos;s learn to type!
      </p>
      <button
        type="button"
        onClick={onStart}
        className="pressable min-h-20 w-[min(20rem,92%)] rounded-full bg-[#7657E8] font-[family-name:var(--font-display)] text-3xl font-bold text-white shadow-[0_10px_24px_rgba(118,87,232,0.35)]"
      >
        ⭐ START! ⭐
      </button>
      <button
        type="button"
        onClick={onPractice}
        className="pressable min-h-14 w-[min(16rem,80%)] rounded-full bg-[#FFD85A] font-[family-name:var(--font-display)] text-xl font-bold text-[#34364A] shadow-md"
      >
        Practice
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
  streakNote,
  helpLevel,
  missedKey,
  compact,
  typingStarted,
  onTyped,
  onStartTyping,
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
  streakNote: string | null;
  helpLevel: number;
  missedKey: string | null;
  compact: boolean;
  typingStarted: boolean;
  onTyped: (key: string) => void;
  onStartTyping: () => void;
  onHome: () => void;
}) {
  const keyboardOpen = useSoftwareKeyboardOpen();
  const tight = compact && keyboardOpen;
  const mascotLine = tight
    ? `Find ${target === " " ? "SPACE" : target.toUpperCase()} 👇`
    : mood === "idle"
      ? "Find this key!"
      : feedback;

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1 py-1 ${
        compact
          ? "max-h-svh justify-start overflow-y-auto max-[500px]:landscape:flex-row max-[500px]:landscape:flex-wrap max-[500px]:landscape:items-center max-[500px]:landscape:justify-center"
          : "justify-between"
      }`}
    >
      <div className="flex w-full max-w-5xl items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#7657E8] max-[500px]:text-sm">
          {title}
        </p>
        <button
          type="button"
          className="text-sm text-[#B7BCCD]"
          onClick={onHome}
        >
          Home
        </button>
      </div>
      <div className="flex flex-col items-center gap-1 max-[500px]:landscape:min-w-[42%]">
        <ProgressStars total={total} filled={filled} />
        {streakNote ? (
          <p className="star-pop font-[family-name:var(--font-display)] text-2xl font-bold text-[#7657E8] max-[500px]:text-lg">
            {streakNote}
          </p>
        ) : null}
        <Mascot
          line={mascotLine}
          compact={compact}
          tiny={tight}
          mood={
            mood === "success" ? "success" : mood === "retry" ? "encourage" : "idle"
          }
        />
        <TargetLetter
          target={target}
          mood={reducedMotion ? "idle" : mood}
          reducedMotion={reducedMotion}
          burst={mood === "success" && !reducedMotion}
          size={tight ? "compact" : compact ? "mobile" : "desktop"}
        />
      </div>
      <div className="flex flex-col items-center gap-2 max-[500px]:landscape:min-w-[42%]">
        {!compact ? (
          <FeedbackMessage text={instruction} kind="idle" />
        ) : (
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {tight
              ? mascotLine
              : target === " "
                ? "Press the space bar"
                : `Type the ${target.toUpperCase()} key`}
          </p>
        )}
        {compact ? (
          <>
            {!tight ? <MiniKeyHint target={target} pulse={helpLevel >= 1} /> : null}
            <MobileTypePad
              started={typingStarted}
              onStart={onStartTyping}
              onKey={onTyped}
              miss={mood === "retry"}
            />
          </>
        ) : (
          <>
            {settings.keyboardHighlight ? (
              <VirtualKeyboard
                target={target}
                highlightOn
                mood={mood}
                helpLevel={helpLevel}
                missedKey={missedKey}
              />
            ) : null}
            <FingerGuide target={target} enabled={settings.fingerHints} />
          </>
        )}
      </div>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 py-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold">
        Practice
      </h1>
      <p className="text-lg">Practice these keys:</p>
      <div className="flex flex-wrap justify-center gap-3">
        {PRACTICE_KEY_OPTIONS.map((key) => {
          const on = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={`pressable flex min-h-14 items-center justify-center rounded-[20px] border-4 font-[family-name:var(--font-display)] text-2xl font-bold ${
                key === " "
                  ? "min-w-[min(16rem,90%)] px-6"
                  : "min-w-[3.25rem]"
              } ${
                on
                  ? "border-[#7657E8] bg-[#FFD85A]"
                  : "border-[#E8E4F8] bg-white text-[#8B90A5]"
              }`}
            >
              {key === " " ? "SPACE" : key.toUpperCase()}
              {on ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={onStart}
        className="pressable min-h-16 rounded-full bg-[#7657E8] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-white disabled:opacity-50"
      >
        START PRACTICE
      </button>
      <button
        type="button"
        onClick={onBack}
        className="font-semibold text-[#9AA0B8]"
      >
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
