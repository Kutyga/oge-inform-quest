// Простые звуковые эффекты через Web Audio API (без внешних аудиофайлов).

let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
function tone(ctx, freq, start, dur, gainVal) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + start + 0.02);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

export function playCorrect(on) {
  if (!on) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  tone(ctx, 523, 0, 0.1, 0.12);
  tone(ctx, 784, 0.08, 0.14, 0.12);
}
export function playWrong(on) {
  if (!on) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  tone(ctx, 180, 0, 0.22, 0.13);
}
export function playLevelUp(on) {
  if (!on) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  tone(ctx, 523, 0, 0.1, 0.12);
  tone(ctx, 659, 0.1, 0.1, 0.12);
  tone(ctx, 784, 0.2, 0.1, 0.12);
  tone(ctx, 1046, 0.3, 0.2, 0.13);
}
