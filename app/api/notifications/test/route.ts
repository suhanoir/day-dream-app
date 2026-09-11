import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { sendPushNotificationToUser } from "@/lib/notifications/webPush";

// POST /api/notifications/test - Dispatch a real test push notification
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await (prisma as any).pushSubscription.findMany({
      where: { userId: session.userId },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        {
          error: "No active push subscriptions found on this account. Please enable notifications first.",
          hasSubscription: false,
        },
        { status: 400 }
      );
    }

    const result = await sendPushNotificationToUser(
      session.userId,
      {
        title: "DayDream is ready.",
        body: "Push notifications are working smoothly on this device.",
        icon: "/icon.svg",
        badge: "/icon.svg",
        category: "system",
        url: "/home",
      },
      { isCritical: true } // Bypass quiet hours for manual user test
    );

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully.",
      sentCount: result.sentCount,
    });
  } catch (error: any) {
    console.error("[Test Notification Error]:", error);
    return NextResponse.json(
      { error: "Failed to dispatch test notification." },
      { status: 500 }
    );
  }
}

