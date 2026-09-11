import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// POST /api/notifications/subscribe - Store a Web Push subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription payload. Endpoint and keys are required." },
        { status: 400 }
      );
    }

    // Save or update subscription for this user
    await (prisma as any).pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
    });

    // Automatically ensure notificationsEnabled is true when user subscribes
    await (prisma as any).user.update({
      where: { id: session.userId },
      data: { notificationsEnabled: true },
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription registered successfully.",
    });
  } catch (error: any) {
    console.error("[Subscribe Error] Failed to save push subscription:", error);
    return NextResponse.json(
      { error: "Failed to save push subscription." },
      { status: 500 }
    );
  }
}

