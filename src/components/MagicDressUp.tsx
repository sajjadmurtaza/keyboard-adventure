"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DressUpPerfOverlay } from "@/components/DressUpPerfOverlay";
import { MagicMirrorChildChrome } from "@/components/MagicMirrorChildChrome";
import {
  DRESS_UP_COSTUMES,
  type DressUpCostume,
  type DressUpId,
} from "@/data/dressUpCostumes";
import {
  startCameraSession,
  stopCameraTracks,
} from "@/lib/dressUp/cameraSession";
import {
  getCachedCostumeImage,
  preloadCostumeImages,
} from "@/lib/dressUp/costumeImages";
import {
  DressUpPerfSession,
  isDressUpPerfEnabled,
  measureCostumeSwitchPaint,
  type DressUpPerfSnapshot,
} from "@/lib/dressUp/dressUpPerf";
import {
  getFaceLandmarker,
  isFaceLandmarkerWarm,
} from "@/lib/dressUp/faceLandmarker";
import {
  drawLiveMirrorFrame,
  MirrorFramingSmoother,
} from "@/lib/dressUp/liveMirrorFrame";
import { mirrorChildStatus } from "@/lib/dressUp/mirrorChildStatus";
import { FacePoseSmoother } from "@/lib/dressUp/smoothing";

const PERF_ENABLED = isDressUpPerfEnabled();

type MagicDressUpProps = {
  cameraAllowedByParent: boolean;
  voiceGuidance: boolean;
  soundOn: boolean;
  reducedMotion?: boolean;
  onSpeak: (line: string) => void;
  onBack: () => void;
  onOpenWardrobe: () => void;
  onOpenParentSettings: () => void;
};

type MirrorState = "idle" | "starting" | "live" | "error";

export function MagicDressUp({
  cameraAllowedByParent,
  voiceGuidance,
  soundOn,
  reducedMotion = false,
  onSpeak,
  onBack,
  onOpenWardrobe,
  onOpenParentSettings,
}: MagicDressUpProps) {
  const [selected, setSelected] = useState<DressUpId>("astronaut");
  const [mirror, setMirror] = useState<MirrorState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [faceMissing, setFaceMissing] = useState(false);
  const [loadHint, setLoadHint] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState(0);
  const [cheerLine, setCheerLine] = useState<string | null>(null);
  const [justStopped, setJustStopped] = useState(false);
  const [perfSnapshot, setPerfSnapshot] = useState<DressUpPerfSnapshot | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const selectedRef = useRef(selected);
  const parentAllowedRef = useRef(cameraAllowedByParent);
  const rafRef = useRef(0);
  const landmarkerRef = useRef<Awaited<ReturnType<typeof getFaceLandmarker>> | null>(null);
  const runningRef = useRef(false);
  const sessionGenRef = useRef(0);
  const smootherRef = useRef(new FacePoseSmoother(0.38));
  const framingRef = useRef(new MirrorFramingSmoother(0.16));
  const perfRef = useRef(PERF_ENABLED ? new DressUpPerfSession() : null);
  const lastPerfPublishRef = useRef(0);
  const cheerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const costume = DRESS_UP_COSTUMES.find((c) => c.id === selected)!;

  const childStatus = useMemo(
    () =>
      mirrorChildStatus({
        mirror,
        loadStep,
        faceMissing,
        cameraAllowedByParent,
        cheerLine,
        errorMessage,
        justStopped,
      }),
    [
      mirror,
      loadStep,
      faceMissing,
      cameraAllowedByParent,
      cheerLine,
      errorMessage,
      justStopped,
    ],
  );

  useEffect(() => {
    if (!PERF_ENABLED || !perfRef.current) return;
    const session = perfRef.current;
    const w = window as Window & { __magicMirrorPerf?: () => DressUpPerfSnapshot };
    w.__magicMirrorPerf = () => session.snapshot();
    return () => {
      if (w.__magicMirrorPerf) delete w.__magicMirrorPerf;
    };
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    parentAllowedRef.current = cameraAllowedByParent;
  }, [cameraAllowedByParent]);

  // Warm costume SVGs so first Start feels snappy
  useEffect(() => {
    void preloadCostumeImages().catch(() => undefined);
  }, []);

  /** Stop camera + loop. Keep Face Landmarker warm so Stop→Start does not reload ~13MB. */
  const tearDownMirror = useCallback(() => {
    sessionGenRef.current += 1;
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const stream = streamRef.current;
    const hadLiveTracks = Boolean(stream?.getTracks().length);
    const cleanupStart = PERF_ENABLED && hadLiveTracks ? performance.now() : 0;
    stopCameraTracks(stream);
    if (PERF_ENABLED && perfRef.current && hadLiveTracks && stream) {
      const alive = stream.getTracks().some((track) => track.readyState === "live");
      perfRef.current.noteCleanup(performance.now() - cleanupStart, alive);
      perfRef.current.log("[MagicMirrorPerf] stop");
      setPerfSnapshot(perfRef.current.snapshot());
    }
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
    smootherRef.current.reset();
    framingRef.current.reset();
    setMirror("idle");
    setFaceMissing(false);
    setLoadHint(null);
    setLoadStep(0);
    if (hadLiveTracks) {
      setJustStopped(true);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
      restTimerRef.current = setTimeout(() => setJustStopped(false), 2400);
    }
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
    tearDownMirror();
    setErrorMessage("Ask a grown-up to allow Magic Mirror in Parent settings.");
    setMirror("error");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [cameraAllowedByParent, mirror, tearDownMirror]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") tearDownMirror();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      tearDownMirror();
      releaseLandmarker();
      if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [tearDownMirror, releaseLandmarker]);

  useEffect(() => {
    if (mirror !== "live") return;

    const tick = () => {
      if (!runningRef.current) return;
      if (!parentAllowedRef.current) {
        tearDownMirror();
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !canvas || video.readyState < 2) {
        perfRef.current?.noteFrame({ detected: false });
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
      if (PERF_ENABLED && w && h) {
        perfRef.current?.noteVideoSize(w, h);
      }

      const costumeNow =
        DRESS_UP_COSTUMES.find((c) => c.id === selectedRef.current) ?? DRESS_UP_COSTUMES[0];
      const image = getCachedCostumeImage(costumeNow.id);

      const detectStart = PERF_ENABLED ? performance.now() : 0;
      const frame = drawLiveMirrorFrame({
        video,
        canvas,
        landmarker,
        smoother: smootherRef.current,
        framing: framingRef.current,
        costume: costumeNow,
        costumeImage: image,
      });
      const detectMs = PERF_ENABLED ? performance.now() - detectStart : undefined;
      perfRef.current?.noteFrame({ detected: frame.detected, detectMs });
      setFaceMissing((prev) => {
        const missing = !frame.detected;
        return prev === missing ? prev : missing;
      });

      if (PERF_ENABLED && perfRef.current) {
        const now = performance.now();
        if (now - lastPerfPublishRef.current >= 500) {
          lastPerfPublishRef.current = now;
          setPerfSnapshot(perfRef.current.snapshot());
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
  }, [mirror, tearDownMirror]);

  async function startMirror() {
    if (!cameraAllowedByParent) {
      setMirror("error");
      setErrorMessage("Ask a grown-up to allow Magic Mirror in Parent settings.");
      return;
    }

    tearDownMirror();
    const gen = sessionGenRef.current;
    const warmModel = isFaceLandmarkerWarm();
    if (PERF_ENABLED && perfRef.current) {
      perfRef.current.beginStart(warmModel ? "warm" : "cold");
      setPerfSnapshot(null);
    }
    setMirror("starting");
    setErrorMessage(null);
    setJustStopped(false);
    setCheerLine(null);
    setLoadStep(1);
    setLoadHint("🪄 Waking up your mirror…");

    const cameraStarted = performance.now();
    const session = await startCameraSession({ parentAllowed: true });
    if (gen !== sessionGenRef.current) {
      if (session.ok) stopCameraTracks(session.stream);
      return;
    }
    if (!session.ok) {
      setMirror("error");
      setErrorMessage(session.message);
      setLoadHint(null);
      setLoadStep(0);
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
      setLoadHint(null);
      setLoadStep(0);
      return;
    }
    if (gen !== sessionGenRef.current) {
      stopCameraTracks(session.stream);
      return;
    }
    perfRef.current?.noteCamera(performance.now() - cameraStarted);

    setLoadStep(2);
    setLoadHint("✨ Getting the magic ready…");
    try {
      await preloadCostumeImages();
    } catch {
      /* canvas can still show camera */
    }
    if (gen !== sessionGenRef.current) return;

    setLoadStep(3);
    setLoadHint("✨ Getting the magic ready…");
    const modelStarted = performance.now();
    try {
      landmarkerRef.current = await getFaceLandmarker();
      perfRef.current?.noteModel(
        performance.now() - modelStarted,
        landmarkerRef.current.delegate,
      );
    } catch {
      landmarkerRef.current = null;
      perfRef.current?.noteModel(performance.now() - modelStarted, "none");
      setErrorMessage("Face magic could not load — camera still works. Try costumes!");
    }
    if (gen !== sessionGenRef.current) return;

    smootherRef.current.reset();
    framingRef.current.reset();
    perfRef.current?.noteLive();
    if (PERF_ENABLED && perfRef.current) {
      setPerfSnapshot(perfRef.current.snapshot());
      perfRef.current.log("[MagicMirrorPerf] live");
    }
    setMirror("live");
    setLoadHint(null);
    setLoadStep(0);
  }

  function selectCostume(next: DressUpCostume) {
    setSelected(next.id);
    if (PERF_ENABLED && perfRef.current) {
      measureCostumeSwitchPaint(perfRef.current, setPerfSnapshot);
    }
    const cheer = `🎉 ${next.voiceLine}`;
    setCheerLine(cheer);
    if (cheerTimerRef.current) clearTimeout(cheerTimerRef.current);
    cheerTimerRef.current = setTimeout(
      () => setCheerLine(null),
      reducedMotion ? 900 : 2200,
    );
    if (soundOn && voiceGuidance) {
      onSpeak(next.voiceLine);
    }
  }

  const showFaceGuide = mirror === "live" && faceMissing && !cheerLine;
  const showChildChrome = mirror === "live" || mirror === "starting" || justStopped;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-2 py-2 text-center sm:gap-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#7657E8] sm:text-5xl">
        ✨ Magic Mirror
      </h1>
      {mirror === "idle" || mirror === "error" ? (
        <p
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#34364A] sm:text-xl"
          data-testid="dress-up-child-status-ready"
        >
          {childStatus.line}
        </p>
      ) : null}

      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-[#1a1a2e] mirror-frame">
        {/* Dev-only diagnostics — live mirror only; never in production builds */}
        {PERF_ENABLED && mirror === "live" && perfSnapshot ? (
          <DressUpPerfOverlay snapshot={perfSnapshot} />
        ) : null}
        <video
          ref={videoRef}
          className="pointer-events-none absolute h-px w-px opacity-0"
          playsInline
          muted
          aria-hidden
        />
        <canvas
          ref={canvasRef}
          data-testid="dress-up-mirror"
          className={`mx-auto aspect-[3/4] w-full max-h-[min(42dvh,460px)] object-cover sm:max-h-[min(56dvh,480px)] ${
            mirror === "live" ? "block" : "hidden"
          }`}
        />
        {mirror !== "live" ? (
          <div
            className="flex aspect-[3/4] w-full max-h-[min(42dvh,460px)] flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#7657E8] to-[#9B7BFF] p-6 text-white sm:max-h-[min(56dvh,480px)]"
            data-testid="dress-up-loading"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={costume.assetPath}
              alt=""
              width={140}
              height={140}
              className={`h-36 w-36 object-contain drop-shadow-lg ${
                mirror === "starting" && !reducedMotion ? "animate-pulse" : ""
              }`}
              draggable={false}
            />
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold">
              {costume.name}
            </p>
            {mirror === "starting" || loadHint ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg" data-testid="dress-up-load-hint">
                  {loadHint ?? childStatus.line}
                </p>
                <div className="flex gap-2" aria-hidden>
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`h-3 w-3 rounded-full ${
                        loadStep >= step ? "bg-[#FFD85A]" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {mirror === "error" && errorMessage ? (
              <p className="max-w-xs text-base" data-testid="dress-up-error">
                {errorMessage}
              </p>
            ) : null}
            {mirror === "idle" && justStopped ? (
              <p className="text-lg" data-testid="dress-up-resting">
                💤 Mirror is resting
              </p>
            ) : null}
          </div>
        ) : null}
        {showChildChrome ? (
          <MagicMirrorChildChrome
            status={childStatus}
            showFaceGuide={showFaceGuide}
            reducedMotion={reducedMotion}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {mirror === "live" ? (
          <button
            type="button"
            data-testid="stop-magic-mirror"
            onClick={tearDownMirror}
            className="pressable min-h-14 rounded-full bg-white px-8 font-[family-name:var(--font-display)] text-xl font-bold text-[#7657E8] shadow-md"
          >
            Stop Mirror
          </button>
        ) : (
          <button
            type="button"
            data-testid="start-magic-mirror"
            onClick={() => void startMirror()}
            disabled={mirror === "starting"}
            className="pressable min-h-16 rounded-full bg-[#7657E8] px-10 font-[family-name:var(--font-display)] text-2xl font-bold text-white shadow-lg disabled:opacity-60"
          >
            ✨ Start Magic Mirror
          </button>
        )}
      </div>

      <p className="max-w-md text-sm font-semibold text-[#5A5C72]" data-testid="dress-up-privacy">
        🔒 Your camera stays on your device.
      </p>

      {!cameraAllowedByParent ? (
        <p className="max-w-md text-base text-[#5A5C72]" data-testid="dress-up-parent-hint">
          Grown-ups: turn on <strong>Allow Magic Mirror camera</strong> in settings, then tap Start.
          {" "}
          <button
            type="button"
            className="font-semibold text-[#7657E8] underline"
            onClick={onOpenParentSettings}
          >
            Open settings
          </button>
        </p>
      ) : null}

      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#34364A] sm:text-2xl">
        Who will you be today?
      </h2>

      <ul className="grid w-full grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3" aria-label="Costumes">
        {DRESS_UP_COSTUMES.map((item) => {
          const on = item.id === selected;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-testid={`dress-up-${item.id}`}
                aria-pressed={on}
                aria-label={item.name}
                onClick={() => selectCostume(item)}
                className={`pressable flex min-h-20 w-full flex-col items-center justify-center gap-0.5 rounded-3xl px-1 py-2 shadow-md ring-offset-2 sm:min-h-28 sm:gap-1 sm:py-3 ${
                  on
                    ? "bg-[#FFD85A] text-[#34364A] ring-4 ring-[#7657E8]"
                    : "bg-white text-[#34364A]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.assetPath}
                  alt=""
                  width={64}
                  height={64}
                  className="h-10 w-10 object-contain sm:h-14 sm:w-14"
                  draggable={false}
                />
                <span className="font-[family-name:var(--font-display)] text-xs font-bold leading-tight sm:text-sm">
                  {item.emoji} {item.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap justify-center gap-3 pb-4">
        <button
          type="button"
          onClick={onOpenWardrobe}
          className="pressable min-h-12 rounded-full bg-white px-6 font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8] shadow-md"
        >
          🎁 Treasure Hats
        </button>
        <button
          type="button"
          onClick={() => {
            tearDownMirror();
            onBack();
          }}
          className="pressable min-h-12 rounded-full bg-white px-6 font-[family-name:var(--font-display)] text-lg font-bold text-[#9AA0B8] shadow-md"
        >
          Back
        </button>
      </div>
    </div>
  );
}
