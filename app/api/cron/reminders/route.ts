import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendCalendarReminderEmail,
  sendTodoReminderEmail,
  sendOverdueReminderEmail,
} from "@/lib/email/send";

// Helper to run background reminder sweep
async function processDueReminders() {
  const now = new Date();

  // Find all pending notifications due now or in the past
  const dueNotifications = await (prisma as any).notification.findMany({
    where: {
      status: "PENDING",
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      user: true,
      event: true,
      todoTask: true,
    },
    take: 50, // Batch limit for safety
  });

  const results = {
    total: dueNotifications.length,
    sent: 0,
    failed: 0,
    cancelled: 0,
  };

  for (const notification of dueNotifications) {
    const { user, event, todoTask, type } = notification;

    // If user deleted or disabled all email notifications
    if (!user || user.notifyEmail === false) {
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { status: "CANCELLED" },
      });
      results.cancelled++;
      continue;
    }

    if (type === "CALENDAR_REMINDER") {
      // If user disabled calendar reminders or event was deleted
      if (!user.notifyCalendar || !event) {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "CANCELLED" },
        });
        results.cancelled++;
        continue;
      }

      const sendResult = await sendCalendarReminderEmail({
        name: user.name || "Adventurer",
        email: user.email,
        eventTitle: event.title,
        date: event.date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        time: event.startTime,
        location: event.location,
        category: event.category,
      });

      if (sendResult.success) {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        results.sent++;
      } else {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "FAILED" },
        });
        results.failed++;
      }
    } else if (type === "TODO_REMINDER") {
      // If user disabled todo reminders or task was completed/deleted
      if (!user.notifyTodo || !todoTask || todoTask.completed) {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "CANCELLED" },
        });
        results.cancelled++;
        continue;
      }

      const sendResult = await sendTodoReminderEmail({
        name: user.name || "Adventurer",
        email: user.email,
        taskTitle: todoTask.title,
        dueDate: todoTask.date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        dueTime: todoTask.dueTime,
        category: todoTask.category,
        priority: todoTask.priority,
      });

      if (sendResult.success) {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        results.sent++;
      } else {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "FAILED" },
        });
        results.failed++;
      }
    } else {
      // Unsupported or generic
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { status: "CANCELLED" },
      });
      results.cancelled++;
    }
  }

  // Also check for overdue tasks (sent at most once per task)
  try {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const overdueTasks = await (prisma as any).todoTask.findMany({
      where: {
        completed: false,
        date: {
          lte: yesterday,
        },
        user: {
          notifyEmail: true,
          notifyOverdue: true,
        },
        notifications: {
          none: {
            type: "OVERDUE_REMINDER",
          },
        },
      },
      include: {
        user: true,
      },
      take: 10,
    });

    for (const task of overdueTasks) {
      if (!task.user || !task.user.email) continue;

      const sendRes = await sendOverdueReminderEmail({
        name: task.user.name || "Adventurer",
        email: task.user.email,
        taskTitle: task.title,
        originalDueDate: task.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        taskId: task.id,
      });

      await (prisma as any).notification.create({
        data: {
          userId: task.userId,
          todoTaskId: task.id,
          type: "OVERDUE_REMINDER",
          title: `Still pending: ${task.title}`,
          message: `Task was not marked completed.`,
          scheduledFor: now,
          sentAt: sendRes.success ? now : null,
          status: sendRes.success ? "SENT" : "FAILED",
        },
      });

      if (sendRes.success) results.sent++;
      else results.failed++;
    }
  } catch (overdueErr) {
    console.error("[Cron Error] Overdue tasks sweep failed:", overdueErr);
  }

  return results;
}

// GET /api/cron/reminders - Triggered by Vercel Cron or local testing
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow local development without secret or check Bearer token if CRON_SECRET is set
    if (
      process.env.NODE_ENV === "production" &&
      cronSecret &&
      authHeader !== `Bearer ${cronSecret}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await processDueReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("[Cron Error] Reminder processor failed:", error);
    return NextResponse.json(
      { error: "Reminder processor error", message: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/cron/reminders - Also allow POST for webhook / testing triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
