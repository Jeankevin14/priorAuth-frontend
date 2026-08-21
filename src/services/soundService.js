const STORAGE_KEY = 'proauth-sound-enabled';

let audioContext = null;
let enabledCache = null;
let noiseBuffer = null;

function readStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function isEnabled() {
  if (enabledCache === null) enabledCache = readStoredPreference();
  return enabledCache;
}

function setEnabled(value) {
  enabledCache = Boolean(value);
  try { localStorage.setItem(STORAGE_KEY, String(enabledCache)); } catch { /* ignore persistence failures */ }
}

// Lazily created on first actual play — never on module load — so the app
// never attempts audio without a real user-triggered workflow event, and
// browsers never see an autoplay attempt.
function getContext() {
  if (audioContext) return audioContext;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioContext = new Ctx();
  return audioContext;
}

// A single short, soft tone: quick attack, gentle exponential decay so it
// never clicks or feels harsh. Peak gain is kept low across every sound in
// this file — these are meant to be felt more than heard.
function tone(ctx, { freq, start, duration, peak, type = 'sine', attack = 0.008 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

// Short burst of white noise, cached per AudioContext — gives each heart
// sound a bit of organic "tissue" texture instead of a pure electronic tone.
function getNoiseBuffer(ctx) {
  if (noiseBuffer) return noiseBuffer;
  const length = Math.floor(ctx.sampleRate * 0.2);
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

// A single heart sound (S1 "lub" or S2 "dub"): a low sine whose pitch drops
// quickly (the same envelope technique used for a kick drum "thump") run
// through a lowpass filter for a muffled, organic quality, layered with a
// touch of filtered noise for texture — rather than a clean electronic beep.
function heartThump(ctx, { start, peak, duration, startFreq, endFreq, filterFreq }) {
  const t0 = ctx.currentTime + start;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, t0);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration * 0.65);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.6;

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.0001, t0);
  oscGain.gain.linearRampToValueAtTime(peak, t0 + 0.006);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(filter).connect(oscGain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);

  const noiseDuration = duration * 0.4;
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = filterFreq * 1.3;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t0);
  noiseGain.gain.linearRampToValueAtTime(peak * 0.22, t0 + 0.004);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + noiseDuration);

  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(t0);
  noise.stop(t0 + noiseDuration + 0.03);
}

function heartbeatPulse(ctx, offset) {
  // "lub" (S1) — deeper, longer, stronger
  heartThump(ctx, { start: offset, peak: 0.1, duration: 0.16, startFreq: 120, endFreq: 52, filterFreq: 190 });
  // "dub" (S2) — a touch higher, shorter, softer
  heartThump(ctx, { start: offset + 0.19, peak: 0.065, duration: 0.12, startFreq: 145, endFreq: 68, filterFreq: 240 });
}

function safePlay(builder) {
  if (!isEnabled()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    builder(ctx);
  } catch {
    // Never let a synthesis or playback failure break the app.
  }
}

export const soundService = {
  isEnabled,
  setEnabled,

  // Opening a patient clinical profile or a detailed authorization review.
  // `critical` plays a second heartbeat cycle for high-priority/urgent cases.
  playHeartbeat(critical = false) {
    safePlay(ctx => {
      heartbeatPulse(ctx, 0);
      if (critical) heartbeatPulse(ctx, 0.5);
    });
  },

  // Authorization submission succeeds; a final approval is recorded.
  playSuccess() {
    safePlay(ctx => {
      tone(ctx, { freq: 523.25, start: 0, duration: 0.12, peak: 0.05, type: 'sine' });
      tone(ctx, { freq: 659.25, start: 0.1, duration: 0.18, peak: 0.055, type: 'sine' });
    });
  },

  // A request needs more information.
  playAlert() {
    safePlay(ctx => {
      tone(ctx, { freq: 440, start: 0, duration: 0.1, peak: 0.055, type: 'triangle' });
      tone(ctx, { freq: 370, start: 0.13, duration: 0.12, peak: 0.05, type: 'triangle' });
    });
  },

  // A request enters nurse review.
  playReview() {
    safePlay(ctx => {
      tone(ctx, { freq: 330, start: 0, duration: 0.19, peak: 0.045, type: 'triangle' });
    });
  }
};

// Requests with 'Urgent' or 'Emergency' urgency are treated as high-priority
// for the purposes of the elevated (double-pulse) heartbeat.
export function isHighPriorityRequest(request) {
  const urgency = String(request?.urgency || '').toLowerCase();
  return urgency === 'urgent' || urgency === 'emergency';
}
