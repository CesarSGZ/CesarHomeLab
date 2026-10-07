// Original 66 s synthwave soundtrack for the mission brief, synthesised from scratch (no samples, no SFX).
// 120 BPM, A minor, Am–F–C–G. One bar = 2 s, so every section in index.html starts on a downbeat:
// intro 0–6 · drop 6 · experience board 14–32 · lead melody 32–48 · climax 48–58 · final chord 58–64.
// Usage: node audio/make-music.mjs  -> audio/music.wav (44.1 kHz, 16-bit stereo)
import { writeFileSync } from 'node:fs';

const SR = 44100, BEAT = .5, BAR = 2, DUR = 64;
const N = Math.round(SR * DUR);
const dry = [new Float32Array(N), new Float32Array(N)];
const wet = [new Float32Array(N), new Float32Array(N)]; // reverb send
const duck = new Float32Array(N).fill(1);
let seed = 0x51a7e;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = m => 440 * 2 ** ((m - 69) / 12);
const at = t => Math.round(t * SR);
function put(i, v, pan, send) {
  if (i < 0 || i >= N) return;
  const l = v * Math.min(1, 1 - pan), r = v * Math.min(1, 1 + pan);
  dry[0][i] += l; dry[1][i] += r;
  if (send) { wet[0][i] += l * send; wet[1][i] += r * send; }
}

const chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 66]]; // Am7 Fmaj7 Cmaj7 G(add#11 colour)
const roots = [45, 41, 48, 43];
const chordAt = t => Math.floor(t / BAR) % 4;
const drums = t => t >= 6 && t < 58;

function kick(t, g = 1) {
  const s = at(t); let ph = 0;
  for (let k = 0; k < at(.45); k++) {
    const x = k / SR; ph += 2 * Math.PI * (44 + 120 * Math.exp(-x * 30)) / SR;
    put(s + k, Math.sin(ph) * Math.exp(-x * 6.5) * .9 * g, 0, 0);
    const d = 1 - .7 * Math.exp(-x * 8); if (s + k < N) duck[s + k] = Math.min(duck[s + k], d);
  }
}
// Gated, roomy synthwave snare: tone + noise, sent hard to the reverb.
function snare(t, g = .55) {
  const s = at(t); let lp = 0;
  for (let k = 0; k < at(.3); k++) {
    const x = k / SR, n = rand(); lp += .25 * (n - lp);
    const v = ((n - lp) * .75 + Math.sin(2 * Math.PI * 185 * x) * .35) * Math.exp(-x * 13) * g;
    put(s + k, v, 0, .9);
  }
}
function hat(t, g = .07, open = false) {
  const s = at(t); let lp = 0;
  for (let k = 0; k < at(open ? .25 : .045); k++) {
    const x = k / SR, n = rand(); lp += .55 * (n - lp);
    put(s + k, (n - lp) * Math.exp(-x * (open ? 12 : 90)) * g, .3, .1);
  }
}
function synth({ t, dur, midi, g, osc = 'saw', voices = 1, detune = .008, cut = 1600, env = 0, q = .5, atk = .01, rel = .1, pan = 0, send = .2, vib = 0, side = true }) {
  const s = at(t), len = at(dur + rel), f = hz(midi);
  const ph = Array.from({ length: voices }, (_, v) => (v * .31) % 1);
  let low = 0, band = 0;
  for (let k = 0; k < len; k++) {
    const x = k / SR, vf = vib ? 1 + vib * Math.sin(2 * Math.PI * 5.2 * x) * Math.min(1, x / .4) : 1;
    let o = 0;
    for (let v = 0; v < voices; v++) {
      const dv = voices > 1 ? (v / (voices - 1) - .5) * 2 * detune : 0;
      ph[v] = (ph[v] + f * (1 + dv) * vf / SR) % 1;
      o += osc === 'saw' ? 2 * ph[v] - 1 : osc === 'sq' ? (ph[v] < .5 ? 1 : -1) : Math.sin(2 * Math.PI * ph[v]);
    }
    o /= voices;
    const fc = Math.min(cut + env * Math.exp(-x * 9), SR / 3), c = Math.min(.95, 2 * Math.sin(Math.PI * fc / SR));
    low += c * band; band += c * (o - low - q * band);
    const a = (x < atk ? x / atk : 1) * (x > dur ? Math.max(0, 1 - (x - dur) / rel) : 1);
    const i = s + k;
    put(i, low * a * g * (side && i < N ? duck[i] : 1), pan, send);
  }
}

// ---- arrangement ----
// Drums first so the sidechain envelope exists before the tonal parts read it.
for (let t = 0; t < DUR; t += BEAT) {
  const b = Math.round(t / BEAT) % 4;
  if (drums(t)) {
    kick(t);
    if (b === 1 || b === 3) snare(t);
    hat(t + BEAT / 2, t >= 48 ? .09 : .06, t >= 48);
    hat(t + BEAT / 4, .035); hat(t + BEAT * .75, .035);
  }
}
for (let i = 0; i < 16; i++) snare(5 + i * .0625, .12 + i * .022); // roll into the drop
kick(58, 1.1); snare(58, .5);

for (let bar = 0; bar < DUR / BAR; bar++) {
  const t0 = bar * BAR, ch = chords[chordAt(t0)], root = roots[chordAt(t0)];
  const intro = t0 < 6, outro = t0 >= 58;
  // Lush detuned pads; the intro opens its filter bar by bar.
  const padCut = intro ? 500 + t0 * 260 : outro ? 1500 : 1300;
  ch.forEach((m, i) => synth({ t: t0, dur: outro ? 5.2 : BAR, midi: m, g: outro ? .085 : .06, voices: 3, detune: .009, cut: padCut, atk: .25, rel: outro ? 1.6 : .5, pan: (i - 1.5) * .35, send: .45, side: !intro && !outro }));
  if (outro) { synth({ t: t0, dur: 5, midi: root - 12, g: .3, osc: 'sine', cut: 400, rel: 1.2, send: 0, side: false }); break; }
  // Driving eighth-note bass.
  if (!intro) for (let e = 0; e < 8; e++) synth({ t: t0 + e * BEAT / 2, dur: BEAT / 2 * .8, midi: root - 12 + (e === 7 ? 12 : 0), g: .3, voices: 2, detune: .004, cut: 380, env: 900, q: .35, rel: .03, send: .02 });
  // Sixteenth arp through a dotted-eighth echo.
  for (let s16 = 0; s16 < 16; s16++) {
    const t = t0 + s16 * BEAT / 4; if (t < 2) continue;
    const note = ch[[0, 1, 2, 3, 2, 1][s16 % 6]] + 12, g = intro ? .018 + t0 * .004 : .028;
    synth({ t, dur: .06, midi: note, g, osc: 'sq', cut: 2200, env: 1800, rel: .05, pan: s16 % 2 ? .4 : -.4, send: .25 });
    synth({ t: t + .375, dur: .05, midi: note, g: g * .35, osc: 'sq', cut: 1400, rel: .05, pan: s16 % 2 ? -.45 : .45, send: .3 });
  }
}
// Lead melody (32–58), an octave up for the climax (48–58).
const motif = [[[76, 0, 1.5], [74, 1.5, .5], [72, 2, 1], [71, 3, 1]], [[72, 0, 1.5], [69, 1.5, .5], [72, 2, 2]], [[76, 0, 1.5], [79, 1.5, .5], [76, 2, 1], [74, 3, 1]], [[74, 0, 2], [71, 2, 1], [74, 3, 1]]];
for (let t0 = 32; t0 < 58; t0 += BAR) {
  const up = t0 >= 48 ? 12 : 0;
  motif[chordAt(t0)].forEach(([m, b, d]) => {
    synth({ t: t0 + b * BEAT, dur: d * BEAT * .92, midi: m + up - 12, g: .11, voices: 2, detune: .006, cut: 2600, env: 1200, atk: .02, rel: .18, send: .5, vib: .006 });
  });
}

// ---- reverb (Schroeder: 4 combs + 2 allpasses per channel) ----
function reverb(input, offset) {
  const out = new Float32Array(N);
  [1557, 1617, 1491, 1422].forEach(len => {
    const d = len + offset, buf = new Float32Array(d); let idx = 0, filt = 0;
    for (let i = 0; i < N; i++) { const y = buf[idx]; filt = y * .7 + filt * .3; buf[idx] = input[i] + filt * .84; out[i] += y * .25; idx = (idx + 1) % d; }
  });
  [556, 225].forEach(len => {
    const d = len + offset, buf = new Float32Array(d); let idx = 0;
    for (let i = 0; i < N; i++) { const b = buf[idx], y = -out[i] + b; buf[idx] = out[i] + b * .5; out[i] = y; idx = (idx + 1) % d; }
  });
  return out;
}
const rv = [reverb(wet[0], 0), reverb(wet[1], 23)];

// ---- master ----
let peak = 0;
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const fade = i > at(62.2) ? Math.max(0, 1 - (i - at(62.2)) / at(1.8)) : 1;
  L[i] = Math.tanh((dry[0][i] + rv[0][i] * .55) * 1.15) * fade;
  R[i] = Math.tanh((dry[1][i] + rv[1][i] * .55) * 1.15) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = .89 / peak, data = Buffer.alloc(44 + N * 4);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVE', 8); data.write('fmt ', 12);
data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22); data.writeUInt32LE(SR, 24);
data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4);
}
writeFileSync(new URL('../public/music.wav', import.meta.url), data);
console.log(`music.wav: ${DUR}s synthwave, peak ${peak.toFixed(2)}`);
