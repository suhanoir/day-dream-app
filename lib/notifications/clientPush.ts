/**
 * DayDream Notification System - Client-side Web Push Helper
 * Provides capability detection, Service Worker registration, subscription
 * management, and test push triggers.
 */

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Converts a URL-safe Base64 string to a Uint8Array for PushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker (`/sw.js`) if not already active
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error("[PushClient] Failed to register service worker:", err);
    return null;
  }
}

/**
 * Retrieves the current push subscription on this device, if any.
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.error("[PushClient] Failed to get existing subscription:", err);
    return null;
  }
}

/**
 * Initiates the user permission flow and subscribes the current browser to Web Push.
 * Note: Must be invoked in response to a user action (e.g. click).
 */
export async function subscribeToPush(
  providedVapidKey?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return {
      success: false,
      error: "Push notifications are not supported in this browser.",
    };
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error:
          permission === "denied"
            ? "Notifications were blocked in your browser settings. Please enable them in your address bar to receive alerts."
            : "Notification permission was not granted.",
      };
    }

    // 2. Fetch public VAPID key if not provided
    let vapidKey = providedVapidKey;
    if (!vapidKey) {
      const res = await fetch("/api/notifications/vapid-public-key");
      if (!res.ok) {
        throw new Error("Failed to fetch VAPID key from server.");
      }
      const data = await res.json();
      vapidKey = data.publicKey;
    }

    if (!vapidKey) {
      throw new Error("Missing public VAPID key.");
    }

    // 3. Register SW and get ready
    const reg = await registerServiceWorker();
    if (!reg) {
      throw new Error("Unable to register service worker.");
    }

    // 4. Subscribe to PushManager
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    // 5. Send subscription to DayDream backend
    const subJSON = subscription.toJSON();
    const saveRes = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJSON.endpoint,
        keys: subJSON.keys,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      }),
    });

    if (!saveRes.ok) {
      const errData = await saveRes.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to register subscription on server.");
    }

    return { success: true };
  } catch (err: any) {
    console.error("[PushClient] Subscribe error:", err);
    return { success: false, error: err.message || "Failed to subscribe to push notifications." };
  }
}

/**
 * Unsubscribes the current browser device from Web Push and removes it from backend.
 */
export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) return { success: true };

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Notify backend to remove this device
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      }).catch((e) => console.warn("[PushClient] Failed to remove subscription on server:", e));
    }

    return { success: true };
  } catch (err: any) {
    console.error("[PushClient] Unsubscribe error:", err);
    return { success: false, error: err.message || "Failed to unsubscribe." };
  }
}

/**
 * Sends a test push notification to verify push delivery.
 */
export async function sendTestPush(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/notifications/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to dispatch test notification.",
      };
    }

    return {
      success: true,
      message: data.message || "Test notification dispatched!",
    };
  } catch (err: any) {
    console.error("[PushClient] Test push error:", err);
    return { success: false, error: err.message || "Network error sending test push." };
  }
}
