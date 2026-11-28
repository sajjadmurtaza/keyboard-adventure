#!/usr/bin/env node
/**
 * Copy MediaPipe WASM from node_modules and ensure local models exist under
 * public/mediapipe (no runtime CDN).
 */
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
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
  writeFileSync(modelDest, Buffer.from(await res.arrayBuffer()));
  console.log("Saved", modelDest);
} else {
  console.log("Model already present:", modelDest);
}

async function ensureOptionalModel(dest, url, label) {
  if (existsSync(dest)) {
    console.log(`${label} present:`, dest);
    return;
  }
  console.log(`Downloading optional ${label} (one-time)…`);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`Skipped ${label}: download failed (${res.status}).`);
    return;
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("Saved", dest);
}

/** Optional Pose Landmarker (jacket shoulders). */
await ensureOptionalModel(
  join(root, "public/mediapipe/pose_landmarker_lite.task"),
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
  "Pose model",
);

/** Optional Image Segmenter (parent-authorized person cutout). */
await ensureOptionalModel(
  join(root, "public/mediapipe/selfie_segmenter.tflite"),
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
  "Selfie segmenter",
);
