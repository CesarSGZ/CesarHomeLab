// Original 40 s soundtrack for the mission brief, synthesised from scratch (no samples, no licences).
// 120 BPM, A minor, Am–F–C–G. One bar = 2 s, so every scene cut in index.html lands on a downbeat.
// Usage: node audio/make-music.mjs  -> audio/music.wav (44.1 kHz, 16-bit stereo)
import { writeFileSync } from 'node:fs';

const SR = 44100, BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4, DUR = 40;
const N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
// Seeded PRNG so the track is identical on every run.
let seed = 0x2f6e2b1;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const at = t => Math.round(t * SR);
const add = (buf, i, v) => { if (i >= 0 && i < N) buf[i] += v; };
const addSt = (i, v, pan = 0) => { add(L, i, v * (1 - Math.max(0, pan))); add(R, i, v * (1 + Math.min(0, pan))); };

// Song map (seconds): intro 0–4, drop A 4–20, breakdown 20–24, drop B 24–36, outro 36–40.
const inDrop = t => (t >= 4 && t < 20) || (t >= 24 && t < 36);
const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am F C G
const roots = [45, 41, 48, 43];
const chordAt = t => Math.floor(t / BAR) % 4;

// Kick envelope is also the sidechain source.
const duck = new Float32Array(N).fill(1);

function kick(t, gain = 1) {
  const s = at(t), len = at(.42);
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const x = k / SR, f = 46 + 110 * Math.exp(-x * 32);
    ph += 2 * Math.PI * f / SR;
    const env = Math.exp(-x * 7.5), click = k < 90 ? rand() * .25 * (1 - k / 90) : 0;
    addSt(s + k, (Math.sin(ph) * env * .95 + click) * gain);
    const d = 1 - .72 * Math.exp(-x * 9); if (s + k < N) duck[s + k] = Math.min(duck[s + k], d);
  }
}
function clap(t, gain = .5) {
  const s = at(t), len = at(.28);
  let lp = 0, bp = 0;
  for (let k = 0; k < len; k++) {
    const x = k / SR, burst = (x < .012 || (x > .018 && x < .03) || x > .036) ? 1 : 0;
    const n = rand(); lp += .35 * (n - lp); bp = n - lp; // crude high-pass for "air"
    const env = Math.exp(-x * 16) * burst;
    addSt(s + k, (bp * .8 + Math.sin(2 * Math.PI * 190 * x) * .25) * env * gain, (k % 2 ? .15 : -.15));
  }
}
function hat(t, open = false, gain = .16) {
  const s = at(t), len = at(open ? .22 : .05);
  let lp = 0;
  for (let k = 0; k < len; k++) {
    const x = k / SR, n = rand(); lp += .6 * (n - lp);
    addSt(s + k, (n - lp) * Math.exp(-x * (open ? 14 : 80)) * gain, open ? .3 : -.25);
  }
}
// Simple state-variable low-pass for synth voices.
function voice({ t, dur, midi, gain, wave = 'saw', cutoff = 1800, envCut = 0, attack = .005, release = .08, pan = 0, detune = 0, sidechain = true }) {
  const s = at(t), len = at(dur + release), f = hz(midi);
  let p1 = 0, p2 = .37, low = 0, band = 0;
  for (let k = 0; k < len; k++) {
    const x = k / SR;
    p1 = (p1 + f / SR) % 1; p2 = (p2 + f * (1 + detune) / SR) % 1;
    const osc = wave === 'saw' ? (2 * p1 - 1) * .5 + (2 * p2 - 1) * .5
      : wave === 'pulse' ? (p1 < .42 ? .6 : -.6) + (p2 < .42 ? .4 : -.4)
      : Math.sin(2 * Math.PI * p1);
    const cut = Math.min(.95, 2 * Math.sin(Math.PI * Math.min(cutoff + envCut * Math.exp(-x * 14), SR / 3) / SR));
    low += cut * band; band += cut * (osc - low - .55 * band);
    const env = (x < attack ? x / attack : 1) * (x > dur ? Math.max(0, 1 - (x - dur) / release) : 1);
    const i = s + k;
    addSt(i, low * env * gain * (sidechain && i < N ? duck[i] : 1), pan);
  }
}
function riser(t0, t1, gain = .22) {
  const s = at(t0), len = at(t1 - t0);
  let low = 0, band = 0;
  for (let k = 0; k < len; k++) {
    const p = k / len, n = rand(), f = 300 + 7000 * p * p;
    const c = 2 * Math.sin(Math.PI * f / SR);
    low += c * band; band += c * (n - low - .3 * band);
    addSt(s + k, band * p * p * gain, Math.sin(p * 9) * .4);
  }
}

// ---- arrangement ----
for (let bar = 0; bar < DUR / BAR; bar++) {
  const t0 = bar * BAR, ch = chords[chordAt(t0)], root = roots[chordAt(t0)];
  // Pad: always present, louder in the breakdown and outro.
  const padGain = t0 >= 20 && t0 < 24 ? .07 : t0 >= 36 ? .08 : .045;
  ch.forEach((m, i) => voice({ t: t0, dur: BAR, midi: m, gain: padGain, cutoff: 900 + (t0 >= 20 && t0 < 24 ? 900 : 0), attack: .35, release: .6, pan: (i - 1) * .5, detune: .006, sidechain: inDrop(t0) }));
  for (let b = 0; b < 4; b++) {
    const t = t0 + b * BEAT;
    if (inDrop(t)) {
      kick(t);
      if (b % 2 === 1) clap(t);
      hat(t + BEAT / 2, true, .09);
      for (let q = 0; q < 4; q++) hat(t + q * BEAT / 4, false, q % 2 ? .1 : .06);
      // Off-beat bass with a filter pluck.
      voice({ t: t + BEAT / 2, dur: BEAT * .42, midi: root - 12, gain: .32, cutoff: 260, envCut: 900, release: .03 });
      voice({ t: t + BEAT * .75, dur: BEAT * .2, midi: root, gain: .12, cutoff: 400, envCut: 1200, release: .02 });
    } else if (t < 4) {
      if (t >= 2) for (let q = 0; q < 4; q++) hat(t + q * BEAT / 4, false, .05 + .02 * q);
    } else if (t >= 20 && t < 24) {
      hat(t + BEAT / 2, false, .05);
    }
    // Arp: 16ths on chord tones, from bar 3 onward; an octave up in drop B.
    if (t >= 6 && t < 36) {
      for (let q = 0; q < 4; q++) {
        const note = ch[(b * 4 + q) % 3] + 12 + (t >= 24 ? 12 : 0) + ((b * 4 + q) % 6 === 5 ? 12 : 0);
        const g = t >= 20 && t < 24 ? .05 : .04;
        voice({ t: t + q * BEAT / 4, dur: BEAT / 4 * .5, midi: note, gain: g, wave: 'pulse', cutoff: 2200, envCut: 2400, release: .05, pan: q % 2 ? .45 : -.45 });
        // 3/16 echo
        voice({ t: t + q * BEAT / 4 + BEAT * .75, dur: BEAT / 4 * .4, midi: note, gain: g * .35, wave: 'pulse', cutoff: 1400, release: .05, pan: q % 2 ? -.5 : .5 });
      }
    }
  }
}
riser(1.0, 4.0, .26);
riser(21.0, 24.0, .3);
kick(36, 1.15); clap(36, .6);
// Final sub drop under the end card.
voice({ t: 36, dur: 3.2, midi: 33, gain: .35, wave: 'sine', cutoff: 200, release: .8, sidechain: false });

// ---- master: gentle saturation, fade-out, normalise to -1 dBFS ----
let peak = 0;
for (let i = 0; i < N; i++) {
  const fade = i > at(38.6) ? Math.max(0, 1 - (i - at(38.6)) / at(1.4)) : 1;
  L[i] = Math.tanh(L[i] * 1.25) * fade; R[i] = Math.tanh(R[i] * 1.25) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = .89 / peak;
const data = Buffer.alloc(44 + N * 4);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
writeFileSync(new URL('./music.wav', import.meta.url), data);
console.log(`music.wav: ${DUR}s, peak ${peak.toFixed(2)} -> normalised`);
