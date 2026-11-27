"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { associationsFor } from "@/data/letterAssociations";
import {
  isCanvasLessonCostume,
  isSceneLessonCostume,
  lessonMirrorCostumeForArt,
} from "@/data/lessonMirrorCostumes";
import { mirrorExperienceForArt } from "@/data/lessonMirrorExperiences";
import { livingSceneForArt } from "@/data/livingScenes";
import {
  startCameraSession,
  stopCameraTracks,
} from "@/lib/dressUp/cameraSession";
import {
  ensureLessonMirrorImage,
  getCachedLessonMirrorImage,
  preloadLessonMirrorImages,
} from "@/lib/dressUp/lessonMirrorImages";
import { getFaceLandmarker } from "@/lib/dressUp/faceLandmarker";
import { getPoseLandmarker } from "@/lib/dressUp/poseLandmarker";
import { drawLiveMirrorFrame } from "@/lib/dressUp/liveMirrorFrame";
import { drawLessonMirrorExperience } from "@/lib/dressUp/lessonMirrorExperience";
import { drawLivingMirrorMood } from "@/lib/dressUp/livingMirrorEffects";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";
import { LetterArt } from "@/components/illustrations/LetterArt";
import { useAudio } from "@/hooks/useAudio";
import type { PoseLandmarkerHandle } from "@/lib/dressUp/poseLandmarker";

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
  const [faceMissing, setFaceMissing] = useState(false);
  const [canvasCostumeReady, setCanvasCostumeReady] = useState(false);

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
  const experience = mirrorExperienceForArt(activeItem?.art);
  const costumeReady =
    !!costume &&
    (!isCanvasLessonCostume(costume) || canvasCostumeReady);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<Awaited<ReturnType<typeof getFaceLandmarker>> | null>(
    null,
  );
  const poseLandmarkerRef = useRef<PoseLandmarkerHandle | null>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const sessionGenRef = useRef(0);
  const costumeRef = useRef(costume);
  const sceneRef = useRef(scene);
  const experienceRef = useRef(experience);
  const parentAllowedRef = useRef(cameraAllowedByParent);
  const reducedMotionRef = useRef(reducedMotion);
  const smootherRef = useRef(new FacePoseSmoother(0.38));
  const moodRef = useRef(mood);
  const tooCloseRef = useRef(false);
  const lastHintPublishRef = useRef(0);
  const costumeArtRef = useRef<string | null>(null);
  const costumeSwapAtRef = useRef(0);

  useEffect(() => {
    costumeRef.current = costume;
    let cancelled = false;
    if (!costume || !isCanvasLessonCostume(costume)) {
      return;
    }
    const wearable = costume;
    /* eslint-disable react-hooks/set-state-in-effect -- reset ready while the new SVG loads */
    setCanvasCostumeReady(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    void ensureLessonMirrorImage(wearable)
      .then(() => {
        if (!cancelled) setCanvasCostumeReady(true);
      })
      .catch(() => {
        if (!cancelled) setCanvasCostumeReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [costume]);

  // Prefetch the next few association wearables for this letter.
  useEffect(() => {
    for (const item of items) {
      const next = lessonMirrorCostumeForArt(item.art);
      if (next && isCanvasLessonCostume(next)) {
        void ensureLessonMirrorImage(next).catch(() => undefined);
      }
    }
  }, [items]);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    experienceRef.current = experience;
  }, [experience]);

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
    setFaceMissing(false);
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
      const canvasCostume = isCanvasLessonCostume(costumeNow)
        ? costumeNow
        : null;
      const image = canvasCostume
        ? getCachedLessonMirrorImage(canvasCostume.art)
        : null;
      // If the tour advanced before decode finished, kick another load.
      if (canvasCostume && !image) {
        void ensureLessonMirrorImage(canvasCostume).catch(() => undefined);
      }

      const artKey = canvasCostume?.art ?? null;
      if (artKey && artKey !== costumeArtRef.current) {
        costumeArtRef.current = artKey;
        costumeSwapAtRef.current = performance.now();
      } else if (!artKey) {
        costumeArtRef.current = null;
      }
      const swapAge = performance.now() - costumeSwapAtRef.current;
      const costumeEntrance = reducedMotionRef.current
        ? 1
        : Math.min(1, swapAge / 420);

      let costumeActionBob = 0;
      if (
        !reducedMotionRef.current &&
        moodRef.current === "success" &&
        canvasCostume
      ) {
        if (canvasCostume.style === "hand-prop" && canvasCostume.anchor === "mouth") {
          costumeActionBob = Math.sin(performance.now() / 90) * 0.04;
        } else if (canvasCostume.art === "drum") {
          costumeActionBob = Math.sin(performance.now() / 70) * 0.03;
        }
      }

      let shoulderOverride: {
        cx: number;
        cy: number;
        width: number;
        rotation?: number;
      } | null = null;
      if (
        canvasCostume?.style === "body-wear" &&
        poseLandmarkerRef.current
      ) {
        try {
          shoulderOverride = poseLandmarkerRef.current.detectForVideo(
            video,
            performance.now(),
          );
        } catch {
          shoulderOverride = null;
        }
      }

      const frame = drawLiveMirrorFrame({
        video,
        canvas,
        landmarker: landmarkerRef.current,
        smoother: smootherRef.current,
        costume: canvasCostume,
        costumeImage: image,
        stagePad: LESSON_STAGE_PAD,
        stageFill: sceneRef.current?.tint ?? "#BBDDF5",
        costumeEntrance,
        costumeActionBob,
        shoulderOverride,
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const nowMs = performance.now();
        // Ambient world first (heat / sea / rain…) so the child feels the object.
        drawLessonMirrorExperience(
          ctx,
          canvas.width,
          canvas.height,
          experienceRef.current,
          moodRef.current,
          reducedMotionRef.current,
          nowMs,
          frame.pose,
        );
        drawLivingMirrorMood(
          ctx,
          canvas.width,
          canvas.height,
          moodRef.current,
          sceneRef.current?.celebrate,
          reducedMotionRef.current,
          nowMs,
        );
      }

      const now = performance.now();
      if (now - lastHintPublishRef.current > 400) {
        lastHintPublishRef.current = now;
        if (tooCloseRef.current !== frame.tooClose) {
          tooCloseRef.current = frame.tooClose;
          setTooClose(frame.tooClose);
        }
        setFaceMissing(!frame.detected);
        if (frame.costumeDrawn) setCanvasCostumeReady(true);
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
      /* still show camera + DOM stickers */
    }
    if (costume && isCanvasLessonCostume(costume)) {
      try {
        await ensureLessonMirrorImage(costume);
        if (gen === sessionGenRef.current) setCanvasCostumeReady(true);
      } catch {
        /* portrait stickers / companions still show the object */
      }
    }
    if (gen !== sessionGenRef.current) return;

    try {
      landmarkerRef.current = await getFaceLandmarker();
    } catch {
      // Camera still works — portrait fallback keeps props on screen.
      landmarkerRef.current = null;
    }
    // Lazy pose model only when jacket (body-wear) may need shoulders.
    if (costume?.style === "body-wear") {
      try {
        poseLandmarkerRef.current = await getPoseLandmarker();
      } catch {
        poseLandmarkerRef.current = null;
      }
    }
    if (gen !== sessionGenRef.current) return;

    smootherRef.current.reset();
    setFaceMissing(true);
    setMirror("live");
  }

  const shellClass = stageLayout
    ? "magic-mirror-shell"
    : "flex w-full flex-col items-center gap-2";

  // Play layout: same panel height as the picture card. Stage keeps compact magic frame.
  const frameClass = stageLayout
    ? "magic-mirror-frame relative overflow-hidden rounded-[20px] shadow-[0_8px_20px_rgba(48,48,71,0.12)]"
    : "lesson-mirror-frame-play relative overflow-hidden rounded-[28px] shadow-[0_10px_24px_rgba(48,48,71,0.14)]";

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

  const liveBadge =
    mirror === "live" ? (
      <span
        className="pointer-events-none absolute left-2 top-2 z-[2] rounded-full bg-[#2AA85A] px-2.5 py-0.5 font-[family-name:var(--font-nunito)] text-[11px] font-bold text-white shadow"
        data-testid="lesson-mirror-live-badge"
      >
        ● Live
      </span>
    ) : null;

  const companionMode = isSceneLessonCostume(costume);
  const reactClass =
    !reducedMotion && mood === "success" && activeItem
      ? `lesson-mirror-react lesson-mirror-react--${activeItem.art}`
      : "";

  /** Sheet-style accessory tiles for this letter — active one pops like the AR preview. */
  const accessoryTour =
    items.length > 0 ? (
      <div
        className="lesson-mirror-accessory-tour"
        data-testid="lesson-mirror-accessory-tour"
        aria-hidden
      >
        {items.map((entry, i) => {
          const tileCostume = lessonMirrorCostumeForArt(entry.art);
          const active = i === index;
          const src =
            tileCostume &&
            isCanvasLessonCostume(tileCostume) &&
            tileCostume.assetPath
              ? tileCostume.assetPath
              : null;
          return (
            <div
              key={`${entry.art}-${i}`}
              className={`lesson-mirror-accessory-tile ${
                active ? "lesson-mirror-accessory-tile--active" : ""
              } ${!reducedMotion && active ? "lesson-mirror-accessory-tile--pop" : ""}`}
              data-active={active ? "true" : "false"}
              data-art={entry.art}
            >
              <div className="lesson-mirror-accessory-tile__art">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local AR accessory PNG/SVG
                  <img src={src} alt="" draggable={false} />
                ) : (
                  <LetterArt id={entry.art} className="h-full w-full" />
                )}
              </div>
              <span className="lesson-mirror-accessory-tile__label">
                {entry.word}
              </span>
            </div>
          );
        })}
      </div>
    ) : null;

  const associationStickers =
    activeItem && mirror === "live" && !companionMode ? (
      <div
        className={`pointer-events-none absolute right-1.5 top-1.5 z-[3] ${
          stageLayout ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"
        } ${reducedMotion ? "" : offSceneMotion} ${reactClass}`}
        data-testid="lesson-mirror-sticker-right"
        aria-hidden
      >
        {costume && isCanvasLessonCostume(costume) && costume.assetPath ? (
          // eslint-disable-next-line @next/next/no-img-element -- local AR accessory
          <img
            src={costume.assetPath}
            alt=""
            className="h-full w-full object-contain drop-shadow-md"
            draggable={false}
          />
        ) : (
          <LetterArt id={activeItem.art} className="h-full w-full drop-shadow-md" />
        )}
      </div>
    ) : null;

  /** Face-relative LetterArt props when no dedicated wearable exists. */
  const companionProps =
    activeItem && mirror === "live" && companionMode ? (
      <div
        className={`pointer-events-none absolute inset-0 z-[3] ${reactClass}`}
        data-testid="lesson-mirror-companion"
        data-companion-art={activeItem.art}
        aria-hidden
      >
        <div
          className={`lesson-mirror-companion lesson-mirror-companion--left ${
            reducedMotion ? "" : offSceneMotion
          }`}
        >
          <LetterArt id={activeItem.art} className="h-full w-full drop-shadow-md" />
        </div>
        <div
          className={`lesson-mirror-companion lesson-mirror-companion--right ${
            reducedMotion ? "" : offSceneMotion
          }`}
          style={{ animationDelay: reducedMotion ? undefined : "0.35s" }}
        >
          <LetterArt id={activeItem.art} className="h-full w-full drop-shadow-md" />
        </div>
      </div>
    ) : null;

  const media = (
    <>
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
      {associationStickers}
      {companionProps}
      {mirror === "live" ? (
        <div
          className={`pointer-events-none absolute inset-0 rounded-[28px] ${
            mood === "success" && !reducedMotion ? "lesson-mirror-win" : ""
          } ${mood === "retry" && !reducedMotion ? "lesson-mirror-miss" : ""} ${
            !reducedMotion && mood === "success" && costume && !companionMode
              ? `lesson-mirror-react lesson-mirror-react--${costume.art}`
              : ""
          }`}
          aria-hidden
        />
      ) : null}
      {mirror === "live" && faceMissing ? (
        <p
          className="pointer-events-none absolute bottom-3 left-1/2 z-[2] w-[90%] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-center font-[family-name:var(--font-nunito)] text-xs font-bold text-[#7048D7] shadow"
          data-testid="lesson-mirror-face-guide"
        >
          {costumeReady
            ? `Look at the camera — become the ${costume?.name ?? "friend"}!`
            : "Look at the camera — your costume is waking up!"}
        </p>
      ) : null}
      {mirror === "live" && tooClose && !faceMissing ? (
        <p
          className="pointer-events-none absolute bottom-3 left-1/2 z-[2] w-[90%] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-center font-[family-name:var(--font-nunito)] text-xs font-bold text-[#7048D7] shadow"
          data-testid="lesson-mirror-too-close"
        >
          A little farther back — let&apos;s fit your whole costume!
        </p>
      ) : null}
    </>
  );

  return (
    <div
      className={shellClass}
      data-testid="lesson-learning-mirror"
      data-mirror-art={costume?.art ?? ""}
      data-mirror-style={costume?.style ?? ""}
      data-mirror-experience={experience.id}
      data-mirror-live={mirror === "live" ? "true" : "false"}
      data-mirror-fallback={costume?.fallback ? "true" : "false"}
    >
      <div
        className={frameClass}
        style={{ background: scene?.tint ?? "#BBDDF5" }}
      >
        {liveBadge}
        {media}
        {mirror !== "live" ? (
          <div
            className={`absolute inset-0 z-[1] flex flex-col items-center justify-center bg-gradient-to-b from-[#7048D7]/90 to-[#9B7BFF]/90 text-center text-white ${
              stageLayout ? "gap-1 p-2" : "gap-1.5 p-3"
            }`}
          >
            {activeItem ? (
              <div
                className={`lesson-mirror-preview-tile shrink-0 ${
                  stageLayout ? "h-16 w-16" : "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20"
                } ${reducedMotion ? "" : offSceneMotion}`}
                data-testid="lesson-mirror-preview-art"
                aria-hidden
              >
                {costume && isCanvasLessonCostume(costume) && costume.assetPath ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local AR accessory
                  <img
                    src={costume.assetPath}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <LetterArt id={activeItem.art} className="h-full w-full" />
                )}
              </div>
            ) : null}
            <p
              className={`font-[family-name:var(--font-display)] font-bold ${
                stageLayout ? "text-sm leading-tight" : "text-sm sm:text-base"
              }`}
            >
              {mirror === "starting"
                ? "Waking mirror…"
                : experience.id !== "default-play"
                  ? experience.feelLine
                  : costume
                    ? `Become a ${costume.name}!`
                    : "See yourself!"}
            </p>
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
                    : "mt-1 min-h-10 px-5 text-sm"
                }`}
              >
                ✨ Start camera
              </button>
            ) : null}
            <p className="text-[10px] font-semibold text-white/90">
              🔒 Stays on this device
            </p>
          </div>
        ) : null}

        {/* Stage layout keeps compact overlays; play layout uses the control row below */}
        {stageLayout && mirror === "live" ? (
          <>
            <p
              className="pointer-events-none absolute bottom-3 left-3 z-[2] max-w-[70%] truncate rounded-full bg-white/95 px-2.5 py-1 font-[family-name:var(--font-display)] text-[11px] font-bold text-[#7048D7] shadow"
              data-testid="lesson-mirror-costume-name"
            >
              {experience.feelLine}
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

      <div className="mt-1 flex w-full flex-col items-center gap-1 px-0.5">
        {accessoryTour}
        {!stageLayout && mirror === "live" ? (
          <div className="flex w-full items-center justify-center gap-1.5">
            <p
              className="min-w-0 truncate font-[family-name:var(--font-display)] text-xs font-bold text-[#7048D7] sm:text-sm"
              data-testid="lesson-mirror-costume-name"
            >
              {experience.feelLine}
            </p>
            <button
              type="button"
              data-testid="lesson-mirror-stop"
              onClick={tearDown}
              className="pressable min-h-8 shrink-0 rounded-full bg-white px-3 font-[family-name:var(--font-display)] text-xs font-bold text-[#7048D7] shadow"
            >
              Stop
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
