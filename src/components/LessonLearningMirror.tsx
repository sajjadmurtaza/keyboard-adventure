"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  associationsFor,
  type LetterArtId,
} from "@/data/letterAssociations";
import {
  isCanvasLessonCostume,
  isDomCompanionCostume,
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
  isLessonMirrorPaused,
  setLessonMirrorPaused,
} from "@/lib/dressUp/lessonMirrorPreference";
import {
  ensureLessonMirrorImage,
  getCachedLessonMirrorImage,
  preloadLessonMirrorImages,
} from "@/lib/dressUp/lessonMirrorImages";
import { getFaceLandmarker } from "@/lib/dressUp/faceLandmarker";
import { getPoseLandmarker } from "@/lib/dressUp/poseLandmarker";
import { getImageSegmenter } from "@/lib/dressUp/imageSegmenter";
import { drawCostumeOverlay } from "@/lib/dressUp/faceOverlay";
import {
  drawLiveMirrorFrame,
  MirrorFramingSmoother,
} from "@/lib/dressUp/liveMirrorFrame";
import { drawLessonMirrorExperience } from "@/lib/dressUp/lessonMirrorExperience";
import { drawLivingMirrorMood } from "@/lib/dressUp/livingMirrorEffects";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";
import { LetterArt } from "@/components/illustrations/LetterArt";
import { useAudio } from "@/hooks/useAudio";
import type { PoseLandmarkerHandle } from "@/lib/dressUp/poseLandmarker";
import type { ImageSegmenterHandle } from "@/lib/dressUp/imageSegmenter";

type MirrorMood = "idle" | "success" | "retry";

type LessonLearningMirrorProps = {
  letter: string;
  cameraAllowedByParent: boolean;
  /**
   * Parent-authorized local person cutout. When false or unsupported, the
   * mirror keeps the rectangular live-video overlay.
   */
  personCutoutAllowedByParent?: boolean;
  mood: MirrorMood;
  reducedMotion?: boolean;
  onOpenParentSettings: () => void;
  /** Wider stage layout for Magic Learning Stage */
  stageLayout?: boolean;
  /** Dev/preview: lock the active association art. */
  forceArt?: LetterArtId;
};

type MirrorState = "off" | "starting" | "live" | "error";

const EMPTY_STEP = { key: "", index: 0 };
/** Headroom around video so petal rings / hoods are not clipped. */
/** Extra stage around the full camera frame for hats / companions (no digital zoom). */
const LESSON_STAGE_PAD = 0.32;

/**
 * Optional in-lesson Magic Mirror — continuous live face + association costume.
 * Layers: (1) live video (2) tracked costume (3) typing effects.
 */
export function LessonLearningMirror({
  letter,
  cameraAllowedByParent,
  personCutoutAllowedByParent = false,
  mood,
  reducedMotion = false,
  onOpenParentSettings,
  stageLayout = true,
  forceArt,
}: LessonLearningMirrorProps) {
  const [mirror, setMirror] = useState<MirrorState>("off");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tooClose, setTooClose] = useState(false);
  const [tooFar, setTooFar] = useState(false);
  const [faceMissing, setFaceMissing] = useState(false);
  /** Soft companion scale driven by face-centered framing zoom. */
  const [companionZoom, setCompanionZoom] = useState(1);
  const [canvasCostumeReady, setCanvasCostumeReady] = useState(false);

  const { audio } = useAudio();
  const assocStep = useSyncExternalStore(
    audio?.subscribeAssociation ?? (() => () => undefined),
    () => audio?.getAssociation() ?? EMPTY_STEP,
    () => EMPTY_STEP,
  );

  const items = associationsFor(letter);
  const index = assocStep.key === letter ? assocStep.index : 0;
  const activeItem = forceArt
    ? (items.find((item) => item.art === forceArt) ?? {
        word: forceArt,
        art: forceArt,
        motion: "bounce" as const,
      })
    : (items[index] ?? items[0]);
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
  const segmenterRef = useRef<ImageSegmenterHandle | null>(null);
  const cutoutAllowedRef = useRef(personCutoutAllowedByParent);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const sessionGenRef = useRef(0);
  const costumeRef = useRef(costume);
  const sceneRef = useRef(scene);
  const experienceRef = useRef(experience);
  const parentAllowedRef = useRef(cameraAllowedByParent);
  const reducedMotionRef = useRef(reducedMotion);
  const smootherRef = useRef(new FacePoseSmoother(0.38));
  const framingRef = useRef(new MirrorFramingSmoother(0.16));
  const moodRef = useRef(mood);
  const tooCloseRef = useRef(false);
  const tooFarRef = useRef(false);
  const lastHintPublishRef = useRef(0);
  const costumeArtRef = useRef<string | null>(null);
  const costumeSwapAtRef = useRef(0);
  const mirrorRef = useRef<MirrorState>("off");
  const startMirrorRef = useRef<() => Promise<void>>(async () => undefined);
  const autoStartInFlightRef = useRef(false);
  const autoStartAttemptsRef = useRef(0);

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
    cutoutAllowedRef.current = personCutoutAllowedByParent;
  }, [personCutoutAllowedByParent]);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    mirrorRef.current = mirror;
  }, [mirror]);

  useEffect(() => {
    void preloadLessonMirrorImages().catch(() => undefined);
  }, []);

  const tearDown = useCallback(() => {
    sessionGenRef.current += 1;
    runningRef.current = false;
    autoStartInFlightRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    stopCameraTracks(streamRef.current);
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    smootherRef.current.reset();
    framingRef.current.reset();
    tooCloseRef.current = false;
    tooFarRef.current = false;
    setTooClose(false);
    setTooFar(false);
    setFaceMissing(false);
    setMirror("off");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (cameraAllowedByParent) return;
    if (mirror !== "live" && mirror !== "starting") return;
    setLessonMirrorPaused(false);
    /* eslint-disable react-hooks/set-state-in-effect -- camera must stop when parent revokes */
    tearDown();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [cameraAllowedByParent, mirror, tearDown]);

  useEffect(() => {
    const onVis = () => {
      // Pause the stream while the tab is hidden; resume later if still wanted.
      if (document.visibilityState === "hidden") {
        tearDown();
        return;
      }
      // Tab visible again — retry auto-start if parent still allows it.
      if (
        cameraAllowedByParent &&
        !isLessonMirrorPaused() &&
        mirrorRef.current === "off"
      ) {
        void startMirrorRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      tearDown();
      // Keep MediaPipe singletons warm across lesson remounts — closing them
      // while the next lesson auto-starts caused crashes on "next adventure".
      landmarkerRef.current = null;
      poseLandmarkerRef.current = null;
      segmenterRef.current = null;
    };
  }, [tearDown, cameraAllowedByParent]);

  /* Camera-off: keep the themed world alive on the same canvas region. */
  useEffect(() => {
    if (mirror === "live" || mirror === "starting") return;
    if (!cameraAllowedByParent) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let active = true;

    const paintWorld = () => {
      if (!active) return;
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width || parent.clientWidth));
        const h = Math.max(
          1,
          Math.floor(rect.height || parent.clientHeight || 320),
        );
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      }
      const ctx = canvas.getContext("2d");
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.fillStyle = sceneRef.current?.tint ?? "#BBDDF5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawLessonMirrorExperience(
          ctx,
          canvas.width,
          canvas.height,
          experienceRef.current,
          moodRef.current,
          reducedMotionRef.current,
          performance.now(),
          null,
        );
      }
      raf = requestAnimationFrame(paintWorld);
    };

    raf = requestAnimationFrame(paintWorld);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [mirror, cameraAllowedByParent, activeItem?.art]);

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

      let personCutout: HTMLCanvasElement | null = null;
      if (cutoutAllowedRef.current && segmenterRef.current) {
        try {
          personCutout = segmenterRef.current.segmentPerson(
            video,
            performance.now(),
          );
        } catch {
          personCutout = null;
        }
      }

      const nowMs = performance.now();
      const frame = drawLiveMirrorFrame({
        video,
        canvas,
        landmarker: landmarkerRef.current,
        smoother: smootherRef.current,
        framing: framingRef.current,
        costume: canvasCostume,
        costumeImage: image,
        stagePad: LESSON_STAGE_PAD,
        stageFill: sceneRef.current?.tint ?? "#BBDDF5",
        costumeEntrance,
        costumeActionBob,
        shoulderOverride,
        personCutout,
        requireFaceForCostume: true,
        drawBackdrop: personCutout
          ? (ctx, cw, ch) => {
              drawLessonMirrorExperience(
                ctx,
                cw,
                ch,
                experienceRef.current,
                moodRef.current,
                reducedMotionRef.current,
                nowMs,
                null,
              );
            }
          : undefined,
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Rectangular overlay keeps ambient as a soft wash over the video.
        // Person cutout already drew the world behind the child.
        // frame.pose is already mirrored + framed in canvas space.
        if (!frame.personCutoutUsed) {
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
          // Hybrid: keep Dress-Up tracking above the ambient wash.
          if (canvasCostume && image && frame.pose && frame.detected) {
            drawCostumeOverlay(
              ctx,
              frame.pose,
              canvasCostume,
              image,
              {
                nowMs,
                animate: !reducedMotionRef.current,
                entrance: costumeEntrance,
                actionBob: costumeActionBob,
                canvasW: canvas.width,
                canvasH: canvas.height,
              },
            );
          }
        }
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
        if (tooFarRef.current !== frame.tooFar) {
          tooFarRef.current = frame.tooFar;
          setTooFar(frame.tooFar);
        }
        setCompanionZoom(frame.zoom);
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

  const startMirror = useCallback(async () => {
    if (!cameraAllowedByParent) {
      setMirror("error");
      setErrorMessage("Ask a grown-up to allow Learning Mirror in Parent settings.");
      return;
    }
    setLessonMirrorPaused(false);
    // Reset the stream without flashing mirror back to "off" (that would
    // re-trigger auto-start and stack sessions).
    sessionGenRef.current += 1;
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    stopCameraTracks(streamRef.current);
    streamRef.current = null;
    const videoEl = videoRef.current;
    if (videoEl) videoEl.srcObject = null;
    smootherRef.current.reset();
    framingRef.current.reset();

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

    // Remount / next-lesson can briefly leave the <video> unset — wait a few
    // frames instead of sticking in error (which blocked auto-start).
    let video: HTMLVideoElement | null = videoRef.current;
    for (let i = 0; i < 45 && !video; i += 1) {
      if (gen !== sessionGenRef.current) {
        stopCameraTracks(session.stream);
        return;
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      video = videoRef.current;
    }
    if (!video) {
      stopCameraTracks(session.stream);
      if (autoStartAttemptsRef.current < 3) {
        // Stay "off" so the auto-start effect can try again on the next paint.
        setMirror("off");
        setErrorMessage(null);
      } else {
        setMirror("error");
        setErrorMessage("Could not start the camera.");
      }
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
    const costumeNow = costumeRef.current;
    if (costumeNow && isCanvasLessonCostume(costumeNow)) {
      try {
        await ensureLessonMirrorImage(costumeNow);
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
    if (costumeNow?.style === "body-wear") {
      try {
        poseLandmarkerRef.current = await getPoseLandmarker();
      } catch {
        poseLandmarkerRef.current = null;
      }
    }
    // Optional local person cutout — never required; rectangular overlay remains the fallback.
    if (cutoutAllowedRef.current) {
      try {
        segmenterRef.current = await getImageSegmenter();
      } catch {
        segmenterRef.current = null;
      }
    } else {
      segmenterRef.current = null;
    }
    if (gen !== sessionGenRef.current) return;

    smootherRef.current.reset();
    autoStartAttemptsRef.current = 0;
    setFaceMissing(true);
    setMirror("live");
  }, [cameraAllowedByParent]);

  startMirrorRef.current = startMirror;

  // Parent allowed + not paused → open the mirror without another Start tap
  // (new lesson, remount, or return to this tab).
  useEffect(() => {
    if (!cameraAllowedByParent) return;
    if (isLessonMirrorPaused()) return;
    if (mirror !== "off") return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    if (autoStartInFlightRef.current) return;
    if (autoStartAttemptsRef.current >= 3) return;
    autoStartInFlightRef.current = true;
    autoStartAttemptsRef.current += 1;
    void startMirror().finally(() => {
      autoStartInFlightRef.current = false;
    });
  }, [cameraAllowedByParent, mirror, startMirror]);

  const shellClass = stageLayout
    ? "magic-mirror-shell"
    : "lesson-mirror-shell-play";

  // Play layout: same panel height as the picture card. Stage keeps compact magic frame.
  const frameClass = stageLayout
    ? "magic-mirror-frame relative overflow-hidden rounded-[20px] shadow-[0_8px_20px_rgba(48,48,71,0.12)]"
    : "lesson-mirror-frame-play relative overflow-hidden rounded-[28px]";

  const offSceneMotion =
    reducedMotion || !activeItem
      ? ""
      : `art-idle-${activeItem.motion}`;

  const inviteLine =
    mirror === "starting"
      ? "Waking mirror…"
      : experience.feelLine ||
        (costume
          ? `Meet ${/^[aeiou]/i.test(costume.name) ? "an" : "a"} ${costume.name}`
          : "See yourself!");

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

  const companionMode =
    isSceneLessonCostume(costume) || isDomCompanionCostume(costume);
  const reactClass =
    !reducedMotion && mood === "success" && activeItem
      ? `lesson-mirror-react lesson-mirror-react--${activeItem.art}`
      : "";

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
  const companionScale = Math.min(1.35, Math.max(0.72, companionZoom * 0.92));
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
          style={{
            transform: `translateY(-50%) rotate(-8deg) scale(${companionScale})`,
          }}
        >
          <LetterArt id={activeItem.art} className="h-full w-full drop-shadow-md" />
        </div>
        <div
          className={`lesson-mirror-companion lesson-mirror-companion--right ${
            reducedMotion ? "" : offSceneMotion
          }`}
          style={{
            animationDelay: reducedMotion ? undefined : "0.35s",
            transform: `translateY(-50%) rotate(8deg) scale(${companionScale})`,
          }}
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
        className="absolute inset-0 z-0 h-full w-full object-cover"
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
          A little farther back!
        </p>
      ) : null}
      {mirror === "live" && tooFar && !tooClose && !faceMissing ? (
        <p
          className="pointer-events-none absolute bottom-3 left-1/2 z-[2] w-[90%] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-center font-[family-name:var(--font-nunito)] text-xs font-bold text-[#7048D7] shadow"
          data-testid="lesson-mirror-too-far"
        >
          A little closer!
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
        style={{ background: scene?.tint ?? "#E8F6FF" }}
      >
        {liveBadge}
        {media}
        {mirror !== "live" ? (
          <div
            className={`lesson-mirror-idle absolute inset-0 z-[1] flex flex-col items-center text-center ${
              stageLayout ? "gap-1 p-2 pb-3" : "gap-1.5 p-3 pb-4 sm:p-4"
            }`}
          >
            {activeItem ? (
              <div
                className={`lesson-mirror-idle-world-art ${
                  reducedMotion ? "" : offSceneMotion
                }`}
                data-testid="lesson-mirror-preview-art"
                aria-hidden
              >
                <LetterArt id={activeItem.art} className="h-full w-full" />
              </div>
            ) : null}
            <div className="lesson-mirror-idle-controls">
              <div className="flex max-w-[92%] flex-col items-center gap-0.5">
                {scene?.place ? (
                  <p className="rounded-full bg-white/90 px-2.5 py-0.5 font-[family-name:var(--font-nunito)] text-[10px] font-bold uppercase tracking-wide text-[#7048D7] shadow-sm sm:text-[11px]">
                    {scene.place}
                  </p>
                ) : null}
                <p
                  className={`rounded-full bg-white/90 px-3 py-1 font-[family-name:var(--font-display)] font-bold leading-tight text-[#303047] shadow-sm ${
                    stageLayout ? "text-sm" : "text-sm sm:text-base"
                  }`}
                >
                  {inviteLine}
                </p>
              </div>
              {errorMessage ? (
                <p className="max-w-xs text-[10px] leading-snug text-[#b42318]" data-testid="lesson-mirror-error">
                  {errorMessage}
                </p>
              ) : null}
              {mirror !== "starting" ? (
                <button
                  type="button"
                  data-testid="lesson-mirror-start"
                  onClick={() => {
                    autoStartAttemptsRef.current = 0;
                    void startMirror();
                  }}
                  className={`pressable rounded-full bg-[#7048D7] font-[family-name:var(--font-display)] font-bold text-white shadow-md ${
                    stageLayout
                      ? "mt-0.5 min-h-8 px-3 text-xs"
                      : "mt-0.5 min-h-10 px-5 text-sm"
                  }`}
                >
                  Start Magic Mirror
                </button>
              ) : null}
              <p className="text-[10px] font-semibold text-[#5a5a78]/90">
                Stays on this device
              </p>
            </div>
          </div>
        ) : null}

        {mirror === "live" ? (
          <div className="lesson-mirror-live-bar pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-2 p-2.5 sm:p-3">
            <p
              className="pointer-events-none min-w-0 max-w-[70%] truncate rounded-full bg-white/95 px-2.5 py-1 font-[family-name:var(--font-display)] text-[11px] font-bold text-[#7048D7] shadow"
              data-testid="lesson-mirror-costume-name"
            >
              {experience.feelLine}
            </p>
            <button
              type="button"
              data-testid="lesson-mirror-stop"
              onClick={() => {
                setLessonMirrorPaused(true);
                tearDown();
              }}
              className="pressable pointer-events-auto min-h-8 shrink-0 rounded-full bg-white/95 px-3 font-[family-name:var(--font-display)] text-xs font-bold text-[#7048D7] shadow"
            >
              Stop
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
