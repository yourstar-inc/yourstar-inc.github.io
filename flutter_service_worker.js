/*
 * Service-worker kill switch for the retired Flutter web build.
 *
 * The old Flutter site registered `flutter_service_worker.js?v=2379440644`
 * at scope "/". Browsers of returning visitors keep that worker and its
 * caches, and could keep serving the stale Flutter app. On their next visit
 * the browser re-fetches this URL (GitHub Pages ignores the query string),
 * finds this new script and installs it in place of the old one. It then:
 *   1. activates immediately (skipWaiting),
 *   2. deletes every Cache Storage entry the Flutter worker created,
 *   3. unregisters itself, so no service worker remains for this origin,
 *   4. reloads open tabs so they load the static site straight from the network.
 * It has no fetch handler, so it never intercepts requests.
 *
 * Keep this file published for a few months (until roughly 2027-01), then delete it.
 */
'use strict';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (key) { return caches.delete(key); }));
    } catch (e) { /* ignore */ }

    var windows = [];
    try {
      windows = await self.clients.matchAll({ type: 'window' });
    } catch (e) { /* ignore */ }

    try {
      await self.registration.unregister();
    } catch (e) { /* ignore */ }

    windows.forEach(function (client) {
      try {
        if (client && 'navigate' in client) {
          client.navigate(client.url).catch(function () {});
        }
      } catch (e) { /* ignore */ }
    });
  })());
});
