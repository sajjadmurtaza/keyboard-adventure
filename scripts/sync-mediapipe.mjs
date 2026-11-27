#!/usr/bin/env node
/**
 * Copy MediaPipe WASM from node_modules and ensure the face landmarker model
 * exists under public/mediapipe (no runtime CDN).
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmSrc = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const wasmDest = join(root, "public/mediapipe/wasm");
const modelDest = join(root, "public/mediapipe/face_landmarker.task");
const modelUrl =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

if (!existsSync(wasmSrc)) {
  console.error("Missing @mediapipe/tasks-vision. Run npm install first.");
  process.exit(1);
}

mkdirSync(wasmDest, { recursive: true });
cpSync(wasmSrc, wasmDest, { recursive: true });
console.log("Copied MediaPipe WASM → public/mediapipe/wasm");

if (!existsSync(modelDest)) {
  console.log("Downloading face_landmarker.task (one-time)…");
  const res = await fetch(modelUrl);
  if (!res.ok) {
    console.error("Failed to download model:", res.status);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const { writeFileSync } = await import("node:fs");
  writeFileSync(modelDest, buf);
  console.log("Saved", modelDest);
} else {
  console.log("Model already present:", modelDest);
}
