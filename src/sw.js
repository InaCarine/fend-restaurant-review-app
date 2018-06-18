const cacheVersion = 1.1;
const staticCacheName = 'rr-' + cacheVersion;

/*
* Install the service worker and cache the neccessary files
*/
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        '/',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'data/restaurants.json',
        'css/styles.css',
        'https://fonts.googleapis.com/css?family=Open+Sans:200,400,600',
      ]);
    })
  );
});

/*
* Activates the new service worker and deletes any caches that is not needed
*/
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('rr-') &&
            cacheName != staticCacheName;
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

/*
* The service worker will handle the request by first checking if it is in the cache
* If it isn't request it through the network and cache it for next time
*/
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // If the request is already in the cache,
        // return the cached data
        if (response) {
          return response;
        }

        // Clone the reuest for further use?
        const fetchRequest = event.request.clone();

        // If the requested data wasn't in the cache
        // Request it from the server
        return fetch(fetchRequest).then(
          function (response) {
            // If there was an error return the response
            if (!response || response.status !== 200 || response.type !== 'basic' || fetchRequest.method === "POST" ) {
              return response;
            }

            // Clone the response again
            const responseToCache = response.clone();

            // Then open the given cache and add the new data, then return the data
            caches.open(staticCacheName)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Tell the waiting service worker to skip waiting and become the active one
self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});