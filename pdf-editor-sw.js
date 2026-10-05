const CACHE = 'champs-pdf-v3';
const ASSETS = [
  'pdf-editor.html',
  'pdf-editor-manifest.json',
  'pdf-assets/pdf.min.js',
  'pdf-assets/pdf.worker.min.js',
  'pdf-assets/pdf-lib.min.js',
  'pdf-assets/pdf-icon-192.png',
  'pdf-assets/pdf-icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// App code (HTML/JSON/navigations) → network-first so new deploys load immediately.
// Heavy static libs/fonts/icons → stale-while-revalidate (fast, refreshed in background).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isAppShell = req.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    /\.(html|json)$/.test(url.pathname);

  if (isAppShell) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok && sameOrigin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req).then(c => c || caches.match('pdf-editor.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
