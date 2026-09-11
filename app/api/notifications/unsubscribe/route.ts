import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// POST /api/notifications/unsubscribe - Remove a Web Push subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { endpoint } = body;

    if (endpoint) {
      await (prisma as any).pushSubscription.deleteMany({
        where: {
          endpoint,
          userId: session.userId,
        },
      });
    } else {
      // Unsubscribe all devices for this user
      await (prisma as any).pushSubscription.deleteMany({
        where: { userId: session.userId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully.",
    });
  } catch (error: any) {
    console.error("[Unsubscribe Error] Failed to remove push subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription." },
      { status: 500 }
    );
  }
}

