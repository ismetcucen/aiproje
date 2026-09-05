self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('OHEP AI Studio Service Worker Aktif!');
});

self.addEventListener('fetch', (e) => {
  // Basit pass-through, PWA kurulum gereksinimini karsilamak icin yeterli.
});
