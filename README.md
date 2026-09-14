# Keyboard Adventure

A playful typing practice app for children about ages 4–8. The child sees **one giant letter**, presses that key on a real keyboard, and only then moves on. Wrong keys never skip ahead.

No accounts, ads, analytics, or child data collection. Progress stays in the browser (`localStorage`).

## Install

```bash
cd keyboard-adventure
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use a computer with a physical keyboard.

## Build

```bash
npm run build
npm start
```

## Add lessons

Edit `src/data/lessons.ts`. Each lesson needs an `id`, `title`, `description`, `keys`, and a `sequence` of target characters (`" "` for space).

Lesson 2 unlocks after lesson 1 is finished, and so on.

## Theme and colors

Colors and motion live in `src/app/globals.css`. Fonts are Fredoka (letters) and Nunito (UI) in `src/app/layout.tsx`.

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel (Next.js defaults).
3. Deploy. No environment variables are required.

## Local progress

These keys are stored only on this device:

- `keyboard-adventure-progress-v1` — completed lessons, stars, attempt counts
- `keyboard-adventure-settings-v1` — sound, voice, volume, animations, hints, question count

Parent settings (gear) → **Reset progress** (lessons, stars, stats) or **Reset everything** (also sound, name, and other options). You can also clear this site’s data in the browser. Nothing is sent to a server.

## How matching works

`src/utils/keys.ts` is the only place that decides if a key counts. Matching is case-insensitive. Held-down repeats (`event.repeat`) are ignored. Modifier and arrow keys are ignored. Space is `event.key === " "`.
# keyboard-adventure
