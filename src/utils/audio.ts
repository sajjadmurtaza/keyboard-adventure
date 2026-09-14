let audioCtx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx ??= new Ctor();
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.06) {
  const ctx = context();
  if (!ctx) return;
  void ctx.resume();
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playSuccess() {
  tone(660, 0.12, "sine", 0.05);
  window.setTimeout(() => tone(880, 0.16, "sine", 0.04), 80);
}

export function playMiss() {
  tone(240, 0.12, "triangle", 0.03);
}

export function playComplete() {
  tone(523, 0.14, "sine", 0.05);
  window.setTimeout(() => tone(659, 0.14, "sine", 0.05), 120);
  window.setTimeout(() => tone(784, 0.22, "sine", 0.05), 240);
}
