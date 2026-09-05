import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        timezone: true,
        notifyEmail: true,
        notifyCalendar: true,
        notifyTodo: true,
        notifyOverdue: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ preferences: user });
  } catch (error) {
    console.error("Fetch preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      timezone,
      notifyEmail,
      notifyCalendar,
      notifyTodo,
      notifyOverdue,
    } = body;

    const dataToUpdate: any = {};

    if (timezone !== undefined && typeof timezone === "string") {
      dataToUpdate.timezone = timezone.trim();
    }
    if (notifyEmail !== undefined && typeof notifyEmail === "boolean") {
      dataToUpdate.notifyEmail = notifyEmail;
    }
    if (notifyCalendar !== undefined && typeof notifyCalendar === "boolean") {
      dataToUpdate.notifyCalendar = notifyCalendar;
    }
    if (notifyTodo !== undefined && typeof notifyTodo === "boolean") {
      dataToUpdate.notifyTodo = notifyTodo;
    }
    if (notifyOverdue !== undefined && typeof notifyOverdue === "boolean") {
      dataToUpdate.notifyOverdue = notifyOverdue;
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        timezone: true,
        notifyEmail: true,
        notifyCalendar: true,
        notifyTodo: true,
        notifyOverdue: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: updatedUser,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

