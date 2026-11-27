/**
 * Local-only Magic Mirror baseline measurement (synthetic camera).
 * Does not upload frames or send telemetry.
 *
 * Usage:
 *   PORT=3020 node scripts/measure-mirror-perf.mjs
 *   PORT=3020 BROWSER=webkit node scripts/measure-mirror-perf.mjs
 */
import { chromium, webkit } from "@playwright/test";

const port = process.env.PORT ?? "3020";
// Prefer localhost — Next HMR/WebSocket is flaky against 127.0.0.1 in some setups.
const base = `http://localhost:${port}`;
const engine = (process.env.BROWSER ?? "chromium").toLowerCase();

async function seed(page) {
  await page.addInitScript(() => {
    const key = "keyboard-adventure-settings-v1";
    const previous = JSON.parse(window.localStorage.getItem(key) || "{}");
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...previous,
        childName: "Ada",
        sound: false,
        voiceGuidance: false,
        cameraDressUp: true,
      }),
    );
  });
}

async function waitPerf(page, predicate, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const snap = await page.evaluate(() => window.__magicMirrorPerf?.() ?? null);
    if (snap && predicate(snap)) return snap;
    await page.waitForTimeout(250);
  }
  return page.evaluate(() => window.__magicMirrorPerf?.() ?? null);
}

async function run() {
  const launcher = engine === "webkit" ? webkit : chromium;
  const browser = await launcher.launch({
    headless: true,
    args:
      engine === "chromium"
        ? ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"]
        : [],
  });
  const context = await browser.newContext({
    permissions: engine === "chromium" ? ["camera"] : [],
  });
  const page = await context.newPage();
  const consoleLines = [];
  const network = [];
  page.on("console", (msg) => {
    consoleLines.push({ type: msg.type(), text: msg.text().slice(0, 240) });
  });
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/mediapipe/") || url.includes("/dress-up/") || url.includes("tasks-vision")) {
      network.push({ method: req.method(), url: url.replace(base, "") });
    }
  });
  page.on("pageerror", (err) => {
    consoleLines.push({ type: "pageerror", text: String(err).slice(0, 240) });
  });

  await seed(page);
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.getByTestId("open-dress-up").click();
  await page.getByTestId("start-magic-mirror").click();

  const cold = await waitPerf(
    page,
    (s) => s.totalStartMs != null && s.framesDrawn > 30 && s.detectSamples >= 10,
  );
  await page.waitForTimeout(1500);
  const coldSettled = (await page.evaluate(() => window.__magicMirrorPerf?.() ?? null)) ?? cold;

  await page.getByTestId("dress-up-lion").click();
  await page.waitForTimeout(400);
  const afterSwitch =
    (await page.evaluate(() => window.__magicMirrorPerf?.() ?? null)) ?? coldSettled;

  await page.getByTestId("stop-magic-mirror").click();
  await page.waitForTimeout(300);
  const afterStop =
    (await page.evaluate(() => window.__magicMirrorPerf?.() ?? null)) ?? afterSwitch;

  await page.getByTestId("start-magic-mirror").click();
  const warm = await waitPerf(
    page,
    (s) => s.startKind === "warm" && s.totalStartMs != null && s.framesDrawn > 20,
  );
  await page.waitForTimeout(1200);
  const warmSettled = (await page.evaluate(() => window.__magicMirrorPerf?.() ?? null)) ?? warm;

  await page.getByTestId("stop-magic-mirror").click();
  await page.waitForTimeout(200);

  const memory = await page.evaluate(() => {
    const mem = performance.memory;
    if (!mem) return null;
    return {
      usedJSHeapMB: Math.round((mem.usedJSHeapSize / 1048576) * 10) / 10,
      totalJSHeapMB: Math.round((mem.totalJSHeapSize / 1048576) * 10) / 10,
    };
  });

  const errors = consoleLines.filter(
    (l) =>
      l.type === "error" ||
      l.type === "pageerror" ||
      (l.type === "warning" && /overflow|failed/i.test(l.text)),
  );

  const report = {
    kind: "simulated",
    engine,
    base,
    note: "Synthetic/fake camera feed via Playwright — not a physical child device.",
    cold: summarize(coldSettled),
    warm: summarize(warmSettled),
    costumeSwitchMs: afterSwitch?.costumeSwitchMs ?? null,
    cleanup: {
      cleanupMs: afterStop?.cleanupMs ?? null,
      tracksAliveAfterStop: afterStop?.tracksAliveAfterStop ?? null,
    },
    memory,
    networkSample: network.slice(0, 40),
    consoleErrors: errors.slice(0, 20),
  };

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

function summarize(snap) {
  if (!snap) return null;
  return {
    startKind: snap.startKind,
    totalStartMs: round(snap.totalStartMs),
    cameraMs: round(snap.cameraMs),
    modelMs: round(snap.modelMs),
    fps: snap.fps == null ? null : Math.round(snap.fps),
    detectAvgMs: round(snap.detectAvgMs),
    detectP95Ms: round(snap.detectP95Ms),
    detectSamples: snap.detectSamples,
    delegate: snap.delegate,
    video: snap.videoWidth && snap.videoHeight ? `${snap.videoWidth}x${snap.videoHeight}` : null,
    framesDrawn: snap.framesDrawn,
    framesWithoutDetect: snap.framesWithoutDetect,
  };
}

function round(n) {
  if (n == null || !Number.isFinite(n)) return null;
  return Math.round(n);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
