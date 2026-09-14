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
import { LetterAssociationCloud } from "@/components/LetterAssociationCloud";
import { MiniKeyHint } from "@/components/MiniKeyHint";
import { MobileTypePad } from "@/components/MobileTypePad";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import {
  buildPracticeSequence,
  getLesson,
  PRACTICE_KEY_OPTIONS,
} from "@/data/lessons";
import { associationFor } from "@/data/letterAssociations";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useNarrowLayout, useSoftwareKeyboardOpen } from "@/hooks/useViewport";
import { useAudio } from "@/hooks/useAudio";
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
  resetSettings,
  saveSettings,
  type ParentSettings,
} from "@/utils/settings";
import {
  isLessonUnlocked,
  loadProgress,
  resetProgress,
  saveProgress,
  type Progress,
} from "@/utils/storage";

type View = "home" | "lessons" | "practice" | "play" | "complete" | "parent";
type Mood = "idle" | "success" | "retry";

const PRAISE = [
  "AMAZING! ⭐",
  "YOU GOT IT! 🎉",
  "SUPER! ✨",
  "AWESOME! ⭐",
  "GREAT JOB! 🎉",
  "FANTASTIC! ✨",
];

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
  const [helpLevel, setHelpLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakNote, setStreakNote] = useState<string | null>(null);
  const [missedKey, setMissedKey] = useState<string | null>(null);
  const [practiceKeys, setPracticeKeys] = useState<string[]>(["f", "j", " "]);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const lockRef = useRef(false);
  const recentKeyRef = useRef({ key: "", at: 0 });
  const [seenLetters, setSeenLetters] = useState<string[]>([]);
  const [typingStarted, setTypingStarted] = useState(false);
  const { audio, voices, speechAvailable } = useAudio();
  const reducedMotion = usePrefersReducedMotion();
  const narrow = useNarrowLayout();
  const quiet = reducedMotion || settings.reducedAnimations;

  const target = sequence[index] ?? "f";
  const lesson = getLesson(lessonId);
  const childName = settings.childName.trim();

  useEffect(() => {
    audio?.configure(settings);
  }, [audio, settings]);

  useEffect(() => {
    if (view === "play" && mood === "idle") {
      audio?.notify({ type: "TARGET_SHOWN", key: target });
    }
  }, [audio, view, mood, target, index]);

  useEffect(() => {
    if (view === "home" || view === "lessons" || view === "practice" || view === "parent") {
      audio?.leaveScreen();
    }
  }, [audio, view]);

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
    setSeenLetters([]);
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
    audio?.notify({ type: "LESSON_COMPLETE" });
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
  }, [audio, childName, correct, lessonId, progress, wrong]);

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
        window.setTimeout(() => setMissedKey(null), 320);
        const shown = displayKey(wanted);
        const retry =
          helpLevel % 2 === 0
            ? `OOPS! 😮\nTRY ${shown} AGAIN!`
            : `ALMOST! ⭐\nFIND ${shown}!`;
        setFeedback(retry);
        audio?.notify({ type: "TARGET_WRONG", key: wanted, attempts: helpLevel + 1 });
        return;
      }

      lockRef.current = true;
      setHelpLevel(0);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak === 3) setStreakNote("⭐ 3 IN A ROW! ⭐");
      if (nextStreak === 5) setStreakNote("🔥 SUPER STREAK! ⭐");
      if (nextStreak === 3 || nextStreak === 5) {
        window.setTimeout(() => setStreakNote(null), 1100);
      }
      setCorrect((value) => value + 1);
      setMood("success");
      setFeedback(pick(PRAISE));
      audio?.notify({ type: "TARGET_CORRECT", key: wanted, streak: nextStreak });
      setSeenLetters((current) =>
        current.includes(normalizeTarget(wanted))
          ? current
          : [...current, normalizeTarget(wanted)],
      );
      if (nextStreak === 3) audio?.notify({ type: "STREAK_3" });
      if (nextStreak === 5) audio?.notify({ type: "STREAK_5" });

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
      }, celebrationMs(settings, quiet, nextStreak));
    },
    [
      audio,
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
    <div className={`relative flex min-h-dvh flex-col overflow-hidden px-4 py-3 text-[#34364A] ${
      view === "play" && mood === "retry"
        ? "scene-miss bg-[#F4FBFF]"
        : view === "play" && mood === "success"
          ? "scene-win bg-[#F4FBFF]"
          : "bg-[#F4FBFF]"
    }`}>
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
            aria-label={settings.sound ? "Turn sound off" : "Turn sounds on"}
            onClick={() => {
              const next = { ...settings, sound: !settings.sound };
              persistSettings(next);
              if (next.sound === false) audio?.stopSpeech();
            }}
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

      {view !== "play" ? (
        <p className="relative z-10 mt-1 hidden text-center text-sm text-[#7657E8] min-[501px]:block">
          For extra finger practice, a computer keyboard is best.
        </p>
      ) : null}

      <main className="relative z-10 flex flex-1 flex-col">
        {view === "home" ? (
          <Home
            name={childName}
            onStart={() => {
              audio?.unlock();
              setView("lessons");
            }}
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
            step={index}
            target={normalizeTarget(target)}
            mood={mood}
            feedback={feedback}
            instruction={instructionFor(target)}
            settings={settings}
            reducedMotion={quiet}
            streakNote={streakNote}
            streak={streak}
            helpLevel={helpLevel}
            firstLook={!seenLetters.includes(normalizeTarget(target))}
            missedKey={missedKey}
            compact={narrow}
            typingStarted={typingStarted}
            onTyped={onKey}
            onStartTyping={() => setTypingStarted(true)}
            onRepeat={() => audio?.repeatTarget(target)}
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
            voices={voices}
            speechAvailable={speechAvailable}
            onPreviewVoice={() => audio?.preview()}
            onClose={() => setView("home")}
            onOpenLesson={(id) => {
              const data = getLesson(id);
              if (data) startSequence(data.sequence, id);
            }}
            onResetProgress={() => {
              persistProgress(resetProgress(childName));
              setView("home");
            }}
            onResetAll={() => {
              persistProgress(resetProgress(""));
              persistSettings(resetSettings());
              setView("home");
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
  step,
  target,
  mood,
  feedback,
  instruction,
  settings,
  reducedMotion,
  streakNote,
  streak,
  helpLevel,
  firstLook,
  missedKey,
  compact,
  typingStarted,
  onTyped,
  onStartTyping,
  onRepeat,
  onHome,
}: {
  title: string;
  total: number;
  filled: number;
  step: number;
  target: string;
  mood: Mood;
  feedback: string;
  instruction: string;
  settings: ParentSettings;
  reducedMotion: boolean;
  streakNote: string | null;
  streak: number;
  helpLevel: number;
  firstLook: boolean;
  missedKey: string | null;
  compact: boolean;
  typingStarted: boolean;
  onTyped: (key: string) => void;
  onStartTyping: () => void;
  onRepeat: () => void;
  onHome: () => void;
}) {
  const keyboardOpen = useSoftwareKeyboardOpen();
  const tight = compact && keyboardOpen;
  const mascotLine = tight
    ? `Find ${target === " " ? "SPACE" : target.toUpperCase()} 👇`
    : mood === "retry"
      ? `Try ${target === " " ? "SPACE" : target.toUpperCase()} again!`
      : mood === "success"
        ? "You got it!"
        : "Find this key!";

  const burstLevel = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;

  return (
    <div
      className={`play-board flex flex-1 flex-col items-center gap-2 py-1 ${
        compact ? "play-compact max-h-svh justify-start overflow-y-auto" : "justify-between"
      }`}
    >
      <div className="flex w-full shrink-0 max-w-5xl items-center justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#7657E8] max-[500px]:text-sm">
          {title}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="pressable min-h-11 min-w-11 rounded-full bg-white text-xl shadow"
            aria-label="Repeat instruction"
            onClick={onRepeat}
          >
            🔊
          </button>
          <button
            type="button"
            className="text-sm text-[#B7BCCD]"
            onClick={onHome}
          >
            Home
          </button>
        </div>
      </div>
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
      {!tight && associationFor(target) && mood === "success" ? (
        <LetterAssociationCloud
          letter={target}
          mode="reward"
          compact={compact}
          reducedMotion={reducedMotion}
        />
      ) : !tight && associationFor(target) && (firstLook || helpLevel >= 2) ? (
        <LetterAssociationCloud
          letter={target}
          mode={helpLevel >= 2 && !firstLook ? "hint" : "intro"}
          compact={compact}
          reducedMotion={reducedMotion}
        />
      ) : null}
      <TargetLetter
        key={`${step}-${target}`}
        target={target}
        mood={reducedMotion && mood === "idle" ? "idle" : mood}
        reducedMotion={reducedMotion}
        burst={mood === "success" && !reducedMotion}
        burstLevel={burstLevel}
        size={tight ? "compact" : compact ? "mobile" : "desktop"}
        banner={mood === "idle" ? null : feedback}
      />
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
