import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

// GET /api/notifications - List user's notifications (pending and sent)
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await (prisma as any).notification.findMany({
      where: { userId: session.userId },
      orderBy: { scheduledFor: "desc" },
      take: 20,
    });

    const pendingCount = notifications.filter(
      (n: any) => n.status === "PENDING"
    ).length;

    return NextResponse.json({
      notifications,
      pendingCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Clear sent/failed notifications
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await (prisma as any).notification.deleteMany({
        where: { id, userId: session.userId },
      });
    } else {
      // Clear all sent or cancelled notifications for this user
      await (prisma as any).notification.deleteMany({
        where: {
          userId: session.userId,
          status: { in: ["SENT", "CANCELLED", "FAILED"] },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notifications error:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}

