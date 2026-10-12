// 60 fps PNG frames -> 30 fps MP4 with frame blending (motion blur), highlight bloom, fine grain and the synth track.
//   node render.mjs  ->  renders/cesar-solla-mission-brief.mp4
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(ROOT, 'renders'), { recursive: true });
const out = path.join(ROOT, 'renders', 'cesar-solla-mission-brief.mp4');

const vf = [
  // blend each pair of 60 fps frames into one 30 fps frame (180° shutter motion blur)
  "[0:v]tmix=frames=2:weights='1 1',fps=30,format=gbrp,split[a][b]",
  // bloom: isolate highlights, blur wide, screen back on top
  '[b]colorlevels=rimin=0.6:gimin=0.6:bimin=0.6,gblur=sigma=28[g]',
  '[a][g]blend=all_mode=screen:all_opacity=0.55,format=yuv420p,noise=c0s=5:c0f=t[v]',
].join(';');

const args = [
  '-y', '-hide_banner', '-loglevel', 'warning', '-stats',
  '-framerate', '60', '-i', path.join(ROOT, 'frames', 'f_%05d.png'),
  '-i', path.join(ROOT, 'audio', 'music.wav'),
  '-filter_complex', vf, '-map', '[v]', '-map', '1:a',
  '-af', 'loudnorm=I=-14:TP=-1:LRA=7,aresample=48000',
  '-t', '61',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out,
];
const run = a => { const r = spawnSync('ffmpeg', a, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status ?? 1); };
run(args);
console.log('wrote', out);

// Web cut for the portfolio: bitrate-capped to stay under Cloudflare Pages' 25 MiB file limit, plus a poster.
const web = path.join(ROOT, 'renders', 'cesar-solla-mission-brief-web.mp4');
const poster = path.join(ROOT, 'renders', 'cesar-solla-mission-brief-poster.jpg');
run(['-y', '-hide_banner', '-loglevel', 'warning', '-i', out, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
  '-maxrate', '2900k', '-bufsize', '5800k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', web]);
run(['-y', '-hide_banner', '-loglevel', 'warning', '-ss', '5.4', '-i', out, '-frames:v', '1', '-update', '1', '-vf', 'scale=1280:-2', '-q:v', '3', poster]);
console.log('wrote', web, `${(fs.statSync(web).size / 1048576).toFixed(1)} MiB`);
