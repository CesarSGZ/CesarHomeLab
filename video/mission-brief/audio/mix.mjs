// Masters music.wav into soundtrack.wav for the composition: synthwave only, no sound effects.
// Usage: node audio/make-music.mjs && node audio/mix.mjs
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', join(here, 'music.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '44100', '-ac', '2', join(here, 'soundtrack.wav')], { stdio: 'inherit' });
console.log('soundtrack.wav mastered to -14 LUFS');
