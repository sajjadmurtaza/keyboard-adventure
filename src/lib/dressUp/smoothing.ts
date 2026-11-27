import type { FacePose } from "@/lib/dressUp/facePose";

/** Exponential moving average for face pose — cuts jitter without lagging too hard. */
export class FacePoseSmoother {
  private current: FacePose | null = null;

  constructor(private readonly alpha = 0.35) {}

  reset(): void {
    this.current = null;
  }

  next(sample: FacePose | null): FacePose | null {
    if (!sample) {
      this.current = null;
      return null;
    }
    if (!this.current) {
      this.current = { ...sample };
      return { ...sample };
    }
    const a = this.alpha;
    const prev = this.current;
    // Unwrap rotation toward sample for short spins
    let rot = sample.rotation;
    let d = rot - prev.rotation;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    rot = prev.rotation + d;

    this.current = {
      cx: prev.cx + (sample.cx - prev.cx) * a,
      cy: prev.cy + (sample.cy - prev.cy) * a,
      width: prev.width + (sample.width - prev.width) * a,
      height: prev.height + (sample.height - prev.height) * a,
      rotation: prev.rotation + (rot - prev.rotation) * a,
      crownY: prev.crownY + (sample.crownY - prev.crownY) * a,
    };
    return { ...this.current };
  }
}
