// Offline-Speicher: alle Dateien der App bleiben auf dem Tablet, damit sie ohne WLAN läuft.
const STAND = 'lernwelt-3';
const DATEIEN = ['./', 'index.html', 'inhalte.js', 'app.js', 'manifest.json', 'icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(STAND).then(c => c.addAll(DATEIEN))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== STAND && n !== 'lernwelt-ton').map(n => caches.delete(n))))); self.clients.claim(); });
// Erst aus dem Netz (damit Neuerungen ankommen), ohne Netz aus dem Speicher.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Sprachaufnahmen ändern sich nicht: zuerst aus dem Speicher, sonst ganz laden und merken
  if (e.request.url.indexOf('/ton/') > 0 && e.request.url.indexOf('index.json') < 0) {
    e.respondWith(caches.open('lernwelt-ton').then(c => c.match(e.request.url).then(m => m || fetch(e.request.url).then(r => { if (r.status === 200) c.put(e.request.url, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(STAND).then(c => c.put(e.request, k)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
