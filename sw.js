var C = 'lockin-v10', T = 3500;
var F = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) {
    return c.addAll(F.slice(0, 2)).then(function () { return Promise.all(F.slice(2).map(function (f) { return c.add(f).catch(function () {}); })); });
  }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); })); self.clients.claim(); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  var hit = function () { return caches.match(e.request, { ignoreSearch: true }); };
  e.respondWith(new Promise(function (res) {
    var sent = false, send = function (r) { if (!sent && r) { sent = true; res(r); } };
    var t = setTimeout(function () { hit().then(send); }, T);
    fetch(e.request).then(function (r) {
      clearTimeout(t);
      if (r.ok) { var cp = r.clone(); caches.open(C).then(function (c) { return c.put(e.request, cp); }).catch(function () {}); }
      send(r);
    }).catch(function () { clearTimeout(t); hit().then(function (m) { send(m || Response.error()); }); });
  }));
});
