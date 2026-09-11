// DayDream Service Worker — PWA Application Shell
// Version: 2.13.0

self.addEventListener("install", (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim clients immediately
  event.waitUntil(self.clients.claim());
});

