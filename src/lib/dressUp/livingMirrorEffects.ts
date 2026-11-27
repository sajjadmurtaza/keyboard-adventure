import type { LivingCelebrateStyle } from "@/data/livingScenes";

/** Draw themed celebrate / encourage overlays on the (already mirrored) lesson canvas. */
export function drawLivingMirrorMood(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mood: "idle" | "success" | "retry",
  celebrate: LivingCelebrateStyle | undefined,
  reducedMotion: boolean,
  nowMs: number,
): void {
  if (mood === "idle") return;

  if (mood === "retry") {
    ctx.fillStyle = "rgba(118, 87, 232, 0.1)";
    ctx.fillRect(0, 0, width, height);
    if (!reducedMotion) {
      ctx.font = `bold ${Math.max(22, Math.round(width * 0.07))}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText("?", width * 0.7, height * 0.2);
      ctx.fillText("?", width * 0.78, height * 0.28);
    }
    return;
  }

  // success
  ctx.fillStyle = "rgba(255, 216, 90, 0.14)";
  ctx.fillRect(0, 0, width, height);
  if (reducedMotion) return;

  const t = nowMs / 1000;
  const style = celebrate ?? "stars";

  switch (style) {
    case "bubbles": {
      ctx.fillStyle = "rgba(126, 214, 255, 0.85)";
      for (let i = 0; i < 8; i += 1) {
        const x = ((i + 1) / 9) * width;
        const y = height * (0.75 - ((t * 0.35 + i * 0.08) % 0.55));
        const r = 4 + (i % 3) * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "ripples": {
      ctx.strokeStyle = "rgba(123, 200, 60, 0.55)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i += 1) {
        const r = 18 + i * 16 + (t % 1) * 10;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.82, r * 1.4, r * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "petals": {
      for (let i = 0; i < 7; i += 1) {
        const x = ((i + 0.5) / 7) * width;
        const y = height * (0.15 + ((t * 0.25 + i * 0.1) % 0.4));
        ctx.fillStyle = i % 2 === 0 ? "rgba(229, 57, 91, 0.8)" : "rgba(255, 138, 155, 0.85)";
        ctx.beginPath();
        ctx.ellipse(x, y, 7, 4, (t + i) % Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "sparkles": {
      ctx.fillStyle = "rgba(255, 183, 77, 0.9)";
      for (let i = 0; i < 10; i += 1) {
        const x = ((i * 37) % 100) / 100 * width;
        const y = ((i * 53 + t * 40) % 100) / 100 * height * 0.5;
        ctx.fillRect(x, y, 3, 10);
        ctx.fillRect(x - 3, y + 3, 10, 3);
      }
      break;
    }
    case "wobble": {
      ctx.fillStyle = "rgba(236, 64, 122, 0.35)";
      for (let i = 0; i < 5; i += 1) {
        const x = ((i + 1) / 6) * width;
        const y = height * 0.18 + Math.sin(t * 4 + i) * 8;
        ctx.beginPath();
        ctx.ellipse(x, y, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "stars": {
      ctx.fillStyle = "rgba(255, 216, 90, 0.95)";
      for (let i = 0; i < 6; i += 1) {
        const x = ((i + 1) / 7) * width;
        const y = height * 0.12 + (i % 2) * 16;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default: {
      const _exhaustive: never = style;
      void _exhaustive;
      break;
    }
  }
}
