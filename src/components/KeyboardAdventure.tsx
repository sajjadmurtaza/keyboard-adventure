"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Celebration } from "@/components/celebration/Celebration";
import { celebrationLevelFor } from "@/components/celebration/plan";
import { ChildNameSetup } from "@/components/ChildNameSetup";
import { AdventureMap } from "@/components/AdventureMap";
import { FeedbackMessage } from "@/components/FeedbackMessage";
import { LessonComplete } from "@/components/LessonComplete";
import { Mascot } from "@/components/Mascot";
import { ParentSettingsPanel } from "@/components/ParentSettings";
import { ProgressStars } from "@/components/ProgressStars";
import { TargetLetter } from "@/components/TargetLetter";
import { LetterArt } from "@/components/illustrations/LetterArt";
import { LetterAssociationCloud } from "@/components/LetterAssociationCloud";
import { MiniKeyHint } from "@/components/MiniKeyHint";
import { MobileTypingField, StartTypingButton } from "@/components/MobileTypePad";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import {
  buildPracticeSequence,
  getLesson,
  PRACTICE_KEY_OPTIONS,
} from "@/data/lessons";
import { associationsFor } from "@/data/letterAssociations";
import { getSuccessPraise } from "@/data/letterPraise";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import {
  canAcceptTyping,
  reviewHoldMs,
  targetArriveMs,
  wrongFeedbackMs,
  type LessonPhase,
} from "@/lib/lessonPhase";
import {
  useCoarsePointer,
  useHeightDensity,
  useNarrowLayout,
  useSoftwareKeyboardOpen,
  useVisualViewportVar,
} from "@/hooks/useViewport";
import {
  lessonRun,
  visitTone,
  recallWord,
  type LessonRun,
  type VisitTone,
} from "@/lib/curriculum/sequence";
import type { MascotMood } from "@/components/mascot/types";
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
import { isValidChildName, parseChildName } from "@/utils/childName";
import {
  detectKeyboardLayout,
  layoutFromTypedKey,
  type KeyboardLayoutId,
} from "@/utils/keyboardLayouts";
import {
  isLessonUnlocked,
  loadProgress,
  resetProgress,
  saveProgress,
  type Progress,
} from "@/utils/storage";

type View = "home" | "lessons" | "practice" | "play" | "complete" | "parent";
type Mood = "idle" | "success" | "retry";

function mascotMoodFor(mood: Mood, streak: number): MascotMood {
  if (mood === "retry") return "encourage";
  if (mood === "success" && streak >= 3) return "streak";
  if (mood === "success") return "success";
  return "idle";
}

const emptyRun: LessonRun = { turns: [], newKeys: [], reviewPool: [], reviewVisits: [] };

function learnedLabel(run: LessonRun, lessonId: number): string {
  if (lessonId === 0) return "Practice";
  if (run.newKeys.length > 0) return run.newKeys.map((key) => displayKey(key)).join(" + ");
  return getLesson(lessonId)?.title ?? "This lesson";
}

function nextLessonLabel(lessonId: number): string | null {
  const next = getLesson(lessonId + 1);
  if (!next) return null;
  return next.keys.map((key) => displayKey(key)).join(" + ");
}

export function KeyboardAdventure() {
  const [view, setView] = useState<View>("home");
  const [settings, setSettings] = useState<ParentSettings>(defaultSettings);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [lessonId, setLessonId] = useState(1);
  const [index, setIndex] = useState(0);
  const [mood, setMood] = useState<Mood>("idle");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [helpLevel, setHelpLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakNote, setStreakNote] = useState<string | null>(null);
  const [celebrationSeed, setCelebrationSeed] = useState(1);
  const [missedKey, setMissedKey] = useState<string | null>(null);
  const [practiceKeys, setPracticeKeys] = useState<string[]>(["f", "j", " "]);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [lessonPhase, setLessonPhase] = useState<LessonPhase>("ready");
  const [settingsReady, setSettingsReady] = useState(false);
  const [detectedLayout, setDetectedLayout] = useState<KeyboardLayoutId>("en-us");
  const resolvedLayout =
    settings.keyboardLayout === "auto" ? detectedLayout : settings.keyboardLayout;
  const lockRef = useRef(false);
  const phaseRef = useRef<LessonPhase>("ready");
  const successTimerRef = useRef<number | null>(null);
  const arriveTimerRef = useRef<number | null>(null);
  const successTokenRef = useRef(0);
  const lessonGenRef = useRef(0);
  const recentKeyRef = useRef({ key: "", at: 0 });
  const [seenLetters, setSeenLetters] = useState<string[]>([]);
  const [introduced, setIntroduced] = useState<string[]>([]);
  const [playSeed, setPlaySeed] = useState(0);
  const [activeRun, setActiveRun] = useState<LessonRun>(emptyRun);
  const introducedRef = useRef<string[]>([]);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const { audio, voices, speechAvailable } = useAudio();
  const reducedMotion = usePrefersReducedMotion();
  const narrow = useNarrowLayout();
  const coarse = useCoarsePointer();
  const keyboardOpen = useSoftwareKeyboardOpen();
  const density = useHeightDensity();
  const quiet = reducedMotion || settings.reducedAnimations;
  useVisualViewportVar();

  useEffect(() => {
    document.documentElement.classList.toggle("lesson-play", view === "play");
    return () => document.documentElement.classList.remove("lesson-play");
  }, [view]);

  function setPhase(next: LessonPhase) {
    phaseRef.current = next;
    setLessonPhase(next);
  }

  function clearSuccessTimer() {
    if (successTimerRef.current != null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }

  function clearArriveTimer() {
    if (arriveTimerRef.current != null) {
      window.clearTimeout(arriveTimerRef.current);
      arriveTimerRef.current = null;
    }
  }

  const scheduleReady = useCallback((gen: number) => {
    clearArriveTimer();
    lockRef.current = true;
    setPhase("preparing");
    arriveTimerRef.current = window.setTimeout(() => {
      if (gen !== lessonGenRef.current) return;
      lockRef.current = false;
      setPhase("ready");
    }, targetArriveMs(quiet));
  }, [quiet]);

  useEffect(() => () => {
    clearSuccessTimer();
    clearArriveTimer();
  }, []);

  function focusMobileType() {
    const node = mobileInputRef.current;
    node?.focus();
    requestAnimationFrame(() => mobileInputRef.current?.focus());
  }

  function blurMobileType() {
    mobileInputRef.current?.blur();
  }

  const target = sequence[index] ?? "f";
  const childName = settings.childName.trim();

  useEffect(() => {
    audio?.configure(settings);
  }, [audio, settings]);

  useEffect(() => {
    if (view === "play" && lessonPhase === "ready" && mood === "idle") {
      const previous = index > 0 ? sequence[index - 1] : undefined;
      const shortened = Boolean(previous && keysMatch(previous, target));
      const tone = visitTone(target, activeRun.newKeys, introduced);
      audio?.notify({
        type: "TARGET_SHOWN",
        key: target,
        shortened,
        word: tone === "introduce" ? undefined : recallWord(target, index),
        review: tone === "review",
      });
    }
  }, [activeRun.newKeys, audio, introduced, view, mood, target, index, lessonPhase, sequence]);

  useEffect(() => {
    if (view === "home" || view === "lessons" || view === "practice" || view === "parent") {
      audio?.leaveScreen();
    }
  }, [audio, view]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage once */
    setSettings(loadSettings());
    const saved = loadProgress();
    setProgress(saved);
    setIntroduced(saved.introducedKeys);
    introducedRef.current = saved.introducedKeys;
    setSettingsReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (settings.keyboardLayout !== "auto") return;
    let cancelled = false;
    void detectKeyboardLayout().then((id) => {
      if (!cancelled) setDetectedLayout(id);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.keyboardLayout]);

  useEffect(() => {
    if (settings.keyboardLayout !== "auto") return;
    function onKey(event: KeyboardEvent) {
      const hinted = layoutFromTypedKey(event.code, event.key);
      if (hinted) setDetectedLayout(hinted);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settings.keyboardLayout]);

  function persistProgress(next: Progress) {
    setProgress(next);
    saveProgress(next);
  }

  function persistSettings(next: ParentSettings) {
    const name = parseChildName(next.childName) ?? next.childName.trim();
    const saved = { ...next, childName: name };
    setSettings(saved);
    saveSettings(saved);
    if (progress) {
      persistProgress({ ...progress, childName: name });
    }
  }

  function goHome() {
    if (view === "home") return;
    clearSuccessTimer();
    clearArriveTimer();
    lockRef.current = false;
    setPhase("ready");
    blurMobileType();
    audio?.leaveScreen();
    setView("home");
  }

  function startSequence(keys: string[], id: number, preserve = false) {
    let seq = keys;
    if (!preserve && id > 0 && settings.difficulty === "growing") {
      seq = [...keys, ...keys].slice(0, settings.questionCount);
    } else if (id > 0 && settings.difficulty === "practice") {
      seq = keys.slice(0, settings.questionCount);
    }
    clearSuccessTimer();
    lessonGenRef.current += 1;
    successTokenRef.current += 1;
    setLessonId(id);
    setSequence(seq.length ? seq : keys);
    setIndex(0);
    setMood("idle");
    setCorrect(0);
    setWrong(0);
    setHelpLevel(0);
    setStreak(0);
    setStreakNote(null);
    setView("play");
    setSeenLetters([]);
    scheduleReady(lessonGenRef.current);
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
    beginLesson(id);
  }

  function startPractice() {
    const seq = buildPracticeSequence(practiceKeys, settings.questionCount);
    setActiveRun({
      turns: seq,
      newKeys: [...new Set(seq)],
      reviewPool: [],
      reviewVisits: [],
    });
    startSequence(seq, 0);
    if (narrow) focusMobileType();
  }

  function beginLesson(id: number) {
    const run = lessonRun(id, progress?.completedLessons ?? [], playSeed);
    setPlaySeed((value) => value + 1);
    setActiveRun(run);
    startSequence([...run.turns], id, true);
    if (narrow) focusMobileType();
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
        introducedKeys: introducedRef.current,
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
    setPhase("complete");
    blurMobileType();
  }, [audio, childName, correct, lessonId, progress, wrong]);

  const onKey = useCallback(
    (pressed: string) => {
      if (view !== "play" || lockRef.current) return;
      if (!canAcceptTyping(phaseRef.current)) return;
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
        setPhase("wrong-feedback");
        setWrong((value) => value + 1);
        setStreak(0);
        setHelpLevel((value) => Math.min(value + 1, 4));
        setMood("retry");
        setMissedKey(pressed);
        window.setTimeout(() => setMissedKey(null), wrongFeedbackMs(quiet));
        audio?.notify({ type: "TARGET_WRONG", key: wanted, attempts: helpLevel + 1 });
        window.setTimeout(() => {
          if (phaseRef.current === "wrong-feedback") setPhase("ready");
        }, wrongFeedbackMs(quiet));
        return;
      }

      lockRef.current = true;
      setPhase("success");
      setHelpLevel(0);
      const nextStreak = streak + 1;
      const tone = visitTone(wanted, activeRun.newKeys, introducedRef.current);
      const normalizedWanted = normalizeTarget(wanted);
      if (!introducedRef.current.includes(normalizedWanted)) {
        introducedRef.current = [...introducedRef.current, normalizedWanted];
        setIntroduced(introducedRef.current);
        if (progress) {
          persistProgress({ ...progress, introducedKeys: introducedRef.current });
        }
      }
      const firstLook = !seenLetters.includes(normalizedWanted);
      const praise = getSuccessPraise(wanted, {
        firstLook,
        streak: nextStreak,
        name: childName,
      });
      setStreak(nextStreak);
      if (nextStreak === 3) setStreakNote("⭐ 3 IN A ROW! ⭐");
      if (nextStreak === 5) setStreakNote("🔥 SUPER STREAK! ⭐");
      if (nextStreak === 3 || nextStreak === 5) {
        window.setTimeout(() => setStreakNote(null), celebrationMs(settings, quiet, nextStreak));
      }
      setCorrect((value) => value + 1);
      setMood("success");
      audio?.notify({
        type: "TARGET_CORRECT",
        key: wanted,
        streak: nextStreak,
        phrase: praise.spoken,
        speakPraise: praise.speak,
        teachLine: praise.teachLine,
        speakTeach: praise.speakTeach,
      });
      setSeenLetters((current) =>
        current.includes(normalizedWanted) ? current : [...current, normalizedWanted],
      );
      if (nextStreak === 3) audio?.notify({ type: "STREAK_3" });
      if (nextStreak === 5) audio?.notify({ type: "STREAK_5" });

      const capturedIndex = index;
      const gen = lessonGenRef.current;
      const token = ++successTokenRef.current;
      setCelebrationSeed(token);
      clearSuccessTimer();
      successTimerRef.current = window.setTimeout(() => {
        if (token !== successTokenRef.current) return;
        if (gen !== lessonGenRef.current) return;
        if (phaseRef.current !== "success") return;
        const nextIndex = capturedIndex + 1;
        if (nextIndex >= sequence.length) {
          lockRef.current = false;
          finishLesson();
          return;
        }
        setPhase("transitioning");
        setIndex(nextIndex);
        setMood("idle");
        scheduleReady(gen);
      }, tone === "review" && nextStreak < 3 ? reviewHoldMs(quiet) : celebrationMs(settings, quiet, nextStreak));
    },
    [
      activeRun.newKeys,
      audio,
      childName,
      finishLesson,
      helpLevel,
      index,
      quiet,
      progress,
      scheduleReady,
      seenLetters,
      sequence,
      settings,
      streak,
      view,
    ],
  );

  useKeyboardInput(onKey, view === "play" && canAcceptTyping(lessonPhase));

  const accuracy = useMemo(() => {
    if (!progress) return null;
    const total = progress.correctAttempts + progress.incorrectAttempts;
    if (total === 0) return null;
    return Math.round((progress.correctAttempts / total) * 100);
  }, [progress]);

  if (!settingsReady) {
    return <div className="min-h-dvh bg-[#F4FBFF]" />;
  }

  if (!isValidChildName(settings.childName) && view !== "parent") {
    return (
      <ChildNameSetup
        onSave={(name) => {
          persistSettings({ ...settings, childName: name });
        }}
      />
    );
  }

  return (
    <div className={`relative flex flex-col overflow-hidden px-4 text-[#34364A] ${
      view === "play" && mood === "retry"
        ? "scene-miss bg-[#F4FBFF]"
        : view === "play" && mood === "success"
          ? "scene-win bg-[#F4FBFF]"
          : "bg-[#F4FBFF]"
    } ${view === "play" ? "h-[var(--visual-viewport-height,100dvh)] overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))]" : "min-h-dvh pb-3"}`}
    style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <Decor dim={narrow && keyboardOpen} hidden={narrow && keyboardOpen} />
      {narrow ? (
        <MobileTypingField
          ref={mobileInputRef}
          enabled={view === "play" && canAcceptTyping(lessonPhase)}
          onKey={onKey}
          onFocus={() => undefined}
        />
      ) : null}
      <header className="relative z-10 flex h-11 shrink-0 items-center justify-between gap-2 max-[500px]:h-10">
        {view === "play" ? (
          <button
            type="button"
            className="pressable shrink-0 font-[family-name:var(--font-display)] text-sm font-semibold text-[#7657E8]"
            onClick={goHome}
          >
            ← Back
          </button>
        ) : (
          <button
            type="button"
            data-testid="go-home"
            className="pressable shrink-0 font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8] max-[500px]:text-base sm:text-2xl"
            aria-label="Go home"
            onClick={goHome}
          >
            <span className="max-[500px]:hidden">⭐ Keyboard Adventure</span>
            <span className="hidden max-[500px]:inline">⭐ Adventure</span>
          </button>
        )}
        {view === "play" ? (
          <button
            type="button"
            data-testid="go-home"
            className="pressable hidden font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8] min-[501px]:block"
            aria-label="Go home"
            onClick={goHome}
          >
            ⭐ Keyboard Adventure
          </button>
        ) : null}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="pressable min-h-11 min-w-11 rounded-full bg-white text-xl shadow"
            data-testid="global-mute"
            aria-label={settings.sound ? "Turn sound off" : "Turn sound on"}
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
            className="pressable min-h-10 min-w-10 rounded-full text-lg text-[#9AA0B8]"
            data-testid="parent-settings"
            aria-label="Open parent settings"
            onClick={() => {
              blurMobileType();
              setView("parent");
            }}
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
            onHome={goHome}
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
            onBack={goHome}
          />
        ) : null}

        {view === "play" ? (
          <Play
            step={index}
            target={normalizeTarget(target)}
            mood={mood}
            lessonPhase={lessonPhase}
            sequence={sequence}
            instruction={instructionFor(target)}
            settings={settings}
            reducedMotion={quiet}
            streakNote={streakNote}
            celebrationSeed={celebrationSeed}
            streak={streak}
            helpLevel={helpLevel}
            missedKey={missedKey}
            compact={narrow}
            density={density}
            keyboardOpen={keyboardOpen}
            showTypeButton={coarse && !keyboardOpen}
            onStartTyping={focusMobileType}
            onRepeat={() => audio?.repeatTarget(target)}
            progressTotal={sequence.length}
            progressFilled={index + (mood === "success" ? 1 : 0)}
            layout={resolvedLayout}
            tone={visitTone(normalizeTarget(target), activeRun.newKeys, introduced)}
          />
        ) : null}

        {view === "complete" ? (
          <LessonComplete
            onAgain={() =>
              lessonId === 0 ? startPractice() : startLesson(lessonId)
            }
            onNext={() => {
              const nextId = lessonId + 1;
              if (getLesson(nextId)) {
                startLesson(nextId);
                return;
              }
              setView("lessons");
            }}
            hasNext={lessonId > 0 && Boolean(getLesson(lessonId + 1))}
            learned={learnedLabel(activeRun, lessonId)}
            remembered={activeRun.reviewVisits.map((key) => displayKey(key))}
            nextLabel={nextLessonLabel(lessonId)}
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
            onPreviewVoice={(uri) => audio?.preview(uri)}
            onPreviewName={() => audio?.previewName()}
            onClose={goHome}
            onOpenLesson={(id) => {
              if (getLesson(id)) beginLesson(id);
            }}
            onResetProgress={() => {
              const next = resetProgress(childName);
              introducedRef.current = next.introducedKeys;
              setIntroduced(next.introducedKeys);
              persistProgress(next);
              setView("home");
            }}
            onResetAll={() => {
              const next = resetProgress("");
              introducedRef.current = next.introducedKeys;
              setIntroduced(next.introducedKeys);
              persistProgress(next);
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
  step,
  target,
  mood,
  lessonPhase,
  sequence,
  instruction,
  settings,
  reducedMotion,
  streakNote,
  celebrationSeed,
  streak,
  helpLevel,
  missedKey,
  compact,
  density,
  keyboardOpen,
  showTypeButton,
  onStartTyping,
  onRepeat,
  progressTotal,
  progressFilled,
  layout,
  tone,
}: {
  step: number;
  target: string;
  mood: Mood;
  lessonPhase: LessonPhase;
  sequence: string[];
  instruction: string;
  settings: ParentSettings;
  reducedMotion: boolean;
  streakNote: string | null;
  celebrationSeed: number;
  streak: number;
  helpLevel: number;
  missedKey: string | null;
  compact: boolean;
  density: "tall" | "normal" | "compact" | "tight";
  keyboardOpen: boolean;
  showTypeButton: boolean;
  onStartTyping: () => void;
  onRepeat: () => void;
  progressTotal: number;
  progressFilled: number;
  layout: KeyboardLayoutId;
  tone: VisitTone;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tightKb = compact && keyboardOpen;
  const label = target === " " ? "SPACE" : target.toUpperCase();
  const foundLine = `You found ${label}!`;
  const successLine = tone === "review" ? "You remembered!" : foundLine;
  const idleLine = tone === "review" ? "You know this!" : instruction;
  const findLine = tightKb ? `Type ${label}` : `Find ${label} 👇`;
  const mascotLine =
    mood === "retry"
      ? `Try ${label} again!`
      : mood === "success"
        ? successLine
        : tone === "review"
          ? "You know this!"
          : "Find this key!";
  const burstLevel = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
  const copyLine =
    mood === "success" ? successLine : mood === "retry" ? mascotLine : idleLine;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const node = stageRef.current;
    if (!node) return;
    if (node.scrollHeight > node.clientHeight + 8) {
      console.warn("Lesson layout overflow detected");
    }
  }, [density, compact, keyboardOpen, target, mood]);

  const association = (
    <LetterAssociationCloud
      letter={target}
      mode={mood === "success" ? "reward" : "intro"}
      badge={compact && !tightKb}
      inline={tightKb}
      reducedMotion={reducedMotion}
    />
  );

  return (
    <div
      ref={stageRef}
      className={`play-board relative grid min-h-0 flex-1 justify-items-center overflow-hidden ${
        tightKb
          ? "mobile-keyboard-open content-start grid-rows-[auto_minmax(0,1fr)_auto]"
          : "content-stretch grid-rows-[auto_minmax(0,1fr)_auto_auto]"
      }`}
      style={{ gap: "var(--lesson-gap)" }}
      data-testid="play-stage"
      data-lesson-phase={lessonPhase}
    >
      {mood === "success" ? (
        <Celebration
          level={celebrationLevelFor(streak)}
          compact={compact || tightKb}
          reducedMotion={reducedMotion}
          seed={celebrationSeed}
        />
      ) : null}
      <PreloadLessonArt keys={sequence} />
      <div className="relative z-[1] mt-2 flex w-full shrink-0 flex-col items-center justify-center gap-1 min-[501px]:flex-row min-[501px]:justify-center min-[501px]:gap-6" style={{ minHeight: "calc(var(--mascot-size) + 8px)" }}>
        <ProgressStars
          total={progressTotal}
          filled={progressFilled}
          compact
        />
        {streakNote && density === "tall" && !tightKb ? (
          <p className="pointer-events-none absolute top-0 right-2 star-pop font-[family-name:var(--font-display)] text-xl font-bold text-[#7657E8] max-[500px]:text-lg">
            {streakNote}
          </p>
        ) : null}
        <div className="flex items-center gap-1">
          {tightKb || density === "tight" ? null : (
            <Mascot
              line={mascotLine}
              compact
              tiny={density === "compact"}
              mood={mascotMoodFor(mood, streak)}
            />
          )}
          <button
            type="button"
            className="pressable min-h-9 min-w-9 rounded-full bg-white text-lg shadow"
            data-testid="repeat-instruction"
            aria-label="Repeat instruction"
            onClick={onRepeat}
          >
            🔁
          </button>
        </div>
      </div>
      <div className="target-group relative z-[3] min-h-0 w-full">
        {association}
        <TargetLetter
          key={`${step}-${target}`}
          target={target}
          mood={reducedMotion && mood === "idle" ? "idle" : mood}
          reducedMotion={reducedMotion}
          burst={mood === "success" && !reducedMotion}
          burstLevel={tightKb ? 1 : burstLevel}
          size={tightKb ? "compact" : compact ? "mobile" : "desktop"}
        />
      </div>
      {compact ? (
        <p
          className={`mb-1 h-7 shrink-0 overflow-hidden font-[family-name:var(--font-display)] font-semibold leading-7 ${tightKb ? "text-base" : "text-lg"} ${
            mood === "success" ? "text-[#2AA85A]" : mood === "retry" ? "text-[#7657E8]" : ""
          }`}
          data-testid={mood === "success" ? "success-teach" : "lesson-instruction"}
        >
          {tightKb && mood === "idle" ? findLine : copyLine}
        </p>
      ) : (
        <FeedbackMessage
          text={copyLine}
          kind={mood === "retry" ? "retry" : mood === "success" ? "success" : "idle"}
        />
      )}
      {compact && !tightKb ? (
        <div className="flex shrink-0 flex-col items-center" data-testid="mini-key">
          <MiniKeyHint target={target} pulse={helpLevel >= 1} />
          {showTypeButton ? (
            <StartTypingButton miss={mood === "retry"} onPress={onStartTyping} />
          ) : null}
        </div>
      ) : null}
      {!compact ? (
        <div className="mb-1 flex w-full shrink-0 flex-col items-center">
          {settings.keyboardHighlight ? (
            <VirtualKeyboard
              target={target}
              highlightOn
              mood={mood}
              helpLevel={helpLevel}
              missedKey={missedKey}
              fingerHints={settings.fingerHints}
              layout={layout}
              compactHint
              arrive={lessonPhase === "preparing"}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PreloadLessonArt({ keys }: { keys: string[] }) {
  const ids = [
    ...new Set(
      keys.flatMap((key) => associationsFor(key).map((item) => item.art)),
    ),
  ];
  if (ids.length === 0) return null;
  return (
    <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
      {ids.map((id) => (
        <LetterArt key={id} id={id} />
      ))}
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

function Decor({ dim = false, hidden = false }: { dim?: boolean; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${dim ? "opacity-25" : ""}`}
      aria-hidden
    >
      <span className="absolute top-16 left-8 text-4xl opacity-50">☁️</span>
      <span className="decoration-secondary absolute bottom-28 left-10 text-4xl opacity-40">🎈</span>
      <span className="decoration-secondary absolute right-16 bottom-40 text-3xl opacity-40">☁️</span>
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
