import { describe, expect, it } from "vitest";
import {
  average,
  DressUpPerfSession,
  formatPerfFps,
  formatPerfMs,
  percentile,
} from "@/lib/dressUp/dressUpPerf";

describe("dressUpPerf math", () => {
  it("computes average and p95 without mutating callers' expectations", () => {
    expect(average([])).toBeNull();
    expect(average([10, 20, 30])).toBe(20);
    expect(percentile([], 95)).toBeNull();
    expect(percentile([10], 95)).toBe(10);
    const samples = [10, 20, 30, 40, 50];
    expect(percentile(samples, 0)).toBe(10);
    expect(percentile(samples, 100)).toBe(50);
    expect(percentile(samples, 50)).toBe(30);
  });

  it("formats display helpers", () => {
    expect(formatPerfMs(null)).toBe("—");
    expect(formatPerfMs(3.2)).toBe("3.2ms");
    expect(formatPerfMs(42.6)).toBe("43ms");
    expect(formatPerfFps(null)).toBe("—");
    expect(formatPerfFps(29.4)).toBe("29 fps");
  });
});

describe("DressUpPerfSession", () => {
  it("tracks start timings and never stores frame payloads", () => {
    const session = new DressUpPerfSession();
    session.beginStart("cold");
    session.noteCamera(120);
    session.noteModel(800, "CPU");
    session.noteLive();
    session.noteVideoSize(640, 480);
    session.noteFrame({ detected: true, detectMs: 12 });
    session.noteFrame({ detected: true, detectMs: 18 });
    session.noteFrame({ detected: false });
    session.noteCostumeSwitch(40);
    session.noteCleanup(2, false);

    const snap = session.snapshot();
    expect(snap.startKind).toBe("cold");
    expect(snap.cameraMs).toBe(120);
    expect(snap.modelMs).toBe(800);
    expect(snap.delegate).toBe("CPU");
    expect(snap.videoWidth).toBe(640);
    expect(snap.videoHeight).toBe(480);
    expect(snap.detectSamples).toBe(2);
    expect(snap.detectAvgMs).toBe(15);
    expect(snap.framesWithoutDetect).toBe(1);
    expect(snap.costumeSwitchMs).toBe(40);
    expect(snap.tracksAliveAfterStop).toBe(false);
    expect(JSON.stringify(snap)).not.toMatch(/landmark|Fatima|blob|data:/i);
  });

  it("rolls detect samples in a fixed ring", () => {
    const session = new DressUpPerfSession();
    session.beginStart("warm");
    for (let i = 0; i < 200; i += 1) {
      session.noteFrame({ detected: true, detectMs: i });
    }
    const snap = session.snapshot();
    expect(snap.detectSamples).toBe(180);
    expect(snap.detectsRun).toBe(200);
  });
});
