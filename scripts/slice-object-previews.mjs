import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

async function sliceGrid({
  file,
  outDir,
  cols,
  rows,
  top,
  bottom,
  left,
  right,
  names,
  prefix,
  inset = 0,
}) {
  const meta = await sharp(file).metadata();
  const W = meta.width;
  const H = meta.height;
  const usableW = W - left - right;
  const usableH = H - top - bottom;
  const cw = usableW / cols;
  const ch = usableH / rows;
  console.log(prefix, { W, H, cw: +cw.toFixed(1), ch: +ch.toFixed(1), count: names.length });
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < names.length; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    let leftPx = Math.round(left + c * cw + inset);
    let topPx = Math.round(top + r * ch + inset);
    let width = Math.round(cw - inset * 2);
    let height = Math.round(ch - inset * 2);
    leftPx = Math.max(0, leftPx);
    topPx = Math.max(0, topPx);
    width = Math.min(width, W - leftPx);
    height = Math.min(height, H - topPx);
    const name = names[i];
    const out = path.join(outDir, `${name}.png`);
    await sharp(file)
      .extract({ left: leftPx, top: topPx, width, height })
      .png()
      .toFile(out);
  }
}

const wearables = [
  "ant",
  "bear",
  "cat",
  "dog",
  "duck",
  "elephant",
  "fish",
  "flower",
  "frog",
  "goat",
  "hat",
  "horse",
  "insect",
  "juice",
  "king",
  "kite",
  "lion",
  "milk",
  "mouse",
  "octopus",
  "owl",
  "panda",
  "pig",
  "queen",
  "robot",
  "snake",
  "star",
  "sun",
  "umbrella",
  "unicorn",
  "zebra",
  "drum",
];

/** Object sheet order from contact sheet (row-major). */
const objects = [
  "apple",
  "ant",
  "airplane",
  "ball",
  "bear",
  "bus",
  "cat",
  "cake",
  "car",
  "dog",
  "drum",
  "duck",
  "egg",
  "elephant",
  "envelope",
  "fish",
  "frog",
  "flower",
  "goat",
  "grapes",
  "guitar",
  "hat",
  "horse",
  "house",
  "ice-cream",
  "igloo",
  "insect",
  "juice",
  "jelly",
  "jacket",
  "king",
  "kite",
  "key",
  "lion",
  "leaf",
  "lamp",
  "mouse",
  "moon",
  "milk",
  "nose",
  "nest",
  "nut",
  "owl",
  "orange",
  "octopus",
  "pencil",
  "panda",
  "pig",
  "queen",
  "quilt",
  "question",
  "rainbow",
  "rocket",
  "robot",
  "sun",
  "star",
  "snake",
  "tree",
  "train",
  "turtle",
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
  "space-cloud",
  "gap",
  "stop-sign",
  "pause",
  "wink",
  "breath",
  "list",
  "curve",
  "dot",
  "bullseye",
  "path",
  "slide",
  "divide",
];

async function main() {
  await sliceGrid({
    file: "/Users/sajjad/Downloads/keyboard-adventure-wearables-preview.png",
    outDir: "tmp/slice-preview/wearables",
    cols: 8,
    rows: 4,
    top: 78,
    bottom: 18,
    left: 24,
    right: 24,
    names: wearables,
    prefix: "wearables",
    inset: 6,
  });

  // Objects: 9 cols × ~11 rows (93 items → last row partial)
  await sliceGrid({
    file: "/Users/sajjad/Downloads/keyboard-adventure-objects-preview.png",
    outDir: "tmp/slice-preview/objects",
    cols: 9,
    rows: 11,
    top: 92,
    bottom: 24,
    left: 28,
    right: 28,
    names: objects,
    prefix: "objects",
    inset: 8,
  });

  for (const n of ["sun", "juice", "fish", "frog", "drum", "cat", "dog"]) {
    fs.copyFileSync(
      `tmp/slice-preview/wearables/${n}.png`,
      `tmp/slice-preview/check-wear-${n}.png`,
    );
  }
  for (const n of ["apple", "juice", "jacket", "sun", "fish", "frog"]) {
    fs.copyFileSync(
      `tmp/slice-preview/objects/${n}.png`,
      `tmp/slice-preview/check-obj-${n}.png`,
    );
  }
  console.log("preview slices ready");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
