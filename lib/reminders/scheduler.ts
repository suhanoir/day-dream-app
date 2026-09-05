import { prisma } from "@/lib/db/prisma";

/**
 * Parse time string like "10:00 AM", "5:30 PM", or "14:00" into { hours, minutes }
 */
export function parseTimeString(timeStr?: string | null): { hours: number; minutes: number } {
  if (!timeStr || typeof timeStr !== "string") {
    return { hours: 9, minutes: 0 }; // Default to 9:00 AM
  }

  const clean = timeStr.trim();
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);
  const numPart = clean.replace(/[^\d:]/g, "");
  const [hStr, mStr] = numPart.split(":");
  let hours = parseInt(hStr, 10) || 9;
  const minutes = parseInt(mStr, 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Given a base date, time string, reminder option, calculate target UTC timestamp
 */
export function calculateReminderTime(
  baseDate: Date,
  timeStr: string | null | undefined,
  reminderOption: string | null | undefined
): Date | null {
  if (!reminderOption || reminderOption === "none") {
    return null;
  }

  const { hours, minutes } = parseTimeString(timeStr);
  const targetDate = new Date(baseDate);
  targetDate.setUTCHours(hours, minutes, 0, 0);

  let offsetMinutes = 0;
  switch (reminderOption) {
    case "1_min":
      offsetMinutes = 1;
      break;
    case "5_mins":
      offsetMinutes = 5;
      break;
    case "10_mins":
      offsetMinutes = 10;
      break;
    case "30_mins":
      offsetMinutes = 30;
      break;
    case "1_hour":
      offsetMinutes = 60;
      break;
    case "3_hours":
      offsetMinutes = 180;
      break;
    case "1_day":
      offsetMinutes = 1440;
      break;
    case "1_week":
      offsetMinutes = 10080;
      break;
    default:
      return null;
  }

  return new Date(targetDate.getTime() - offsetMinutes * 60 * 1000);
}

/**
 * Synchronize reminder notification for a Calendar event
 */
export async function syncEventReminder(eventId: string): Promise<void> {
  try {
    const event = await (prisma as any).event.findUnique({
      where: { id: eventId },
      include: { user: true },
    });

    if (!event) return;

    // Remove any existing pending reminder for this event
    await (prisma as any).notification.deleteMany({
      where: {
        eventId,
        status: "PENDING",
      },
    });

    if (!event.reminder || event.reminder === "none") {
      return;
    }

    const scheduledFor = calculateReminderTime(
      event.date,
      event.startTime,
      event.reminder
    );

    if (!scheduledFor) return;

    await (prisma as any).notification.create({
      data: {
        userId: event.userId,
        type: "CALENDAR_REMINDER",
        title: `Upcoming: ${event.title}`,
        message: `Your event "${event.title}" is scheduled for ${event.date.toISOString().split("T")[0]}${event.startTime ? ` at ${event.startTime}` : ""}.`,
        scheduledFor,
        eventId: event.id,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("[Scheduler Error] Failed to sync event reminder:", error);
  }
}

/**
 * Synchronize reminder notification for a To-Do task
 */
export async function syncTodoReminder(todoTaskId: string): Promise<void> {
  try {
    const task = await (prisma as any).todoTask.findUnique({
      where: { id: todoTaskId },
      include: { user: true },
    });

    if (!task) return;

    // Remove any existing pending reminder for this task
    await (prisma as any).notification.deleteMany({
      where: {
        todoTaskId,
        status: "PENDING",
      },
    });

    // If completed or no reminder, do not schedule
    if (task.completed || !task.reminder || task.reminder === "none") {
      return;
    }

    const scheduledFor = calculateReminderTime(
      task.date,
      task.dueTime,
      task.reminder
    );

    if (!scheduledFor) return;

    await (prisma as any).notification.create({
      data: {
        userId: task.userId,
        type: "TODO_REMINDER",
        title: `Task Due: ${task.title}`,
        message: `Your task "${task.title}" is due soon.`,
        scheduledFor,
        todoTaskId: task.id,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("[Scheduler Error] Failed to sync todo reminder:", error);
  }
}

/**
 * Cancel pending reminders for a task or event
 */
export async function cancelItemReminders(
  type: "event" | "todo",
  itemId: string
): Promise<void> {
  try {
    const where = type === "event" ? { eventId: itemId } : { todoTaskId: itemId };
    await (prisma as any).notification.deleteMany({
      where: {
        ...where,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("[Scheduler Error] Failed to cancel item reminders:", error);
  }
}

