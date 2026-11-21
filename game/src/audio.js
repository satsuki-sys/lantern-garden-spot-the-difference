// Tiny synthesized sounds: no audio files, just a WebAudio oscillator.
// A find chimes up two notes, a miss thuds low, a finished level plays a
// short rising melody. Everything is guarded: silence is always fine.

let context = null;

function tone(freq, at, dur, type = 'sine', gain = 0.08) {
  if (!context) return;
  const osc = context.createOscillator();
  const amp = context.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, context.currentTime + at);
  amp.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + at + dur);
  osc.connect(amp).connect(context.destination);
  osc.start(context.currentTime + at);
  osc.stop(context.currentTime + at + dur);
}

export function unlockAudio() {
  try {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') context.resume();
  } catch {
    context = null;
  }
}

export function playFind() {
  tone(880, 0, 0.16, 'sine', 0.09);
  tone(1318, 0.07, 0.22, 'sine', 0.08);
}

export function playMiss() {
  tone(160, 0, 0.18, 'triangle', 0.1);
}

export function playHint() {
  tone(660, 0, 0.14, 'sine', 0.06);
  tone(660, 0.18, 0.14, 'sine', 0.05);
}

export function playLevelClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.24, 'sine', 0.08));
}
