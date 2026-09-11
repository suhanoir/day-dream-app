// DayDream Service Worker — Web Push & PWA
// Version: 2.12.0

self.addEventListener("install", (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim clients immediately
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  try {
    const payload = event.data.json();
    const title = payload.title || "DayDream";
    const options = {
      body: payload.body || payload.message || "You have a new reminder from DayDream.",
      icon: payload.icon || "/icon.svg",
      badge: payload.badge || "/icon.svg",
      tag: payload.tag || "daydream-notification",
      renotify: payload.renotify !== undefined ? payload.renotify : true,
      data: {
        url: (payload.data && payload.data.url) || payload.url || "/home",
        category: (payload.data && payload.data.category) || payload.category || "general",
        timestamp: Date.now(),
      },
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[DayDream SW] Push payload parse error:", err);
    // Fallback to text payload if not JSON
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("DayDream", {
        body: text,
        icon: "/icon.svg",
        badge: "/icon.svg",
        data: { url: "/home" },
      })
    );
  }
});

// Handle notification click to navigate to the target section
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/home";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an existing DayDream window is open, focus and navigate it
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            if ("navigate" in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }
        // If no open client exists, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

