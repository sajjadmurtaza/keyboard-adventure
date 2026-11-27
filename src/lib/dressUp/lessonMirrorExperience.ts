import type { MirrorExperience } from "@/data/lessonMirrorExperiences";
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
    drawSea(ctx, width, height, t, reducedMotion, mood);
  } else if (ambient === "pond") {
    drawPond(ctx, width, height, t, reducedMotion);
  } else if (ambient === "garden") {
    drawGarden(ctx, width, height, t, reducedMotion, mood);
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
  } else if (ambient === "none") {
    /* no ambient wash */
  } else {
    const _exhaustive: never = ambient;
    void _exhaustive;
  }

  if (mood === "success" && !reducedMotion) {
    if (experience.id === "drink-juice") {
      drawSipSplash(ctx, width, height, t, pose);
    } else if (experience.id === "drum-beat") {
      drawDrumPulse(ctx, width, height, t, pose);
    } else if (experience.id === "sea-hunt") {
      drawCatchFlash(ctx, width, height, t);
    } else if (experience.id === "sun-heat") {
      drawHeatFlare(ctx, width, height, t);
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
): void {
  const water = ctx.createLinearGradient(0, h * 0.28, 0, h);
  water.addColorStop(0, "rgba(40, 140, 200, 0)");
  water.addColorStop(0.3, "rgba(30, 150, 210, 0.28)");
  water.addColorStop(1, "rgba(10, 70, 140, 0.55)");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, w, h);

  // Sea plants
  if (!reduced) {
    ctx.fillStyle = "rgba(40, 160, 100, 0.55)";
    for (let i = 0; i < 5; i += 1) {
      const x = ((i + 0.5) / 5) * w;
      const sway = Math.sin(t * 1.5 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.quadraticCurveTo(x + sway, h * 0.75, x + sway * 0.4, h * 0.55);
      ctx.quadraticCurveTo(x - 6, h * 0.72, x - 4, h);
      ctx.fill();
    }
  }

  if (reduced) return;

  const fishCount = mood === "success" ? 6 : 4;
  for (let i = 0; i < fishCount; i += 1) {
    const x = ((t * (38 + i * 14) + i * 95) % (w + 70)) - 35;
    const y = h * (0.5 + (i % 3) * 0.12) + Math.sin(t * 2 + i) * 7;
    const flip = i % 2 === 0 ? 1 : -1;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(255, 170, 60, 0.9)" : "rgba(80, 210, 255, 0.85)";
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - flip * 15, y);
    ctx.lineTo(x - flip * 28, y - 9);
    ctx.lineTo(x - flip * 28, y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(20, 40, 80, 0.8)";
    ctx.beginPath();
    ctx.arc(x + flip * 5, y - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(200, 240, 255, 0.7)";
  for (let i = 0; i < 9; i += 1) {
    const x = ((i + 1) / 10) * w;
    const y = h - ((t * 55 + i * 42) % (h * 0.6));
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
  ctx.fillStyle = "rgba(255, 180, 200, 0.1)";
  ctx.fillRect(0, 0, w, h);
  if (reduced) return;
  for (let i = 0; i < 6; i += 1) {
    const x = ((i + 0.5) / 6) * w;
    const y = h * (0.2 + ((t * 0.2 + i * 0.1) % 0.35));
    ctx.fillStyle =
      i % 2 ? "rgba(255, 120, 150, 0.75)" : "rgba(255, 200, 80, 0.75)";
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 3.5, t + i, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === "success") {
    ctx.fillStyle = "rgba(255, 220, 230, 0.15)";
    ctx.fillRect(0, 0, w, h);
  }
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
