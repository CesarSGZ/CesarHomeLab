// Mixes music.wav with Pixabay-licensed SFX (bundled with the HyperFrames media-use skill) into soundtrack.wav.
// Every cue time matches a cut or beat in index.html. Usage: node audio/mix.mjs <path-to-sfx-dir>
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const sfxSource = process.argv[2];
const sfxDir = join(here, 'sfx');
mkdirSync(sfxDir, { recursive: true });

// [seconds, file, gain]
const cues = [
  [0.05, 'glitch-1.mp3', .35],
  ...[0.5, 1, 1.5, 2, 2.5, 3].map(t => [t, 'key-press.mp3', .55]),
  [3.5, 'click-soft.mp3', .5],
  [4.0, 'impact-bass-1.mp3', .9],
  [6.0, 'whoosh-short.mp3', .45],
  [8.0, 'whoosh.mp3', .5],
  ...[8.5, 9.5, 10.5, 11.5, 12.5, 13.5].map(t => [t, 'pop.mp3', .5]),
  [16.0, 'whoosh-short.mp3', .5],
  ...[16.5, 17, 17.5, 18, 18.5].map(t => [t, 'click.mp3', .45]),
  [20.0, 'whoosh-cinematic.mp3', .45],
  [24.0, 'impact-bass-2.mp3', .85],
  ...[26, 28, 30].map(t => [t, 'whoosh-short.mp3', .4]),
  [32.0, 'glitch-2.mp3', .3],
  ...[32.6, 33.6, 34.6].map(t => [t, 'impact-bass-1.mp3', .35]),
  [36.0, 'impact-bass-2.mp3', .8],
  [36.6, 'sparkle.mp3', .45],
  [37.3, 'chime.mp3', .35],
];

const files = [...new Set(cues.map(c => c[1]))];
if (sfxSource) files.forEach(f => copyFileSync(join(sfxSource, f), join(sfxDir, f)));

const args = ['-y', '-v', 'error', '-i', join(here, 'music.wav')];
cues.forEach(([, file]) => args.push('-i', join(sfxDir, file)));
const chains = cues.map(([t, , g], i) => `[${i + 1}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${g},adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[s${i}]`);
const mix = `[0:a]volume=0.62[m];[m]${cues.map((_, i) => `[s${i}]`).join('')}amix=inputs=${cues.length + 1}:normalize=0:duration=first,atrim=0:40,loudnorm=I=-14:TP=-1.5:LRA=9[out]`;
args.push('-filter_complex', [...chains, mix].join(';'), '-map', '[out]', '-ar', '44100', '-ac', '2', join(here, 'soundtrack.wav'));
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log(`soundtrack.wav mixed with ${cues.length} cues`);
