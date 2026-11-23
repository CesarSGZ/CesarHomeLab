// Tareas offline: the app shell is kept so the icon opens without signal; the lists themselves come from the
// copy todo.js keeps on the phone, and changes wait in its queue. API calls are never cached here.
const CACHE = 'tareas-v20261123c';
const SHELL = ['/control/tareas/', '/control/todo.js?v=20261123c', '/control/todo.css?v=20261123b', '/control/todo-model.js?v=20261123b', '/theme.js?v=20261007night'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tareas-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/control/api/')) return;
  if (!SHELL.includes(url.pathname + url.search) && url.pathname !== '/control/tareas/index.html') return;
  // Network first, so a new version shows at once; the cached shell only when there is no signal.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && !r.redirected) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: false }).then(r => r || caches.match('/control/tareas/'))));
});
