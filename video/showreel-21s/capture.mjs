// Frame-by-frame capture: seek(t) on a paused GSAP timeline, one PNG per 1/60 s.
//   node capture.mjs                 -> frames/f_00000.png … (60 fps)
//   node capture.mjs --stills 1.8,4.9  -> snapshots/t_1.80.png …
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FPS = 60, DUR = 61, WORKERS = 6;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const exe = [path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe')].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: exe, args: ['--force-color-profile=srgb', '--disable-gpu-vsync'] });

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('pageerror', e.message));
  page.on('console', m => m.type() === 'error' && console.error('console', m.text()));
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true);
  return page;
}
async function shot(page, t, file) {
  await page.evaluate(t => window.seek(t), t);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
}

const ei = process.argv.indexOf('--eval');
if (ei > 0) { const page = await openPage(); console.log(await page.evaluate(process.argv[ei + 1])); await browser.close(); server.close(); process.exit(0); }
const si = process.argv.indexOf('--stills');
if (si > 0) {
  fs.mkdirSync(path.join(ROOT, 'snapshots'), { recursive: true });
  const page = await openPage();
  for (const t of process.argv[si + 1].split(',').map(Number)) {
    await shot(page, t, path.join(ROOT, 'snapshots', `t_${t.toFixed(2)}.png`));
    console.log('still', t);
  }
} else {
  const dir = path.join(ROOT, 'frames');
  const ri = process.argv.indexOf('--range'), [ra, rb] = ri > 0 ? process.argv[ri + 1].split(',').map(Number) : [0, DUR];
  if (ri < 0) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const first = Math.round(ra * FPS), total = Math.round(rb * FPS), t0 = Date.now();
  let done = 0;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await openPage();
    for (let i = first + w; i < total; i += WORKERS) {
      await shot(page, i / FPS, path.join(dir, `f_${String(i).padStart(5, '0')}.png`));
      if (++done % 120 === 0) console.log(`${done}/${total} frames · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }));
  console.log(`captured ${total - first} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await browser.close();
server.close();
