import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendCalendarReminderEmail,
  sendTodoReminderEmail,
  sendOverdueReminderEmail,
} from "@/lib/email/send";
import { sendPushNotificationToUser } from "@/lib/notifications/webPush";

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

    // If user deleted or disabled all notifications
    if (!user || (user.notificationsEnabled === false && user.notifyEmail === false)) {
      await (prisma as any).notification.update({
        where: { id: notification.id },
        data: { status: "CANCELLED" },
      });
      results.cancelled++;
      continue;
    }

    if (type === "CALENDAR_REMINDER") {
      // If event was deleted or user disabled calendar reminders
      if (!event || (user.notifyCalendar === false)) {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "CANCELLED" },
        });
        results.cancelled++;
        continue;
      }

      let emailSent = false;
      if (user.notifyEmail !== false) {
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
        emailSent = sendResult.success;
      }

      // Also dispatch Web Push notification
      let pushSent = false;
      if (user.notificationsEnabled !== false) {
        const pushRes = await sendPushNotificationToUser(
          user.id,
          {
            title: `Reminder: ${event.title}`,
            body: event.startTime ? `Starts at ${event.startTime}${event.location ? ' • ' + event.location : ''}` : `Scheduled for today.`,
            category: "calendar",
            url: "/calendar",
          },
          { category: "calendar" }
        );
        pushSent = pushRes.success;
      }

      if (emailSent || pushSent) {
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
      // If task was deleted, completed, or user disabled todo reminders
      if (!todoTask || todoTask.completed || user.notifyTodo === false) {
        await (prisma as any).notification.update({
          where: { id: notification.id },
          data: { status: "CANCELLED" },
        });
        results.cancelled++;
        continue;
      }

      let emailSent = false;
      if (user.notifyEmail !== false) {
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
        emailSent = sendResult.success;
      }

      // Also dispatch Web Push notification
      let pushSent = false;
      if (user.notificationsEnabled !== false) {
        const pushRes = await sendPushNotificationToUser(
          user.id,
          {
            title: `Task Reminder: ${todoTask.title}`,
            body: todoTask.dueTime ? `Due at ${todoTask.dueTime}` : `Scheduled for today`,
            category: "task",
            url: "/todo",
          },
          { category: "task" }
        );
        pushSent = pushRes.success;
      }

      if (emailSent || pushSent) {
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
          OR: [
            { notifyEmail: true },
            { notificationsEnabled: true },
          ],
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
      if (!task.user) continue;

      let emailSuccess = false;
      if (task.user.notifyEmail && task.user.email) {
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
        emailSuccess = sendRes.success;
      }

      let pushSuccess = false;
      if (task.user.notificationsEnabled !== false && task.user.notifyOverdue !== false) {
        const pushRes = await sendPushNotificationToUser(
          task.userId,
          {
            title: `Still pending: ${task.title}`,
            body: `This task was due earlier and is waiting for you.`,
            category: "task",
            url: "/todo",
          },
          { category: "task" }
        );
        pushSuccess = pushRes.success;
      }

      const delivered = emailSuccess || pushSuccess;

      await (prisma as any).notification.create({
        data: {
          userId: task.userId,
          todoTaskId: task.id,
          type: "OVERDUE_REMINDER",
          title: `Still pending: ${task.title}`,
          message: `Task was not marked completed.`,
          scheduledFor: now,
          sentAt: delivered ? now : null,
          status: delivered ? "SENT" : "FAILED",
        },
      });

      if (delivered) results.sent++;
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
