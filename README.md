# Keyboard Adventure

A playful typing practice app for children about ages **4–8**. The child sees **one giant letter**, an object that starts with that letter (Fish for F), presses that key on a real keyboard, and only then moves on. Wrong keys never skip ahead. A correct key holds a short celebration (**about 1.5 seconds**), then the next letter appears.

No accounts, ads, analytics, or child data collection. Progress stays in the browser (`localStorage`).

## What it looks like

Screenshots live in `docs/screenshots/` so GitHub can show them in this README. They are excluded from the Vercel upload (`.vercelignore`) and are **not** in `public/`, so they are not part of the live website.

### Home

![Home screen with Start and Practice](docs/screenshots/home.png)

### Lesson map

![Home Row Land with F and J Play](docs/screenshots/map.png)

### Lesson

Fish appears before typing F. The toy keyboard has a long space bar. The finger hint stays on screen under the target key.

![Lesson with Fish, giant F, and toy keyboard](docs/screenshots/lesson-f.png)

### Parent settings

Friendly or Calm voice, preview, and speaking speed.

![Parent settings including voice choices](docs/screenshots/parent-settings.png)

![Voice list with Samantha and Hear preview](docs/screenshots/parent-voice.png)

```mermaid
flowchart TD
  home[Home START]
  map[Lesson map]
  ready[Letter plus object SVG]
  type[Child types one key]
  wrong[Stay on same letter]
  win[Success for 1.5 seconds]
  next[Next prepared letter]
  home --> map --> ready --> type
  type -->|wrong| wrong --> type
  type -->|correct| win --> next --> ready
```

## Install

```bash
cd keyboard-adventure
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A computer with a physical keyboard is best for finger practice. Phones use the native keyboard and a compact HUD (no full on-screen QWERTY).

## How a lesson works

1. The association picture and word appear **before** typing (Fish / FISH, then F).
2. Only one target is active. Layout never changes what counts as a correct key.
3. Wrong keys shake and stay. The picture does not disappear.
4. Correct keys lock typing, celebrate, keep the same picture, then wait about **1.5 seconds**.
5. The next letter appears with its picture already ready. Voice does not say the next letter until that scene is on screen.
6. Lesson complete waits for **Next adventure** or **Play again**.

Desktop shows a toy keyboard that still teaches real geography: staggered rows, F/J bumps, and a wide space bar. The finger hint sits under the **target key**, inside the keyboard card.

## Voice

Browser speech cannot request `gender: "female"`. The app prefers clearer English system voices (Samantha Enhanced over Compact, and similar). Rate stays near normal talking speed. Parents can preview and pick a voice in settings.

Howler still plays success, wrong, star, and celebration sounds.

## Add lessons

Edit `src/data/lessons.ts`. Each lesson needs an `id`, `title`, `description`, `keys`, and a `sequence` of target characters (`" "` for space).

Lesson 2 unlocks after lesson 1 is finished, and so on.

## Theme and colors

Colors and motion live in `src/app/globals.css`. Fonts are Fredoka (letters) and Nunito (UI) in `src/app/layout.tsx`.

## Checks

```bash
npm run typecheck
npm test
npm run test:e2e
npm run verify
```

## Deploy on Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel (Next.js defaults).
3. Deploy. No environment variables are required.

Do **not** copy screenshots into `public/`. GitHub shows `docs/screenshots/` in this README. `.vercelignore` keeps those PNGs out of the Vercel deployment.

## Local progress

These keys are stored only on this device:

- `keyboard-adventure-progress-v1` — completed lessons, stars, attempt counts
- `keyboard-adventure-settings-v1` — sound, voice, volume, animations, hints, question count

Parent settings (gear) → **Reset progress** (lessons, stars, stats) or **Reset everything** (also sound, name, and other options). You can also clear this site’s data in the browser. Nothing is sent to a server.

## How matching works

`src/utils/keys.ts` is the only place that decides if a key counts. Matching is case-insensitive. Held-down repeats (`event.repeat`) are ignored. Modifier and arrow keys are ignored. Space is `event.key === " "`.
