#!/usr/bin/env node
/**
 * Slice AR accessories + object icons from the Keyboard Adventure preview sheets.
 * Inputs (Downloads by default):
 *   keyboard-adventure-wearables-preview.png  (8×4, 32 face accessories)
 *   keyboard-adventure-objects-preview.png    (9×N, 93 object icons)
 *
 * Outputs:
 *   public/lesson-mirror/wearables/*.png  (bg cleared + face hole punched)
 *   public/lesson-mirror/objects/*.png    (bg/label/badge cleared, trimmed)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOWNLOADS = path.join(process.env.HOME || "", "Downloads");

const wearFile =
  process.env.WEARABLES_SHEET ||
  path.join(DOWNLOADS, "keyboard-adventure-wearables-preview.png");
const objFile =
  process.env.OBJECTS_SHEET ||
  path.join(DOWNLOADS, "keyboard-adventure-objects-preview.png");

const wearNames = [
  "ant",
  "bear",
  "cat",
  "dog",
  "duck",
  "drum",
  "elephant",
  "fish",
  "frog",
  "flower",
  "goat",
  "hat",
  "horse",
  "insect",
  "juice",
  "kite",
  "king",
  "lion",
  "mouse",
  "milk",
  "owl",
  "octopus",
  "panda",
  "pig",
  "queen",
  "robot",
  "sun",
  "star",
  "snake",
  "umbrella",
  "unicorn",
  "zebra",
];

/** OCR-verified object order from the 93-tile sheet. */
const objNames = [
  "apple",
  "ant",
  "airplane",
  "ball",
  "bear",
  "bus",
  "cat",
  "car",
  "cake",
  "dog",
  "duck",
  "drum",
  "egg",
  "elephant",
  "envelope",
  "fish",
  "frog",
  "flower",
  "grapes",
  "goat",
  "guitar",
  "hat",
  "house",
  "horse",
  "ice-cream",
  "igloo",
  "insect",
  "juice",
  "jelly",
  "jacket",
  "kite",
  "key",
  "king",
  "lion",
  "leaf",
  "lamp",
  "moon",
  "mouse",
  "milk",
  "nest",
  "nose",
  "nut",
  "orange",
  "owl",
  "octopus",
  "panda",
  "pig",
  "pencil",
  "queen",
  "quilt",
  "question",
  "rainbow",
  "rocket",
  "robot",
  "sun",
  "star",
  "snake",
  "turtle",
  "tree",
  "train",
  "umbrella",
  "unicorn",
  "ukulele",
  "van",
  "violin",
  "volcano",
  "whale",
  "watch",
  "wagon",
  "xylophone",
  "x-ray",
  "x-marks",
  "yo-yo",
  "yarn",
  "yacht",
  "zebra",
  "zoo",
  "zipper",
  "jump",
  "cloud",
  "gap",
  "stop",
  "pause",
  "wink",
  "breath",
  "list",
  "curve",
  "dot",
  "target",
  "stop-alt",
  "path",
  "slide",
  "divide",
];

const wearOut = path.join(ROOT, "public/lesson-mirror/wearables");
const objOut = path.join(ROOT, "public/lesson-mirror/objects");

const wearX = [35, 215, 395, 575, 755, 935, 1115, 1295];
const wearY = [95, 291, 487, 683];
const CELL = 158;

function isPageBlue(r, g, b, a) {
  if (a < 8) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum > 220 && b >= r - 5 && max - min < 40) return true;
  if (lum > 235 && max - min < 25) return true;
  return false;
}

function isSkinLike(r, g, b) {
  if (r > 140 && g > 90 && b > 60 && r > g && g >= b - 10 && r - b > 25 && r < 230)
    return true;
  if (r < 90 && g < 70 && b < 60 && Math.abs(r - g) < 25) return true;
  if (r > 200 && g > 140 && b > 150 && r > g && Math.abs(g - b) < 40) return true;
  if (r > 150 && g > 150 && b > 190 && b > r && b > g && b - r > 15 && r > 140)
    return true;
  return false;
}

async function processWearable(i, name) {
  const c = i % 8;
  const r = Math.floor(i / 8);
  const { data, info } = await sharp(wearFile)
    .extract({ left: wearX[c], top: wearY[r], width: CELL, height: CELL })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const cx = w / 2;
  const cy = h / 2 - 4;
  const faceR = 36;
  const soft = 4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const pr = data[idx];
      const pg = data[idx + 1];
      const pb = data[idx + 2];
      const pa = data[idx + 3];
      if (isPageBlue(pr, pg, pb, pa)) {
        data[idx + 3] = 0;
        continue;
      }
      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= faceR) {
        data[idx + 3] = 0;
        continue;
      }
      if (dist <= faceR + soft) {
        data[idx + 3] = Math.round(pa * ((dist - faceR) / soft));
        continue;
      }
      if (dist < faceR + 14 && isSkinLike(pr, pg, pb)) data[idx + 3] = 0;
    }
  }
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width: 316, height: 316, fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(wearOut, `${name}.png`), buf);
}

function isObjBg(r, g, b, a) {
  if (a < 8) return true;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (lum > 242 && max - min < 28) return true;
  if (lum > 230 && b >= g - 2 && max - min < 22) return true;
  return false;
}

const objX = [37, 197, 357, 517, 677, 837, 997, 1157, 1317];
const objRows = [
  { top: 115, bottom: 250 },
  { top: 281, bottom: 415 },
  { top: 441, bottom: 575 },
  { top: 598, bottom: 745 },
  { top: 766, bottom: 910 },
  { top: 930, bottom: 1075 },
  { top: 1092, bottom: 1240 },
  { top: 1257, bottom: 1405 },
  { top: 1424, bottom: 1570 },
  { top: 1589, bottom: 1735 },
  { top: 1757, bottom: 1885 },
];

async function extractObjectTiles() {
  const tiles = [];
  for (let r = 0; r < objRows.length; r++) {
    for (let c = 0; c < 9; c++) {
      const left = objX[c];
      const top = objRows[r].top;
      const width = 112;
      const height = objRows[r].bottom - objRows[r].top;
      const buf = await sharp(objFile)
        .extract({ left, top, width, height })
        .raw()
        .ensureAlpha()
        .toBuffer();
      let ink = 0;
      for (let p = 0; p < buf.length; p += 4) {
        if (buf[p] < 230 || buf[p + 1] < 230 || buf[p + 2] < 235) ink++;
      }
      if (ink < width * height * 0.02) continue;
      tiles.push(
        await sharp(objFile)
          .extract({ left, top, width, height })
          .ensureAlpha()
          .png()
          .toBuffer(),
      );
    }
  }
  return tiles;
}

async function processObject(buf, name) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const labelY = Math.floor(h * 0.82);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (y >= labelY || (x < 28 && y < 28)) {
        data[idx + 3] = 0;
        continue;
      }
      if (isObjBg(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
        data[idx + 3] = 0;
      }
    }
  }
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return;
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const cropped = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const si = ((minY + y) * w + (minX + x)) * 4;
      const di = (y * tw + x) * 4;
      cropped[di] = data[si];
      cropped[di + 1] = data[si + 1];
      cropped[di + 2] = data[si + 2];
      cropped[di + 3] = data[si + 3];
    }
  }
  const scale = Math.max(3, Math.ceil(256 / Math.max(tw, th)));
  const out = await sharp(cropped, { raw: { width: tw, height: th, channels: 4 } })
    .resize({
      width: tw * scale,
      height: th * scale,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(objOut, `${name}.png`), out);
}

async function main() {
  if (!fs.existsSync(wearFile)) throw new Error(`Missing wearables sheet: ${wearFile}`);
  if (!fs.existsSync(objFile)) throw new Error(`Missing objects sheet: ${objFile}`);
  fs.mkdirSync(wearOut, { recursive: true });
  fs.mkdirSync(objOut, { recursive: true });
  for (let i = 0; i < wearNames.length; i++) {
    await processWearable(i, wearNames[i]);
    console.log("wear", wearNames[i]);
  }
  const tiles = await extractObjectTiles();
  if (tiles.length !== objNames.length) {
    throw new Error(`Expected ${objNames.length} object tiles, got ${tiles.length}`);
  }
  for (let i = 0; i < tiles.length; i++) {
    await processObject(tiles[i], objNames[i]);
    console.log("obj", objNames[i]);
  }
  console.log("done", { wearables: wearNames.length, objects: objNames.length });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
