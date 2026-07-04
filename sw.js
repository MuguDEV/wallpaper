const CACHE_NAME = 'wllpr-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './algorithms.js',
    './palettes.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Cache hit
                }
                return fetch(event.request);
            })
    );
});
