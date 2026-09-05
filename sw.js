const CACHE = 'neuro-calcul-v1';
const ASSETS = [
  '/neuro-calcul/',
  '/neuro-calcul/index.html',
  '/neuro-calcul/manifest.json',
  '/neuro-calcul/icon-192.png',
  '/neuro-calcul/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === 'https://firestore.googleapis.com' ||
      url.origin === 'https://www.googleapis.com' ||
      url.origin === 'https://identitytoolkit.googleapis.com' ||
      url.origin === 'https://securetoken.googleapis.com' ||
      url.pathname.startsWith('/google.firestore')) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
