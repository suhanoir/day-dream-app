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
        notificationsEnabled: true,
        notifyEmail: true,
        notifyCalendar: true,
        notifyTodo: true,
        notifyOverdue: true,
        notifyBucketList: true,
        notifyExpenses: true,
        notifyDaily: true,
        taskReminderTiming: true,
        eventReminderTiming: true,
        quietHoursEnabled: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        _count: {
          select: { pushSubscriptions: true },
        },
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
      notificationsEnabled,
      notifyEmail,
      notifyCalendar,
      notifyTodo,
      notifyOverdue,
      notifyBucketList,
      notifyExpenses,
      notifyDaily,
      taskReminderTiming,
      eventReminderTiming,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    } = body;

    const dataToUpdate: any = {};

    if (timezone !== undefined && typeof timezone === "string") {
      dataToUpdate.timezone = timezone.trim();
    }
    if (notificationsEnabled !== undefined && typeof notificationsEnabled === "boolean") {
      dataToUpdate.notificationsEnabled = notificationsEnabled;
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
    if (notifyBucketList !== undefined && typeof notifyBucketList === "boolean") {
      dataToUpdate.notifyBucketList = notifyBucketList;
    }
    if (notifyExpenses !== undefined && typeof notifyExpenses === "boolean") {
      dataToUpdate.notifyExpenses = notifyExpenses;
    }
    if (notifyDaily !== undefined && typeof notifyDaily === "boolean") {
      dataToUpdate.notifyDaily = notifyDaily;
    }
    if (taskReminderTiming !== undefined && typeof taskReminderTiming === "string") {
      dataToUpdate.taskReminderTiming = taskReminderTiming.trim();
    }
    if (eventReminderTiming !== undefined && typeof eventReminderTiming === "string") {
      dataToUpdate.eventReminderTiming = eventReminderTiming.trim();
    }
    if (quietHoursEnabled !== undefined && typeof quietHoursEnabled === "boolean") {
      dataToUpdate.quietHoursEnabled = quietHoursEnabled;
    }
    if (quietHoursStart !== undefined && typeof quietHoursStart === "string") {
      dataToUpdate.quietHoursStart = quietHoursStart.trim();
    }
    if (quietHoursEnd !== undefined && typeof quietHoursEnd === "string") {
      dataToUpdate.quietHoursEnd = quietHoursEnd.trim();
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        timezone: true,
        notificationsEnabled: true,
        notifyEmail: true,
        notifyCalendar: true,
        notifyTodo: true,
        notifyOverdue: true,
        notifyBucketList: true,
        notifyExpenses: true,
        notifyDaily: true,
        taskReminderTiming: true,
        eventReminderTiming: true,
        quietHoursEnabled: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        _count: {
          select: { pushSubscriptions: true },
        },
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

