#!/usr/bin/env node
/**
 * Capture camera-off previews for every association via /dev/magic-worlds.
 * Usage: node scripts/capture-magic-world-contact-sheet.mjs
 * Requires: npm run dev on localhost:3020
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.KA_BASE ?? "http://localhost:3020";
const outDir = join(process.cwd(), "tmp/magic-worlds/camera-off");
mkdirSync(outDir, { recursive: true });

const assocSrc = readFileSync("src/data/letterAssociations.ts", "utf8");
const arts = [
  ...new Set([...assocSrc.matchAll(/art:\s*"([^"]+)"/g)].map((m) => m[1])),
].sort();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];

for (let i = 0; i < arts.length; i += 1) {
  const art = arts[i];
  const url = `${BASE}/dev/magic-worlds?art=${encodeURIComponent(art)}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByTestId("magic-world-preview").waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const meta = await page.evaluate(() => {
    const root = document.querySelector("[data-testid=magic-world-preview]");
    return {
      art: root?.getAttribute("data-preview-art"),
      place: document.querySelector("[data-testid=preview-learning-panel] p")?.textContent,
      canvas: (() => {
        const c = document.querySelector("[data-testid=lesson-mirror-canvas]");
        return c ? { w: c.width, h: c.height } : null;
      })(),
      rich: !!document.querySelector("[data-testid=letter-art-rich]"),
      start: !!document.querySelector("[data-testid=lesson-mirror-start]"),
    };
  });
  const file = join(outDir, `${String(i + 1).padStart(3, "0")}-${art}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const ok = Boolean(
    meta.canvas &&
      meta.canvas.w > 100 &&
      meta.canvas.h > 100 &&
      meta.start &&
      meta.rich,
  );
  results.push({ art, file, ok, meta });
  console.log(`${ok ? "OK" : "BAD"} ${i + 1}/${arts.length} ${art}`);
}

await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(
  join(outDir, "../camera-off-report.json"),
  JSON.stringify(
    {
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.map((f) => f.art),
      results,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.map((f) => f.art),
    },
    null,
    2,
  ),
);
if (failed.length) process.exit(1);
