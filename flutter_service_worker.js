'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "bb800c3df594af61459847eb341641de",
"version.json": "78bb05588556bde1292494918b562cbe",
"index.html": "13ae5566daf7282e625585524ee47d24",
"/": "13ae5566daf7282e625585524ee47d24",
"main.dart.js": "df697728a767048bde7e4b288bb178c1",
"flutter.js": "888483df48293866f9f41d3d9274a779",
"favicon.png": "f75131be7a534bf186783cec23c13a00",
"icons/Icon-192.png": "f75131be7a534bf186783cec23c13a00",
"icons/Icon-maskable-192.png": "f75131be7a534bf186783cec23c13a00",
"icons/Icon-maskable-512.png": "c1d5b806a1ea66cc01d7ad1e4a30b598",
"icons/Icon-512.png": "c1d5b806a1ea66cc01d7ad1e4a30b598",
"manifest.json": "4526fbf96c6c8a10de489b56f44b0ba5",
"assets/AssetManifest.json": "f8d5f3f7ded92357a00c1866748ef699",
"assets/NOTICES": "0133dee9ad3e9ddca2fb50c2cb362bf3",
"assets/FontManifest.json": "da6d191a04c56bcb5f889eaece6ee4a3",
"assets/AssetManifest.bin.json": "4cc67fd97e6fccf5f9a880dca5508b95",
"assets/packages/fluttertoast/assets/toastify.js": "56e2c9cedd97f10e7e5f1cebd85d53e3",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "b63ceece370003eed3664e126d5de185",
"assets/fonts/MaterialIcons-Regular.otf": "064e3d8bbd6345d611d2442235bd429f",
"assets/assets/images/zodiac_2.png": "27a0e877d63eb0fea945859ffaec05fc",
"assets/assets/images/zodiac_1.png": "a444e8c321dfcf9e574b3115a5a93211",
"assets/assets/images/bottom_left_blur.png": "7e08601579a184953bf34b78c14639b3",
"assets/assets/images/home_background.png": "bbf56f4f8c5cfa2c44286d253ee134ac",
"assets/assets/images/top_right_blur.png": "1d1d2d684a3f864a9056cfed26d296d2",
"assets/assets/images/home_stella_mobile.png": "90d4fdece03017c0571b980fe222b388",
"assets/assets/images/what_we_guide_2.jpg": "7bcf742d152df1525f6848c369caa273",
"assets/assets/images/what_we_guide_3.jpg": "c4d951821bc8f873fcba26d551a87fcc",
"assets/assets/images/what_we_guide_1.jpg": "6704ac6d2c606c969532d3c097cb0a70",
"assets/assets/images/mountain.png": "7a0e9ef93090a588561d13936e66b638",
"assets/assets/images/home_stella_desktop.png": "907fad7db7c443ad843e1314dceb64ac",
"assets/assets/svgs/logo.svg": "062f6f0beddb92dde3525a476899a28a",
"assets/assets/svgs/stella.svg": "c1b31af340617947ba0fce5e7bb63162",
"assets/assets/fonts/Volte-Light.otf": "1c645194654046371409b67bce784edf",
"assets/assets/fonts/CormorantGaramond-Light.otf": "c3b429459f5e8c1ca9c6b3d3805605eb",
"assets/assets/fonts/Volte-Medium.otf": "279393dc51c519819b32b9162aba660a",
"assets/assets/fonts/CormorantGaramond-Medium.otf": "0bfd4d100ea0cbd743a5f68dbf2dc887",
"assets/assets/fonts/Volte-Regular.otf": "90fcc5a67feb57d018c492c22d972ed8",
"assets/assets/fonts/CormorantGaramond-Bold.otf": "4b37bf9c342ec45399ef30bf1fe7ce1c",
"assets/assets/translations/en.json": "28b0b0143daabb04bb956afcf3e4e45a",
"assets/assets/translations/ko.json": "852e408cf8955ecc1b04e21a79e5f245",
"canvaskit/skwasm.js": "1ef3ea3a0fec4569e5d531da25f34095",
"canvaskit/skwasm_heavy.js": "413f5b2b2d9345f37de148e2544f584f",
"canvaskit/skwasm.js.symbols": "0088242d10d7e7d6d2649d1fe1bda7c1",
"canvaskit/canvaskit.js.symbols": "58832fbed59e00d2190aa295c4d70360",
"canvaskit/skwasm_heavy.js.symbols": "3c01ec03b5de6d62c34e17014d1decd3",
"canvaskit/skwasm.wasm": "264db41426307cfc7fa44b95a7772109",
"canvaskit/chromium/canvaskit.js.symbols": "193deaca1a1424049326d4a91ad1d88d",
"canvaskit/chromium/canvaskit.js": "5e27aae346eee469027c80af0751d53d",
"canvaskit/chromium/canvaskit.wasm": "24c77e750a7fa6d474198905249ff506",
"canvaskit/canvaskit.js": "140ccb7d34d0a55065fbd422b843add6",
"canvaskit/canvaskit.wasm": "07b9f5853202304d3b0749d9306573cc",
"canvaskit/skwasm_heavy.wasm": "8034ad26ba2485dab2fd49bdd786837b"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
