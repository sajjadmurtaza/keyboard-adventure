#!/usr/bin/env node
/**
 * Prints measured Magic World coverage from the catalog (no subjective %).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogSrc = readFileSync(
  join(root, "src/data/magicWorldCatalog.ts"),
  "utf8",
);
const assocSrc = readFileSync(
  join(root, "src/data/letterAssociations.ts"),
  "utf8",
);

const arts = [...new Set([...assocSrc.matchAll(/art:\s*"([^"]+)"/g)].map((m) => m[1]))];
const draftArts = [...catalogSrc.matchAll(/^\s{2}(?:"([^"]+)"|([a-z][a-z0-9-]*)):\s*world\(/gm)].map(
  (m) => m[1] || m[2],
);

const missing = arts.filter((a) => !draftArts.includes(a));
const extra = draftArts.filter((a) => !arts.includes(a));

const wearable = [...catalogSrc.matchAll(/world\([\s\S]*?"wearable"/g)].length;
const scene = draftArts.length - wearable;

const report = {
  associationArts: arts.length,
  catalogEntries: draftArts.length,
  missingFromCatalog: missing,
  extraInCatalog: extra,
  configuredScenes: scene,
  configuredWearables: wearable,
  namedScenesTarget: "93/93 when missingFromCatalog is empty",
  generatedAt: new Date().toISOString(),
};

const outDir = join(root, "tmp/magic-worlds");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "coverage.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (missing.length) {
  console.error("FAIL: catalog missing arts", missing);
  process.exit(1);
}
