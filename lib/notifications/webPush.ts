import webpush from "web-push";
import { prisma } from "@/lib/db/prisma";

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  "BGjznhNFJbfrXn8Gdol2B9cNlt8j7ZBnZmTr9M82mZi5xTwwWKaPw6d867WU2KceFtI3ndTCoahCOGk6vj8zJT0";

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "N43bZ2xbuwM3rHV3GvisZYW5cAQgO9TZP92FYp95HQE";

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:contact@daydream.app";

// Initialize VAPID configuration
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (err) {
  console.error("[WebPush] Failed to configure VAPID details:", err);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  category?: "task" | "calendar" | "bucket" | "expense" | "daily" | "system";
  url?: string;
}

/**
 * Returns the public VAPID key for client subscriptions
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

/**
 * Checks whether the current time in the user's timezone is within quiet hours.
 */
export function isQuietHoursNow(user: {
  quietHoursEnabled?: boolean | null;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  timezone?: string | null;
}): boolean {
  if (!user.quietHoursEnabled || !user.quietHoursStart || !user.quietHoursEnd) {
    return false;
  }

  try {
    const tz = user.timezone || "UTC";
    const now = new Date();
    const userTimeStr = now.toLocaleTimeString("en-GB", {
      timeZone: tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const [nowH, nowM] = userTimeStr.split(":").map(Number);
    const nowMinutes = nowH * 60 + nowM;

    const [startH, startM] = user.quietHoursStart.split(":").map(Number);
    const startMinutes = startH * 60 + startM;

    const [endH, endM] = user.quietHoursEnd.split(":").map(Number);
    const endMinutes = endH * 60 + endM;

    // e.g. 22:00 to 07:00 (spans midnight)
    if (startMinutes > endMinutes) {
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    } else {
      // e.g. 01:00 to 06:00
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }
  } catch (err) {
    console.error("[WebPush] Error calculating quiet hours:", err);
    return false;
  }
}

/**
 * Sends a Web Push notification to all active devices of a user,
 * respecting user preferences, category controls, and quiet hours.
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushPayload,
  options?: { isCritical?: boolean; category?: string }
): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      include: {
        pushSubscriptions: true,
      },
    });

    if (!user) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }

    // 1. Master toggle check
    if (user.notificationsEnabled === false) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }

    // 2. Category preference check
    const cat = options?.category || payload.category;
    if (cat === "task" && user.notifyTodo === false) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }
    if (cat === "calendar" && user.notifyCalendar === false) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }
    if (cat === "bucket" && user.notifyBucketList === false) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }
    if (cat === "expense" && user.notifyExpenses === false) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }
    if (cat === "daily" && user.notifyDaily === false) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }

    // 3. Quiet hours check (unless marked as critical)
    if (!options?.isCritical && isQuietHoursNow(user)) {
      console.log(`[WebPush] Suppressing non-critical notification during quiet hours for user ${userId}`);
      return { success: false, sentCount: 0, failedCount: 0 };
    }

    const subscriptions = user.pushSubscriptions || [];
    if (subscriptions.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 };
    }

    let sentCount = 0;
    let failedCount = 0;
    const deadSubscriptionIds: string[] = [];

    const jsonPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon.svg",
      badge: payload.badge || "/icon.svg",
      tag: payload.tag || "daydream-" + (payload.category || "general"),
      category: payload.category || "general",
      url: payload.url || "/home",
    });

    await Promise.all(
      subscriptions.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, jsonPayload, {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: options?.isCritical ? "high" : "normal",
          });
          sentCount++;
        } catch (err: any) {
          console.error(`[WebPush] Delivery failure for endpoint ${sub.endpoint.slice(0, 30)}...:`, err?.statusCode || err?.message);
          failedCount++;

          // If the subscription is no longer valid or unsubscribed by user
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            deadSubscriptionIds.push(sub.id);
          }
        }
      })
    );

    // Clean up expired/invalid subscriptions
    if (deadSubscriptionIds.length > 0) {
      try {
        await (prisma as any).pushSubscription.deleteMany({
          where: { id: { in: deadSubscriptionIds } },
        });
        console.log(`[WebPush] Cleaned up ${deadSubscriptionIds.length} expired push subscriptions.`);
      } catch (cleanErr) {
        console.error("[WebPush] Failed to clean expired subscriptions:", cleanErr);
      }
    }

    return { success: sentCount > 0, sentCount, failedCount };
  } catch (err) {
    console.error("[WebPush] Error sending push notification:", err);
    return { success: false, sentCount: 0, failedCount: 0 };
  }
}

/**
 * Sends a push notification to an individual subscription (e.g. for testing)
 */
export async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const jsonPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon.svg",
      badge: payload.badge || "/icon.svg",
      tag: payload.tag || "daydream-test",
      category: payload.category || "system",
      url: payload.url || "/home",
    });

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      jsonPayload,
      {
        TTL: 60 * 60,
        urgency: "high",
      }
    );

    return { success: true };
  } catch (err: any) {
    console.error("[WebPush] Direct push delivery failed:", err?.statusCode || err?.message);
    return { success: false, error: err?.message || "Push delivery failed" };
  }
}

