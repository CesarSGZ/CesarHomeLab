// 120 BPM synthwave cue, synthesised from scratch (no samples). Deterministic: seeded noise only.
// Hits land on every scene cut of the mission brief: 8, 14, 18, 32, 38, 44, 53, 56 s.
//   node audio/music.mjs  ->  audio/music.wav (48 kHz, 16-bit stereo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 48000, BPM = 120, B = 60 / BPM, DUR = 61.6, N = Math.ceil(SR * DUR);
const CUTS = [8, 14, 18, 32, 38, 44, 53, 56];
const GROOVE = [[8, 14], [18, 53]];           // full drums
const inGroove = t => GROOVE.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);
const L = new Float32Array(N), R = new Float32Array(N), RL = new Float32Array(N), RR = new Float32Array(N); // dry + reverb send

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const noise = rng(1234);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const put = (i, l, r, send = 0) => { if (i < 0 || i >= N) return; L[i] += l; R[i] += r; RL[i] += l * send; RR[i] += r * send; };
const saw = ph => 2 * (ph - Math.floor(ph + .5));
const tri = ph => 1 - 4 * Math.abs(ph - Math.floor(ph + .5));

// ---------- sidechain (ducks bass/pads under every kick) ----------
const kicks = [];
[0, .5, 1, 1.5, 2].forEach(t => kicks.push(t));
for (let t = 4; t < 61; t += B) if (inGroove(t) || (t >= 4 && t < 8) || (t >= 56 && t < 58)) kicks.push(t);
const duck = new Float32Array(N).fill(1);
for (const k of kicks) { const s = Math.round(k * SR); for (let i = 0; i < SR * .4 && s + i < N; i++) duck[s + i] = Math.min(duck[s + i], 1 - .7 * Math.exp(-i / SR * 9)); }

// ---------- harmony ----------
const PROG = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]]; // Am F C G
const ROOT = [45, 41, 48, 43];
function chordAt(t) { if (t >= 56) return 0; if (t >= 55) return 3; return Math.floor(t / 2) % 4; }

// ---------- drums ----------
function kick(t, g = 1) {
  const s = Math.round(t * SR); let ph = 0;
  for (let i = 0; i < SR * .5; i++) {
    const x = i / SR, f = 44 + 120 * Math.exp(-x * 28);
    ph += f / SR;
    const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 7) + (x < .004 ? (noise() * 2 - 1) * .5 * (1 - x / .004) : 0);
    put(s + i, v * .95 * g, v * .95 * g);
  }
}
function clap(t) {
  const s = Math.round(t * SR); let lp = 0, hp = 0;
  for (let i = 0; i < SR * .35; i++) {
    const x = i / SR, n = noise() * 2 - 1;
    lp += .35 * (n - lp); const bp = lp - (hp += .05 * (lp - hp));
    const e = (x < .03 ? (1 - ((x * 100) % 1) * .6) : 1) * Math.exp(-x * 14);
    const v = bp * e * 1.1 + Math.sin(2 * Math.PI * 190 * x) * Math.exp(-x * 30) * .3;
    put(s + i, v * .5, v * .5, .5);
  }
}
function hat(t, open = false) {
  const s = Math.round(t * SR); let prev = 0;
  for (let i = 0; i < SR * (open ? .22 : .05); i++) {
    const x = i / SR, n = noise() * 2 - 1, h = n - prev; prev = n;
    const v = h * Math.exp(-x * (open ? 14 : 70)) * .16;
    put(s + i, v * .8, v, .1);
  }
}

// ---------- impacts for scene cuts ----------
function impact(t, big = 1) {
  const s = Math.round(t * SR); let ph = 0, lp = 0;
  for (let i = 0; i < SR * 2.2; i++) {
    const x = i / SR; ph += (30 + 50 * Math.exp(-x * 6)) / SR;
    const boom = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 2.2) * .8;
    const n = noise() * 2 - 1; lp += .6 * (n - lp);
    const crash = (n - lp) * Math.exp(-x * 2.4) * .22;
    put(s + i, (boom + crash * 1.1) * big, (boom + crash * .9) * big, .55);
  }
  // reverse swell into the hit
  const len = Math.round(SR * .5);
  for (let i = 0; i < len; i++) {
    const k = i / len, n = noise() * 2 - 1;
    put(s - len + i, n * k * k * k * .16 * big, n * k * k * k * .16 * big, .4);
  }
}

// ---------- bass: 8th-note pulse, filtered saw ----------
function bass(t0, t1) {
  for (let t = t0; t < t1 - 1e-6; t += B / 2) {
    const c = chordAt(t), f = mtof(ROOT[c] - 12 + (Math.round(t / (B / 2)) % 2 ? 12 : 0));
    const s = Math.round(t * SR), len = Math.round(SR * B / 2 * .95); let y1 = 0, y2 = 0, ph = 0, ph2 = .3;
    for (let i = 0; i < len; i++) {
      const x = i / SR; ph += f / SR; ph2 += f * 1.006 / SR;
      const raw = saw(ph % 1) * .6 + saw(ph2 % 1) * .4;
      const cut = 1 - Math.exp(-2 * Math.PI * (180 + 1400 * Math.exp(-x * 22)) / SR);
      y1 += cut * (raw - y1); y2 += cut * (y1 - y2);
      const e = Math.min(1, x * 400) * Math.exp(-x * 3) * (i > len - 200 ? (len - i) / 200 : 1);
      const v = y2 * e * .42 * duck[s + i];
      put(s + i, v, v);
    }
  }
}

// ---------- pad: detuned supersaw chords ----------
function pad(t0, t1, gain = 1) {
  const s0 = Math.round(t0 * SR), s1 = Math.min(N, Math.round(t1 * SR));
  const st = [{}, {}, {}, {}, {}, {}, {}, {}, {}].map((_, k) => ({ ph: k * .137, y: 0, y2: 0 }));
  for (let i = s0; i < s1; i++) {
    const t = i / SR, notes = PROG[chordAt(t)].concat(PROG[chordAt(t)][0] + 12);
    let l = 0, r = 0, k = 0;
    for (const n of notes) for (const d of [-.11, 0, .12]) {
      if (k >= st.length) break;
      const o = st[k]; o.ph += mtof(n + d) / SR; const v = saw(o.ph % 1);
      const pan = (k % 3) / 2; l += v * (1 - pan); r += v * pan; k++;
    }
    const sw = .5 + .5 * Math.sin(t * .9);
    const env = Math.min(1, (t - t0) / .8) * Math.min(1, (t1 - t) / .5);
    const cut = 1 - Math.exp(-2 * Math.PI * (700 + 1600 * sw) / SR);
    st[0].y += cut * (l - st[0].y); st[0].y2 += cut * (st[0].y - st[0].y2);
    st[1].y += cut * (r - st[1].y); st[1].y2 += cut * (st[1].y - st[1].y2);
    const g = .045 * env * gain * (.45 + .55 * duck[i]);
    put(i, st[0].y2 * g, st[1].y2 * g, .7);
  }
}

// ---------- arp: 16th-note pluck with ping-pong delay ----------
const ARP = [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 4, 3, 2, 1];
function arp(t0, t1, gain = 1) {
  for (let t = t0, j = Math.round(t0 / (B / 4)); t < t1 - 1e-6; t += B / 4, j++) {
    const ch = PROG[chordAt(t)], tones = [ch[0], ch[1], ch[2], ch[0] + 12, ch[1] + 12];
    const f = mtof(tones[ARP[j % 16]] + 12), s = Math.round(t * SR); let ph = 0, y = 0;
    for (let i = 0; i < SR * .2; i++) {
      const x = i / SR; ph += f / SR;
      const raw = (ph % 1 < .5 ? 1 : -1) * .5 + tri(ph % 1) * .5;
      y += (1 - Math.exp(-2 * Math.PI * (900 + 5000 * Math.exp(-x * 30)) / SR)) * (raw - y);
      const v = y * Math.exp(-x * 18) * .11 * gain;
      put(s + i, v, v, .35);
      put(s + i + Math.round(SR * .375), v * .45, 0, .2); // 3/16 echo left
      put(s + i + Math.round(SR * .75), 0, v * .3, .2);   // 3/8 echo right
    }
  }
}

// ---------- riser ----------
function riser(t0, t1) {
  let lp = 0;
  for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) {
    const k = (i / SR - t0) / (t1 - t0), n = noise() * 2 - 1;
    lp += (1 - Math.exp(-2 * Math.PI * (300 + 9000 * k * k) / SR)) * (n - lp);
    const v = lp * k * k * .28;
    put(i, v, v, .4);
  }
}

// ---------- HUD blips (intro lock-ons, flight-log waypoints) ----------
function blip(t, f = 1800, g = 1) {
  const s0 = Math.round(t * SR);
  for (let i = 0; i < SR * .16; i++) { const x = i / SR, e = Math.exp(-x * 30), v = (Math.sin(2 * Math.PI * f * x) * (x < .05 ? 1 : 0) + Math.sin(2 * Math.PI * f * 1.5 * x) * (x > .06 && x < .1 ? 1 : 0)) * e * .09 * g; put(s0 + i, v * .7, v, .5); }
}
// ---------- bell melody for the leadership breakdown ----------
const BELL = [76, 72, 69, 72, 74, 72, 67, 71];
function bells(t0, t1) {
  for (let t = t0, j = 0; t < t1 - 1e-6; t += B, j++) {
    const f = mtof(BELL[j % BELL.length]), s0 = Math.round(t * SR);
    for (let i = 0; i < SR * 1.6; i++) { const x = i / SR, v = (Math.sin(2 * Math.PI * f * x) + .35 * Math.sin(2 * Math.PI * f * 2.76 * x) * Math.exp(-x * 6)) * Math.exp(-x * 2.4) * .11; put(s0 + i, v * (j % 2 ? .6 : 1), v * (j % 2 ? 1 : .6), .7); }
  }
}

// ---------- arrangement ----------
// Ignition: four lock-on hits (0, .5, 1, 1.5), ignition at 2, soft pulse under the name
[0, .5, 1, 1.5].forEach((t, i) => { kick(t, .7); impact(t, .3); blip(t + .02, 1500 + i * 300); });
impact(2, .9); kick(2);
pad(0, 56.4, .8);
arp(2, 14, .8); arp(18, 53);
for (let t = 4; t < 8 - 1e-6; t += B) kick(t, .55);
riser(6.4, 8);
// Grooves
for (let t = 8; t < 61; t += B) if (inGroove(t)) { kick(t); if (Math.round(t / B) % 2) clap(t); }
for (let t = 8 + B / 2; t < 53; t += B) if (inGroove(t)) hat(t, Math.round(t / B * 2) % 4 === 3);
for (let t = 18; t < 53; t += B / 4) if (inGroove(t) && Math.round(t / (B / 4)) % 2) hat(t);
bass(8, 14); bass(18, 53);
// Leadership breakdown: drums out, bells in, rise back into the flight log
bells(14, 18); riser(16.4, 18);
// Flight-log waypoints
[20, 22, 24, 26, 28].forEach(t => blip(t + .01, 2100, .8));
// AI wink: filtered break, rise into the end card
riser(54.4, 56); arp(53, 56, .5);
CUTS.forEach(t => impact(t, t === 56 ? 1.3 : 1));
for (let t = 56; t < 58 - 1e-6; t += B) kick(t, t === 56 ? 1.2 : .7);
pad(56, DUR, 1.6);
[57, 60, 64, 71, 76].forEach((n, k) => {
  const s0 = Math.round(56 * SR); let ph = 0;
  for (let i = 0; i < SR * 5; i++) { const x = i / SR; ph += mtof(n) / SR; const v = (Math.sin(2 * Math.PI * ph) + .3 * Math.sin(4 * Math.PI * ph)) * Math.exp(-x * .7) * .05; put(s0 + i, v * (k % 2 ? .6 : 1), v * (k % 2 ? 1 : .6), .6); }
});

// ---------- reverb (Schroeder: 4 combs + 2 allpasses per side) ----------
function reverb(inp, out, spread) {
  const combs = [1557, 1617, 1491, 1422].map(d => ({ b: new Float32Array(Math.round((d + spread) * SR / 44100)), i: 0, f: 0 }));
  const aps = [556, 441].map(d => ({ b: new Float32Array(Math.round((d + spread) * SR / 44100)), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.b[c.i]; c.f = y * .75 + c.f * .25; c.b[c.i] = inp[n] * .5 + c.f * .82; c.i = (c.i + 1) % c.b.length; s += y; }
    for (const a of aps) { const y = a.b[a.i]; const v = -s + y; a.b[a.i] = s + y * .5; a.i = (a.i + 1) % a.b.length; s = v; }
    out[n] += s * .16;
  }
}
reverb(RL, L, 0); reverb(RR, R, 23);

// ---------- master: soft clip, fade, normalise ----------
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, f = t > 60.4 ? Math.max(0, 1 - (t - 60.4) / .6) : 1;
  L[i] = Math.tanh(L[i] * 1.2) * f; R[i] = Math.tanh(R[i] * 1.2) * f;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = .89 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4); }
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'music.wav');
fs.writeFileSync(out, buf);
console.log('wrote', out, (N / SR).toFixed(2) + ' s');
