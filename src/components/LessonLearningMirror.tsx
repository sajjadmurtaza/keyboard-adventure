"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { associationsFor } from "@/data/letterAssociations";
import { lessonMirrorCostumeForArt } from "@/data/lessonMirrorCostumes";
import { livingSceneForArt } from "@/data/livingScenes";
import {
  startCameraSession,
  stopCameraTracks,
} from "@/lib/dressUp/cameraSession";
import {
  getCachedLessonMirrorImage,
  preloadLessonMirrorImages,
} from "@/lib/dressUp/lessonMirrorImages";
import { getFaceLandmarker } from "@/lib/dressUp/faceLandmarker";
import { drawLiveMirrorFrame } from "@/lib/dressUp/liveMirrorFrame";
import { drawLivingMirrorMood } from "@/lib/dressUp/livingMirrorEffects";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";
import { LetterArt } from "@/components/illustrations/LetterArt";
import { useAudio } from "@/hooks/useAudio";

type MirrorMood = "idle" | "success" | "retry";

type LessonLearningMirrorProps = {
  letter: string;
  cameraAllowedByParent: boolean;
  mood: MirrorMood;
  reducedMotion?: boolean;
  onOpenParentSettings: () => void;
  /** Wider stage layout for Magic Learning Stage */
  stageLayout?: boolean;
};

type MirrorState = "off" | "starting" | "live" | "error";

const EMPTY_STEP = { key: "", index: 0 };
/** Headroom around video so petal rings / hoods are not clipped. */
const LESSON_STAGE_PAD = 0.28;

/**
 * Optional in-lesson Magic Mirror — continuous live face + association costume.
 * Layers: (1) live video (2) tracked costume (3) typing effects.
 */
export function LessonLearningMirror({
  letter,
  cameraAllowedByParent,
  mood,
  reducedMotion = false,
  onOpenParentSettings,
  stageLayout = true,
}: LessonLearningMirrorProps) {
  const [mirror, setMirror] = useState<MirrorState>("off");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tooClose, setTooClose] = useState(false);

  const { audio } = useAudio();
  const assocStep = useSyncExternalStore(
    audio?.subscribeAssociation ?? (() => () => undefined),
    () => audio?.getAssociation() ?? EMPTY_STEP,
    () => EMPTY_STEP,
  );

  const items = associationsFor(letter);
  const index = assocStep.key === letter ? assocStep.index : 0;
  const activeItem = items[index] ?? items[0];
  const costume = lessonMirrorCostumeForArt(activeItem?.art);
  const scene = livingSceneForArt(activeItem?.art);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<Awaited<ReturnType<typeof getFaceLandmarker>> | null>(
    null,
  );
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const sessionGenRef = useRef(0);
  const costumeRef = useRef(costume);
  const sceneRef = useRef(scene);
  const parentAllowedRef = useRef(cameraAllowedByParent);
  const reducedMotionRef = useRef(reducedMotion);
  const smootherRef = useRef(new FacePoseSmoother(0.38));
  const moodRef = useRef(mood);
  const tooCloseRef = useRef(false);
  const lastHintPublishRef = useRef(0);

  useEffect(() => {
    costumeRef.current = costume;
  }, [costume]);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    parentAllowedRef.current = cameraAllowedByParent;
  }, [cameraAllowedByParent]);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    void preloadLessonMirrorImages().catch(() => undefined);
  }, []);

  const tearDown = useCallback(() => {
    sessionGenRef.current += 1;
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    stopCameraTracks(streamRef.current);
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    smootherRef.current.reset();
    tooCloseRef.current = false;
    setTooClose(false);
    setMirror("off");
    setErrorMessage(null);
  }, []);

  const releaseLandmarker = useCallback(() => {
    if (!landmarkerRef.current) return;
    try {
      landmarkerRef.current.close();
    } catch {
      /* ignore */
    }
    landmarkerRef.current = null;
  }, []);

  useEffect(() => {
    if (cameraAllowedByParent) return;
    if (mirror !== "live" && mirror !== "starting") return;
    /* eslint-disable react-hooks/set-state-in-effect -- camera must stop when parent revokes */
    tearDown();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [cameraAllowedByParent, mirror, tearDown]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") tearDown();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      tearDown();
      releaseLandmarker();
    };
  }, [tearDown, releaseLandmarker]);

  useEffect(() => {
    if (mirror !== "live") return;

    const tick = () => {
      if (!runningRef.current) return;
      if (!parentAllowedRef.current) {
        tearDown();
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const costumeNow = costumeRef.current;
      const image = costumeNow
        ? getCachedLessonMirrorImage(costumeNow.art)
        : null;

      const frame = drawLiveMirrorFrame({
        video,
        canvas,
        landmarker: landmarkerRef.current,
        smoother: smootherRef.current,
        costume: costumeNow,
        costumeImage: image,
        stagePad: LESSON_STAGE_PAD,
        stageFill: sceneRef.current?.tint ?? "#BBDDF5",
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawLivingMirrorMood(
          ctx,
          canvas.width,
          canvas.height,
          moodRef.current,
          sceneRef.current?.celebrate,
          reducedMotionRef.current,
          performance.now(),
        );
      }

      const now = performance.now();
      if (now - lastHintPublishRef.current > 400) {
        lastHintPublishRef.current = now;
        if (tooCloseRef.current !== frame.tooClose) {
          tooCloseRef.current = frame.tooClose;
          setTooClose(frame.tooClose);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mirror, tearDown]);

  async function startMirror() {
    if (!cameraAllowedByParent) {
      setMirror("error");
      setErrorMessage("Ask a grown-up to allow Learning Mirror in Parent settings.");
      return;
    }
    tearDown();
    const gen = sessionGenRef.current;
    setMirror("starting");
    setErrorMessage(null);

    const session = await startCameraSession({ parentAllowed: true });
    if (gen !== sessionGenRef.current) {
      if (session.ok) stopCameraTracks(session.stream);
      return;
    }
    if (!session.ok) {
      setMirror("error");
      setErrorMessage(session.message);
      return;
    }

    streamRef.current = session.stream;
    const video = videoRef.current;
    if (!video) {
      stopCameraTracks(session.stream);
      setMirror("error");
      setErrorMessage("Could not start the camera.");
      return;
    }
    video.srcObject = session.stream;
    try {
      await video.play();
    } catch {
      if (gen !== sessionGenRef.current) return;
      stopCameraTracks(session.stream);
      setMirror("error");
      setErrorMessage("Could not start the camera.");
      return;
    }
    if (gen !== sessionGenRef.current) {
      stopCameraTracks(session.stream);
      return;
    }

    try {
      await preloadLessonMirrorImages();
    } catch {
      /* still show camera */
    }
    if (gen !== sessionGenRef.current) return;

    try {
      landmarkerRef.current = await getFaceLandmarker();
    } catch {
      landmarkerRef.current = null;
    }
    if (gen !== sessionGenRef.current) return;

    smootherRef.current.reset();
    setMirror("live");
  }

  const shellClass = stageLayout
    ? "magic-mirror-shell"
    : "flex w-full max-w-[12rem] flex-col items-center gap-1.5";

  const frameClass = stageLayout
    ? "magic-mirror-frame relative overflow-hidden rounded-[20px] shadow-[0_8px_20px_rgba(48,48,71,0.12)]"
    : "relative aspect-[4/3] w-full overflow-hidden rounded-[22px] shadow-[0_10px_28px_rgba(48,48,71,0.12)]";

  const offSceneMotion =
    reducedMotion || !activeItem
      ? ""
      : `art-idle-${activeItem.motion}`;

  if (!cameraAllowedByParent) {
    return (
      <div
        className={shellClass}
        data-testid="lesson-mirror-gated"
      >
        <div
          className={`${frameClass} flex flex-col items-center justify-center gap-1 p-2 text-center`}
          style={{ background: scene?.tint ?? "#E8F6FF" }}
        >
          {activeItem ? (
            <div
              className={`mb-1 h-[62%] w-[62%] max-h-44 max-w-44 ${offSceneMotion}`}
              aria-hidden
            >
              <LetterArt id={activeItem.art} className="h-full w-full" />
            </div>
          ) : null}
          <p className="font-[family-name:var(--font-display)] text-sm font-bold leading-tight text-[#303047]">
            {scene?.place ?? "Magic Scene"}
          </p>
          {costume ? (
            <p className="text-xs font-semibold leading-tight text-[#7048D7]">
              Meet the {costume.name}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-0.5 text-[10px] font-semibold text-[#7048D7] underline"
            onClick={onOpenParentSettings}
          >
            Grown-ups: allow Learning Mirror
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={shellClass}
      data-testid="lesson-learning-mirror"
      data-mirror-art={costume?.art ?? ""}
      data-mirror-live={mirror === "live" ? "true" : "false"}
    >
      <div
        className={frameClass}
        style={{ background: scene?.tint ?? "#BBDDF5" }}
      >
        {mirror === "live" ? (
          <div className="pointer-events-none absolute left-2 top-2 z-[2] flex max-w-[85%] items-center gap-1.5">
            <span className="truncate rounded-full bg-white/90 px-2 py-0.5 font-[family-name:var(--font-nunito)] text-[10px] font-bold text-[#303047] shadow sm:text-[11px] sm:px-2.5">
              {scene ? `🌷 ${scene.place}` : "Magic Mirror"}
            </span>
            <span
              className="shrink-0 rounded-full bg-[#2AA85A] px-2 py-0.5 font-[family-name:var(--font-nunito)] text-[10px] font-bold text-white shadow"
              data-testid="lesson-mirror-live-badge"
            >
              ● Live
            </span>
          </div>
        ) : null}

        <video
          ref={videoRef}
          className="pointer-events-none absolute h-px w-px opacity-0"
          playsInline
          muted
          autoPlay
          aria-hidden
        />
        <canvas
          ref={canvasRef}
          data-testid="lesson-mirror-canvas"
          className={`h-full w-full object-contain ${mirror === "live" ? "block" : "hidden"}`}
        />
        {mirror === "live" ? (
          <div
            className={`pointer-events-none absolute inset-0 rounded-[22px] ${
              mood === "success" && !reducedMotion ? "lesson-mirror-win" : ""
            } ${mood === "retry" && !reducedMotion ? "lesson-mirror-miss" : ""}`}
            aria-hidden
          />
        ) : null}

        {mirror === "live" && tooClose ? (
          <p
            className="pointer-events-none absolute bottom-12 left-1/2 z-[2] w-[90%] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-center font-[family-name:var(--font-nunito)] text-xs font-bold text-[#7048D7] shadow"
            data-testid="lesson-mirror-too-close"
          >
            A little farther back — let&apos;s fit your whole costume!
          </p>
        ) : null}

        {mirror !== "live" ? (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#7048D7]/90 to-[#9B7BFF]/90 text-center text-white ${
              stageLayout ? "gap-1 p-2" : "gap-1.5 p-3"
            }`}
          >
            <p
              className={`font-[family-name:var(--font-display)] font-bold ${
                stageLayout ? "text-sm leading-tight" : "text-base sm:text-lg"
              }`}
            >
              {mirror === "starting" ? "Waking mirror…" : "See yourself!"}
            </p>
            {costume && !stageLayout ? (
              <p className="text-xs font-semibold opacity-95 sm:text-sm">
                Become a {costume.name}
                {scene ? ` · ${scene.place}` : ""}
              </p>
            ) : null}
            {costume && stageLayout ? (
              <p className="max-w-full truncate px-1 text-[10px] font-semibold opacity-95">
                Become a {costume.name}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="max-w-xs text-[10px] leading-snug" data-testid="lesson-mirror-error">
                {errorMessage}
              </p>
            ) : null}
            {mirror !== "starting" ? (
              <button
                type="button"
                data-testid="lesson-mirror-start"
                onClick={() => void startMirror()}
                className={`pressable rounded-full bg-white font-[family-name:var(--font-display)] font-bold text-[#7048D7] shadow ${
                  stageLayout
                    ? "mt-0.5 min-h-8 px-3 text-xs"
                    : "mt-1 min-h-9 px-4 text-sm"
                }`}
              >
                ✨ Start camera
              </button>
            ) : null}
            {!stageLayout ? (
              <p className="text-[10px] font-semibold text-white/90">
                🔒 Stays on this device
              </p>
            ) : (
              <p className="text-[9px] font-semibold text-white/85">🔒 This device</p>
            )}
          </div>
        ) : null}

        {mirror === "live" ? (
          <>
            <p
              className="pointer-events-none absolute bottom-3 left-3 z-[2] max-w-[70%] truncate rounded-full bg-white/95 px-2.5 py-1 font-[family-name:var(--font-display)] text-[11px] font-bold text-[#7048D7] shadow"
              data-testid="lesson-mirror-costume-name"
            >
              {costume ? `You are a ${costume.name}!` : "Looking magical!"}
            </p>
            <button
              type="button"
              data-testid="lesson-mirror-stop"
              onClick={tearDown}
              className="pressable absolute bottom-3 right-3 z-[2] min-h-8 rounded-full bg-white/95 px-3 font-[family-name:var(--font-display)] text-xs font-bold text-[#7048D7] shadow"
            >
              Stop camera
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
