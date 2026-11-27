import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertNoCameraExfiltration,
  installDressUpNetworkSpy,
} from "@/lib/dressUp/networkGuard";

describe("dress-up network guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("allows local MediaPipe and costume asset fetches", async () => {
    const original = window.fetch;
    window.fetch = vi.fn().mockResolvedValue(new Response("ok")) as typeof fetch;
    const spy = installDressUpNetworkSpy();
    await fetch("/mediapipe/face_landmarker.task");
    await fetch("/dress-up/astronaut.svg");
    await fetch("/lesson-mirror/frog.svg");
    expect(() => assertNoCameraExfiltration(spy.requests)).not.toThrow();
    spy.restore();
    window.fetch = original;
  });

  it("flags blob uploads to cloud hosts", async () => {
    const original = window.fetch;
    window.fetch = vi.fn().mockResolvedValue(new Response("ok")) as typeof fetch;
    const spy = installDressUpNetworkSpy();
    await fetch("https://platform.decart.ai/v1/tryon", {
      method: "POST",
      body: new Blob([new Uint8Array([1, 2, 3])]),
    });
    expect(() => assertNoCameraExfiltration(spy.requests)).toThrow(/Suspicious/);
    spy.restore();
    window.fetch = original;
  });
});
