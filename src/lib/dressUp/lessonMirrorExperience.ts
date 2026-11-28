import type { MirrorExperience } from "@/data/lessonMirrorExperiences";
import { magicWorldForArt } from "@/data/magicWorldCatalog";
import type { FacePose } from "@/lib/dressUp/facePose";

type Mood = "idle" | "success" | "retry";

/**
 * Continuous ambient world for an association (heat, sea, rain…).
 * Runs every frame so the child *feels* the object — not only on success.
 * Respects reduced motion (static tint only).
 */
export function drawLessonMirrorExperience(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  experience: MirrorExperience,
  mood: Mood,
  reducedMotion: boolean,
  nowMs: number,
  pose: FacePose | null,
): void {
  const t = nowMs / 1000;
  const ambient = experience.ambient;

  if (ambient === "heat") {
    drawHeat(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "sea") {
    // When a canvas companion follows the head, skip the fixed mascot.
    drawSea(ctx, width, height, t, reducedMotion, mood, pose);
  } else if (ambient === "pond") {
    drawPond(ctx, width, height, t, reducedMotion);
  } else if (ambient === "garden") {
    drawGarden(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "orchard") {
    drawOrchard(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "woodland") {
    drawWoodland(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "travel") {
    drawTravel(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "sky") {
    drawSky(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "cozy") {
    drawCozy(ctx, width, height, t, reducedMotion);
  } else if (ambient === "snack") {
    drawSnack(ctx, width, height, t, reducedMotion, mood, pose);
  } else if (ambient === "rain") {
    drawRain(ctx, width, height, t, reducedMotion);
  } else if (ambient === "space") {
    drawSpace(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "chill") {
    drawChill(ctx, width, height, t, reducedMotion);
  } else if (ambient === "music") {
    drawMusic(ctx, width, height, t, reducedMotion, mood, pose);
  } else if (ambient === "royal") {
    drawRoyal(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "playroom") {
    drawPlayroom(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "special") {
    drawSpecial(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "none") {
    /* no ambient wash */
  } else {
    const _exhaustive: never = ambient;
    void _exhaustive;
  }

  if (mood === "success" && !reducedMotion) {
    const action = magicWorldForArt(experience.art)?.successAction;
    if (action === "sip-splash" || (experience.effectType === "food-drink" && ambient === "snack")) {
      drawSipSplash(ctx, width, height, t, pose);
    } else if (action === "note-burst" || action === "drum-beat" || experience.effectType === "music") {
      drawDrumPulse(ctx, width, height, t, pose);
    } else if (action === "swim-splash" || ambient === "sea") {
      drawCatchFlash(ctx, width, height, t);
    } else if (action === "glow-warm" || ambient === "heat") {
      drawHeatFlare(ctx, width, height, t);
    } else if (action === "basket-catch" || ambient === "orchard") {
      drawOrchardCatch(ctx, width, height, t);
    } else if (action === "flap-hoot") {
      drawCatchFlash(ctx, width, height, t);
    } else if (action === "launch") {
      drawHeatFlare(ctx, width, height, t);
    } else {
      drawCatchFlash(ctx, width, height, t);
    }
  }
}

function drawHeat(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const bright = mood === "success" ? 0.12 : 0;
  const pulse = reduced ? 0.22 : 0.18 + Math.sin(t * 1.8) * 0.06;
  const g = ctx.createRadialGradient(
    w * 0.78,
    h * 0.12,
    8,
    w * 0.55,
    h * 0.4,
    h * 0.9,
  );
  g.addColorStop(0, `rgba(255, 220, 80, ${0.5 + pulse + bright})`);
  g.addColorStop(0.4, `rgba(255, 160, 40, ${0.18 + pulse * 0.45})`);
  g.addColorStop(1, "rgba(255, 100, 20, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Illustrated sun in the environment (not a face ring).
  const sx = w * 0.82;
  const sy = h * 0.14;
  const sunR = Math.min(w, h) * 0.09;
  ctx.fillStyle = "rgba(255, 210, 60, 0.95)";
  ctx.beginPath();
  ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 170, 40, 0.9)";
  ctx.lineWidth = 3;
  ctx.stroke();

  if (reduced) return;

  ctx.strokeStyle = "rgba(255, 230, 120, 0.55)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 + t * 0.35;
    const len = sunR + 10 + Math.sin(t * 2 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * (sunR + 4), sy + Math.sin(a) * (sunR + 4));
    ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
    ctx.stroke();
  }

  // Gentle butterflies / sparkles
  for (let i = 0; i < 4; i += 1) {
    const x = w * (0.15 + i * 0.18) + Math.sin(t * 1.3 + i) * 12;
    const y = h * (0.25 + (i % 3) * 0.12) + Math.cos(t * 1.1 + i) * 8;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(255, 140, 180, 0.85)" : "rgba(255, 220, 100, 0.85)";
    ctx.beginPath();
    ctx.ellipse(x - 4, y, 5, 3, t + i, 0, Math.PI * 2);
    ctx.ellipse(x + 4, y, 5, 3, -t + i, 0, Math.PI * 2);
    ctx.fill();
  }

  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 236, 140, 0.18)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSea(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
  pose: FacePose | null = null,
): void {
  const water = ctx.createLinearGradient(0, 0, 0, h);
  water.addColorStop(0, "rgba(120, 200, 255, 0.35)");
  water.addColorStop(0.35, "rgba(40, 150, 210, 0.32)");
  water.addColorStop(1, "rgba(8, 60, 120, 0.62)");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, w, h);

  // Sandy floor
  ctx.fillStyle = "rgba(232, 196, 140, 0.45)";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.88);
  ctx.quadraticCurveTo(w * 0.5, h * 0.78, w, h * 0.9);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // God rays
  if (!reduced) {
    for (let i = 0; i < 4; i += 1) {
      const x = w * (0.15 + i * 0.22) + Math.sin(t * 0.4 + i) * 8;
      const ray = ctx.createLinearGradient(x, 0, x + 30, h * 0.7);
      ray.addColorStop(0, "rgba(255, 255, 220, 0.22)");
      ray.addColorStop(1, "rgba(255, 255, 220, 0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, 0);
      ctx.lineTo(x + 18, h * 0.72);
      ctx.lineTo(x - 10, h * 0.72);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Sea plants
  if (!reduced) {
    ctx.fillStyle = "rgba(40, 160, 100, 0.6)";
    for (let i = 0; i < 6; i += 1) {
      const x = ((i + 0.5) / 6) * w;
      const sway = Math.sin(t * 1.5 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.quadraticCurveTo(x + sway, h * 0.72, x + sway * 0.4, h * 0.48);
      ctx.quadraticCurveTo(x - 8, h * 0.7, x - 5, h);
      ctx.fill();
    }
  }

  if (reduced) return;

  // Fixed mascot only when no live face pose (canvas companion tracks the head).
  if (!pose) {
    const ox = w * 0.78 + Math.sin(t * 0.8) * 12;
    const oy = h * 0.58 + Math.cos(t * 0.7) * 8;
    ctx.fillStyle = "rgba(255, 120, 170, 0.88)";
    ctx.beginPath();
    ctx.arc(ox, oy, 28, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI + Math.sin(t * 2 + i) * 0.25;
      ctx.beginPath();
      ctx.moveTo(ox, oy + 10);
      ctx.quadraticCurveTo(
        ox + Math.cos(a) * 36,
        oy + 28 + Math.sin(t + i) * 6,
        ox + Math.cos(a) * 48,
        oy + 46,
      );
      ctx.strokeStyle = "rgba(255, 120, 170, 0.85)";
      ctx.lineWidth = 7;
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(20, 40, 80, 0.85)";
    ctx.beginPath();
    ctx.arc(ox - 8, oy - 4, 4, 0, Math.PI * 2);
    ctx.arc(ox + 8, oy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const fishCount = mood === "success" ? 7 : 5;
  for (let i = 0; i < fishCount; i += 1) {
    const x = ((t * (38 + i * 14) + i * 95) % (w + 70)) - 35;
    const y = h * (0.42 + (i % 3) * 0.12) + Math.sin(t * 2 + i) * 7;
    const flip = i % 2 === 0 ? 1 : -1;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(255, 170, 60, 0.95)" : "rgba(80, 210, 255, 0.9)";
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - flip * 18, y);
    ctx.lineTo(x - flip * 34, y - 11);
    ctx.lineTo(x - flip * 34, y + 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(20, 40, 80, 0.85)";
    ctx.beginPath();
    ctx.arc(x + flip * 6, y - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(200, 240, 255, 0.75)";
  for (let i = 0; i < 12; i += 1) {
    const x = ((i + 1) / 13) * w;
    const y = h - ((t * 55 + i * 42) % (h * 0.65));
    ctx.beginPath();
    ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  if (mood === "success") {
    ctx.fillStyle = "rgba(120, 220, 255, 0.14)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawPond(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
): void {
  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.85,
    20,
    w * 0.5,
    h * 0.7,
    h * 0.55,
  );
  g.addColorStop(0, "rgba(120, 200, 80, 0.28)");
  g.addColorStop(1, "rgba(120, 200, 80, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  ctx.strokeStyle = "rgba(100, 180, 70, 0.4)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const r = 20 + i * 14 + (t % 1.2) * 8;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.82, r * 1.5, r * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGarden(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "rgba(160, 220, 255, 0.35)");
  sky.addColorStop(0.55, "rgba(255, 220, 230, 0.18)");
  sky.addColorStop(1, "rgba(120, 190, 90, 0.35)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Grass tufts
  ctx.fillStyle = "rgba(80, 170, 70, 0.55)";
  for (let i = 0; i < 8; i += 1) {
    const x = ((i + 0.5) / 8) * w;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x - 8, h * 0.78);
    ctx.lineTo(x + 8, h * 0.78);
    ctx.closePath();
    ctx.fill();
  }

  if (reduced) return;

  // Large flowers
  for (let i = 0; i < 5; i += 1) {
    const x = ((i + 0.5) / 5) * w;
    const y = h * (0.55 + (i % 2) * 0.08) + Math.sin(t + i) * 4;
    ctx.strokeStyle = "rgba(60, 140, 60, 0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.85);
    ctx.lineTo(x, y);
    ctx.stroke();
    const petal = i % 2 ? "rgba(255, 110, 150, 0.9)" : "rgba(255, 200, 70, 0.9)";
    ctx.fillStyle = petal;
    for (let p = 0; p < 6; p += 1) {
      const a = (p / 6) * Math.PI * 2 + t * 0.2;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(a) * 12,
        y + Math.sin(a) * 12,
        10,
        6,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 230, 80, 0.95)";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating petals
  for (let i = 0; i < 6; i += 1) {
    const x = ((i + 0.5) / 6) * w;
    const y = h * (0.15 + ((t * 0.2 + i * 0.1) % 0.35));
    ctx.fillStyle =
      i % 2 ? "rgba(255, 120, 150, 0.75)" : "rgba(255, 200, 80, 0.75)";
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 4, t + i, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 220, 230, 0.15)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawOrchard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "rgba(135, 206, 250, 0.35)");
  sky.addColorStop(0.55, "rgba(255, 236, 179, 0.2)");
  sky.addColorStop(1, "rgba(120, 180, 70, 0.28)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Tree trunks + canopy
  ctx.fillStyle = "rgba(120, 72, 40, 0.55)";
  ctx.fillRect(w * 0.12, h * 0.45, 10, h * 0.4);
  ctx.fillRect(w * 0.78, h * 0.5, 10, h * 0.35);
  ctx.fillStyle = "rgba(76, 160, 60, 0.45)";
  ctx.beginPath();
  ctx.arc(w * 0.14, h * 0.42, 36, 0, Math.PI * 2);
  ctx.arc(w * 0.8, h * 0.46, 32, 0, Math.PI * 2);
  ctx.fill();

  // Basket
  ctx.fillStyle = "rgba(180, 110, 50, 0.85)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.82, 34, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w * 0.5 - 30, h * 0.72, 60, 20);

  if (reduced) return;

  // Falling oranges / fruit
  const fruit = mood === "success" ? 7 : 4;
  for (let i = 0; i < fruit; i += 1) {
    const x = w * (0.22 + (i % 4) * 0.18) + Math.sin(t + i) * 6;
    const y =
      ((t * 40 + i * 55) % (h * 0.7)) +
      (mood === "success" ? h * 0.05 : 0);
    ctx.fillStyle = i % 2 ? "rgba(255, 140, 40, 0.95)" : "rgba(255, 90, 70, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(60, 140, 50, 0.9)";
    ctx.fillRect(x - 1, y - 12, 3, 6);
  }
}

function drawWoodland(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(180, 220, 255, 0.25)");
  g.addColorStop(0.45, "rgba(200, 230, 170, 0.2)");
  g.addColorStop(1, "rgba(90, 140, 60, 0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Tree silhouettes
  ctx.fillStyle = "rgba(70, 110, 50, 0.45)";
  for (let i = 0; i < 5; i += 1) {
    const x = ((i + 0.5) / 5) * w;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.85);
    ctx.lineTo(x - 22, h * 0.5);
    ctx.lineTo(x + 22, h * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Branch perch line
  ctx.strokeStyle = "rgba(100, 70, 40, 0.7)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.58);
  ctx.quadraticCurveTo(w * 0.75, h * 0.52, w * 0.92, h * 0.56);
  ctx.stroke();

  if (reduced) return;

  // Floating leaves / fireflies
  for (let i = 0; i < 8; i += 1) {
    const x = ((t * 20 + i * 40) % (w + 20)) - 10;
    const y = h * (0.25 + (i % 4) * 0.1) + Math.sin(t * 2 + i) * 6;
    ctx.fillStyle =
      i % 2 ? "rgba(120, 180, 60, 0.8)" : "rgba(255, 230, 120, 0.85)";
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 3, t + i, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 250, 200, 0.14)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawTravel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(135, 200, 255, 0.42)");
  g.addColorStop(0.45, "rgba(230, 240, 255, 0.2)");
  g.addColorStop(1, "rgba(100, 140, 90, 0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Hills
  ctx.fillStyle = "rgba(90, 170, 90, 0.35)";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.7);
  ctx.quadraticCurveTo(w * 0.25, h * 0.5, w * 0.5, h * 0.68);
  ctx.quadraticCurveTo(w * 0.75, h * 0.52, w, h * 0.66);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // Road
  ctx.fillStyle = "rgba(70, 70, 80, 0.65)";
  ctx.fillRect(0, h * 0.72, w, h * 0.2);
  ctx.strokeStyle = "rgba(255, 230, 100, 0.9)";
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.lineTo(w, h * 0.82);
  ctx.stroke();
  ctx.setLineDash([]);

  if (reduced) return;

  // Large bus rolling past
  const busX = ((t * 70) % (w + 160)) - 80;
  const busY = h * 0.52;
  ctx.fillStyle = "rgba(255, 210, 60, 0.95)";
  fillRoundRect(ctx, busX, busY, 110, 48, 10);
  ctx.fillStyle = "rgba(140, 210, 255, 0.95)";
  fillRoundRect(ctx, busX + 12, busY + 8, 22, 16, 3);
  fillRoundRect(ctx, busX + 42, busY + 8, 22, 16, 3);
  fillRoundRect(ctx, busX + 72, busY + 8, 22, 16, 3);
  ctx.fillStyle = "rgba(30, 40, 55, 0.9)";
  ctx.beginPath();
  ctx.arc(busX + 24, busY + 48, 10, 0, Math.PI * 2);
  ctx.arc(busX + 88, busY + 48, 10, 0, Math.PI * 2);
  ctx.fill();

  // Train on a distant track
  const trainX = ((t * 45 + 200) % (w + 180)) - 90;
  const trainY = h * 0.38;
  ctx.fillStyle = "rgba(255, 100, 90, 0.9)";
  fillRoundRect(ctx, trainX, trainY, 50, 28, 6);
  ctx.fillStyle = "rgba(90, 190, 240, 0.9)";
  fillRoundRect(ctx, trainX + 52, trainY + 6, 40, 22, 5);
  ctx.fillStyle = "rgba(40, 40, 50, 0.85)";
  ctx.beginPath();
  ctx.arc(trainX + 16, trainY + 28, 7, 0, Math.PI * 2);
  ctx.arc(trainX + 70, trainY + 28, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  for (let i = 0; i < 5; i += 1) {
    const x = ((t * 90 + i * 80) % (w + 40)) - 20;
    ctx.fillRect(x, h * 0.8, 18, 4);
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 220, 80, 0.12)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "rgba(80, 170, 255, 0.5)");
  g.addColorStop(0.55, "rgba(180, 220, 255, 0.28)");
  g.addColorStop(1, "rgba(255, 255, 255, 0.18)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Large sun
  const sx = w * 0.82;
  const sy = h * 0.2;
  ctx.fillStyle = "rgba(255, 220, 80, 0.9)";
  ctx.beginPath();
  ctx.arc(sx, sy, 36, 0, Math.PI * 2);
  ctx.fill();
  if (!reduced) {
    ctx.strokeStyle = "rgba(255, 200, 60, 0.55)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + t * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 44, sy + Math.sin(a) * 44);
      ctx.lineTo(sx + Math.cos(a) * 58, sy + Math.sin(a) * 58);
      ctx.stroke();
    }
  }

  if (reduced) return;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (let i = 0; i < 5; i += 1) {
    const x = ((t * 18 + i * 90) % (w + 60)) - 30;
    const y = h * (0.22 + (i % 3) * 0.12);
    ctx.beginPath();
    ctx.ellipse(x, y, 32, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 20, y + 4, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kite
  const kx = w * 0.28 + Math.sin(t) * 18;
  const ky = h * 0.35 + Math.cos(t * 0.8) * 10;
  ctx.fillStyle = "rgba(255, 90, 90, 0.9)";
  ctx.beginPath();
  ctx.moveTo(kx, ky - 22);
  ctx.lineTo(kx + 22, ky);
  ctx.lineTo(kx, ky + 22);
  ctx.lineTo(kx - 22, ky);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(kx, ky + 22);
  ctx.quadraticCurveTo(kx + 20, ky + 50, kx + 10, h * 0.7);
  ctx.stroke();

  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 240, 150, 0.14)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawRoyal(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.2, 10, w * 0.5, h * 0.5, h * 0.7);
  g.addColorStop(0, "rgba(255, 220, 100, 0.35)");
  g.addColorStop(1, "rgba(150, 80, 200, 0.12)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  ctx.fillStyle = "rgba(255, 215, 80, 0.8)";
  for (let i = 0; i < 6; i += 1) {
    const x = ((i + 0.5) / 6) * w;
    const y = h * 0.15 + Math.sin(t * 2 + i) * 4;
    ctx.beginPath();
    ctx.arc(x, y, 3 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 230, 120, 0.16)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawPlayroom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  ctx.fillStyle = "rgba(230, 200, 255, 0.16)";
  ctx.fillRect(0, 0, w, h);
  // Floor stripe
  ctx.fillStyle = "rgba(255, 180, 200, 0.2)";
  ctx.fillRect(0, h * 0.75, w, h * 0.25);
  if (reduced) return;
  const colors = [
    "rgba(255, 120, 120, 0.8)",
    "rgba(120, 200, 255, 0.8)",
    "rgba(255, 220, 80, 0.8)",
    "rgba(120, 220, 140, 0.8)",
  ];
  for (let i = 0; i < 6; i += 1) {
    const x = ((i + 0.5) / 6) * w + Math.sin(t + i) * 4;
    const y = h * 0.55 + Math.cos(t * 1.5 + i) * 8;
    ctx.fillStyle = colors[i % colors.length]!;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 200, 255, 0.12)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawSpecial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 8, w * 0.5, h * 0.5, h * 0.55);
  g.addColorStop(0, "rgba(180, 140, 255, 0.28)");
  g.addColorStop(1, "rgba(180, 140, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const r = 18 + i * 16 + Math.sin(t * 2 + i) * 3;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.45, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 240, 255, 0.14)";
    ctx.fillRect(0, 0, w, h);
  }
}

function drawOrchardCatch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
): void {
  // Fruit dropping into basket
  const y = h * 0.35 + (t % 0.6) * h * 0.4;
  ctx.fillStyle = "rgba(255, 140, 40, 0.95)";
  ctx.beginPath();
  ctx.arc(w * 0.5, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 220, 100, 0.2)";
  ctx.fillRect(0, 0, w, h);
}

function drawCozy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
): void {
  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.75,
    30,
    w * 0.5,
    h * 0.55,
    h * 0.75,
  );
  g.addColorStop(
    0,
    `rgba(150, 100, 220, ${reduced ? 0.18 : 0.16 + Math.sin(t) * 0.04})`,
  );
  g.addColorStop(1, "rgba(150, 100, 220, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawSnack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
  pose: FacePose | null,
): void {
  const g = ctx.createRadialGradient(
    w * 0.7,
    h * 0.75,
    10,
    w * 0.65,
    h * 0.7,
    h * 0.5,
  );
  g.addColorStop(0, "rgba(255, 180, 60, 0.22)");
  g.addColorStop(1, "rgba(255, 180, 60, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if (!reduced && mood === "idle" && pose) {
    ctx.strokeStyle = "rgba(255, 220, 160, 0.45)";
    ctx.lineWidth = 2;
    const mx = pose.cx + pose.width * 0.2;
    const my = pose.cy + pose.height * 0.35;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(mx + i * 8, my);
      ctx.quadraticCurveTo(
        mx + i * 8 + 4,
        my - 18 - Math.sin(t * 3 + i) * 4,
        mx + i * 8,
        my - 32,
      );
      ctx.stroke();
    }
  }
}

function drawRain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
): void {
  ctx.fillStyle = "rgba(100, 140, 180, 0.12)";
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  ctx.strokeStyle = "rgba(180, 210, 240, 0.65)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 47 + t * 80) % w;
    const y = (i * 73 + t * 160) % h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y + 12);
    ctx.stroke();
  }
}

function drawSpace(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
): void {
  ctx.fillStyle = "rgba(20, 30, 80, 0.18)";
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  for (let i = 0; i < 12; i += 1) {
    const x = (((i * 67) % 100) / 100) * w;
    const y = (((i * 41 + t * 10) % 100) / 100) * h;
    ctx.fillRect(x, y, 2, 2);
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 160, 80, 0.15)";
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
  }
}

function drawChill(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
): void {
  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.4,
    20,
    w * 0.5,
    h * 0.45,
    h * 0.6,
  );
  g.addColorStop(
    0,
    `rgba(160, 230, 255, ${reduced ? 0.2 : 0.18 + Math.sin(t * 2) * 0.04})`,
  );
  g.addColorStop(1, "rgba(160, 230, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawMusic(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  reduced: boolean,
  mood: Mood,
  pose: FacePose | null,
): void {
  ctx.fillStyle = "rgba(255, 120, 100, 0.08)";
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  const baseX = pose ? pose.cx + pose.width * 0.35 : w * 0.7;
  const baseY = pose ? pose.cy + pose.height * 0.55 : h * 0.65;
  ctx.fillStyle = "rgba(80, 60, 140, 0.75)";
  for (let i = 0; i < 5; i += 1) {
    const x = baseX + i * 14 + Math.sin(t * 3 + i) * 3;
    const y = baseY - 20 - i * 10 - (mood === "success" ? Math.sin(t * 8 + i) * 6 : 0);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 3, y - 14, 2, 14);
  }
}

function drawSipSplash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  pose: FacePose | null,
): void {
  const cx = pose ? pose.cx + pose.width * 0.28 : w * 0.65;
  const cy = pose ? pose.cy + pose.height * 0.4 : h * 0.7;
  ctx.fillStyle = "rgba(255, 160, 40, 0.8)";
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + t * 5;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 22, cy + Math.sin(a) * 14, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDrumPulse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  pose: FacePose | null,
): void {
  const cx = pose ? pose.shoulderCx + pose.shoulderWidth * 0.15 : w * 0.55;
  const cy = pose ? pose.shoulderCy + pose.height * 0.15 : h * 0.7;
  ctx.strokeStyle = "rgba(255, 90, 80, 0.5)";
  ctx.lineWidth = 4;
  const r = 24 + (t % 0.45) * 50;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Stick strike lines
  ctx.strokeStyle = "rgba(255, 180, 80, 0.85)";
  ctx.lineWidth = 3;
  const strike = Math.sin(t * 18) * 10;
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 36 + strike);
  ctx.lineTo(cx - 8, cy - 8);
  ctx.moveTo(cx + 28, cy - 36 - strike);
  ctx.lineTo(cx + 8, cy - 8);
  ctx.stroke();
}

function drawCatchFlash(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
): void {
  ctx.fillStyle = `rgba(255, 220, 100, ${0.18 + Math.sin(t * 10) * 0.08})`;
  ctx.fillRect(0, 0, w, h * 0.35);
}

function drawHeatFlare(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
): void {
  const g = ctx.createRadialGradient(w * 0.82, h * 0.1, 5, w * 0.6, h * 0.2, h * 0.7);
  g.addColorStop(0, `rgba(255, 240, 120, ${0.4 + Math.sin(t * 8) * 0.1})`);
  g.addColorStop(1, "rgba(255, 180, 40, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
): void {
  // Radius retained for call-site readability; fillRect stays mock-friendly.
  void radius;
  ctx.fillRect(x, y, w, h);
}
