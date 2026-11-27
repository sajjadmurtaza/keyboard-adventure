"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { associationsFor } from "@/data/letterAssociations";
import { lessonMirrorCostumeForArt } from "@/data/lessonMirrorCostumes";
import {
  startCameraSession,
  stopCameraTracks,
} from "@/lib/dressUp/cameraSession";
import {
  getCachedLessonMirrorImage,
  preloadLessonMirrorImages,
} from "@/lib/dressUp/lessonMirrorImages";
import { drawCostumeOverlay } from "@/lib/dressUp/faceOverlay";
import { getFaceLandmarker } from "@/lib/dressUp/faceLandmarker";
import { facePoseFromLandmarks, mirrorFacePose } from "@/lib/dressUp/facePose";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";
import { useAudio } from "@/hooks/useAudio";

type MirrorMood = "idle" | "success" | "retry";

type LessonLearningMirrorProps = {
  /** Current lesson target letter (e.g. f / j). */
  letter: string;
  cameraAllowedByParent: boolean;
  mood: MirrorMood;
  reducedMotion?: boolean;
  onOpenParentSettings: () => void;
};

type MirrorState = "off" | "starting" | "live" | "error";

const EMPTY_STEP = { key: "", index: 0 };

/**
 * Optional in-lesson Magic Mirror — costume auto-follows the active
 * letter association (Fish/Frog/Flower…); no manual picker while typing.
 */
export function LessonLearningMirror({
  letter,
  cameraAllowedByParent,
  mood,
  reducedMotion = false,
  onOpenParentSettings,
}: LessonLearningMirrorProps) {
  const [mirror, setMirror] = useState<MirrorState>("off");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const parentAllowedRef = useRef(cameraAllowedByParent);
  const smootherRef = useRef(new FacePoseSmoother(0.38));
  const moodRef = useRef(mood);

  useEffect(() => {
    costumeRef.current = costume;
  }, [costume]);

  useEffect(() => {
    parentAllowedRef.current = cameraAllowedByParent;
  }, [cameraAllowedByParent]);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

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
    setMirror("off");
    setErrorMessage(null);
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
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          /* ignore */
        }
        landmarkerRef.current = null;
      }
    };
  }, [tearDown]);

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
      const landmarker = landmarkerRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const costumeNow = costumeRef.current;
      const image = costumeNow
        ? getCachedLessonMirrorImage(costumeNow.art)
        : null;

      if (landmarker && costumeNow) {
        try {
          const result = landmarker.detectForVideo(video, performance.now());
          const landmarks = result.faceLandmarks[0];
          if (landmarks) {
            const raw = facePoseFromLandmarks(landmarks, canvas.width, canvas.height);
            const smoothed = smootherRef.current.next(raw);
            if (smoothed) {
              drawCostumeOverlay(
                ctx,
                mirrorFacePose(smoothed, canvas.width),
                costumeNow,
                image,
              );
            }
          } else {
            smootherRef.current.reset();
          }
        } catch {
          smootherRef.current.reset();
        }
      }

      const flash = moodRef.current;
      if (flash === "success") {
        ctx.fillStyle = "rgba(255, 216, 90, 0.18)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!reducedMotion) {
          ctx.fillStyle = "rgba(255, 216, 90, 0.9)";
          for (let i = 0; i < 6; i += 1) {
            const x = (canvas.width * (i + 1)) / 7;
            const y = canvas.height * 0.12 + (i % 2) * 18;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (flash === "retry") {
        ctx.fillStyle = "rgba(118, 87, 232, 0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!reducedMotion) {
          ctx.font = "28px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillText("?", canvas.width * 0.72, canvas.height * 0.22);
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
  }, [mirror, tearDown, reducedMotion]);

  async function startMirror() {
    if (!cameraAllowedByParent) {
      setMirror("error");
      setErrorMessage("Ask a grown-up to allow Magic Mirror in Parent settings.");
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

  if (!cameraAllowedByParent) {
    return (
      <div
        className="flex w-full max-w-[11rem] flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#D8E7FF] bg-white/80 p-2 text-center"
        data-testid="lesson-mirror-gated"
      >
        <p className="font-[family-name:var(--font-display)] text-xs font-bold text-[#5A5C72]">
          Learning Mirror
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-[#7657E8] underline"
          onClick={onOpenParentSettings}
        >
          Grown-ups: allow camera
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex w-full max-w-[12rem] flex-col items-center gap-1.5"
      data-testid="lesson-learning-mirror"
      data-mirror-art={costume?.art ?? ""}
    >
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#1a1a2e] shadow-md ${
          mood === "success" && !reducedMotion ? "lesson-mirror-win" : ""
        } ${mood === "retry" && !reducedMotion ? "lesson-mirror-miss" : ""}`}
      >
        <video
          ref={videoRef}
          className="pointer-events-none absolute h-px w-px opacity-0"
          playsInline
          muted
          aria-hidden
        />
        <canvas
          ref={canvasRef}
          data-testid="lesson-mirror-canvas"
          className={`h-full w-full object-cover ${mirror === "live" ? "block" : "hidden"}`}
        />
        {mirror !== "live" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#7657E8] to-[#9B7BFF] p-3 text-center text-white">
            <p className="font-[family-name:var(--font-display)] text-sm font-bold">
              {mirror === "starting" ? "Waking mirror…" : "See yourself!"}
            </p>
            {costume ? (
              <p className="text-[10px] font-semibold opacity-90">
                Become a {costume.name}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="text-[10px] leading-snug" data-testid="lesson-mirror-error">
                {errorMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {mirror === "live" ? (
        <>
          <p
            className="font-[family-name:var(--font-display)] text-xs font-bold text-[#7657E8]"
            data-testid="lesson-mirror-costume-name"
          >
            {costume ? `You are a ${costume.name}!` : "Looking magical!"}
          </p>
          <button
            type="button"
            data-testid="lesson-mirror-stop"
            onClick={tearDown}
            className="pressable min-h-9 rounded-full bg-white px-3 font-[family-name:var(--font-display)] text-xs font-bold text-[#7657E8] shadow"
          >
            Stop camera
          </button>
        </>
      ) : (
        <button
          type="button"
          data-testid="lesson-mirror-start"
          onClick={() => void startMirror()}
          disabled={mirror === "starting"}
          className="pressable min-h-9 rounded-full bg-[#7657E8] px-3 font-[family-name:var(--font-display)] text-xs font-bold text-white shadow disabled:opacity-60"
        >
          ✨ Start camera
        </button>
      )}

      <p className="text-[10px] font-semibold text-[#5A5C72]">
        🔒 Stays on this device
      </p>
    </div>
  );
}
