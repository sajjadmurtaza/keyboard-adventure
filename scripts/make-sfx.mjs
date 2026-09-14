import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public/audio/effects");
mkdirSync(dir, { recursive: true });

const RATE = 44100;

function clamp(value) {
  return Math.max(-1, Math.min(1, value));
}

function tone(freq, seconds, volume, type = "sine") {
  const n = Math.floor(RATE * seconds);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / RATE;
    const env = Math.min(1, i / 80) * Math.pow(1 - i / n, 1.4);
    const phase = 2 * Math.PI * freq * t;
    const wave =
      type === "triangle"
        ? 2 * Math.abs(2 * ((t * freq) % 1) - 1) - 1
        : type === "square"
          ? Math.sign(Math.sin(phase))
          : Math.sin(phase);
    samples[i] = wave * volume * env;
  }
  return samples;
}

function mix(...parts) {
  const length = Math.max(...parts.map((part) => part.length));
  const out = new Float32Array(length);
  for (const part of parts) {
    for (let i = 0; i < part.length; i += 1) out[i] += part[i];
  }
  return out;
}

function delay(samples, ms) {
  const offset = Math.floor((ms / 1000) * RATE);
  const out = new Float32Array(samples.length + offset);
  out.set(samples, offset);
  return out;
}

function toWav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(Math.round(clamp(samples[i]) * 32767), 44 + i * 2);
  }
  return buffer;
}

const files = {
  "correct.wav": mix(tone(660, 0.12, 0.45), delay(tone(880, 0.16, 0.38), 80)),
  "wrong.wav": tone(240, 0.12, 0.28, "triangle"),
  "star.wav": mix(tone(988, 0.08, 0.28), delay(tone(1318, 0.1, 0.22), 40)),
  "streak-3.wav": mix(
    tone(523, 0.1, 0.32),
    delay(tone(659, 0.1, 0.32), 90),
    delay(tone(784, 0.14, 0.34), 180),
  ),
  "streak-5.wav": mix(
    tone(392, 0.1, 0.3),
    delay(tone(523, 0.1, 0.32), 80),
    delay(tone(659, 0.1, 0.34), 160),
    delay(tone(784, 0.16, 0.36), 240),
  ),
  "lesson-complete.wav": mix(
    tone(523, 0.14, 0.36),
    delay(tone(659, 0.14, 0.36), 120),
    delay(tone(784, 0.18, 0.38), 240),
    delay(tone(1046, 0.28, 0.34), 380),
  ),
  "unlock.wav": mix(tone(740, 0.12, 0.3), delay(tone(988, 0.16, 0.28), 100)),
  "button.wav": tone(520, 0.05, 0.18),
};

for (const [name, samples] of Object.entries(files)) {
  writeFileSync(join(dir, name), toWav(samples));
}

console.log("wrote", Object.keys(files).length, "effects");
