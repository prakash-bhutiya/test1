const CACHE_NAME = 'rms-app-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './router.js',
    './store.js',
    './view_login.js',
    './view_dashboard.js',
    './view_savings.js',
    './view_loans.js',
    './view_profile.js',
    './view_member_detail.js',
    './view_members.js',
    './view_data_import.js',
    'https://unpkg.com/@phosphor-icons/web'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
