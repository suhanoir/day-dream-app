import { resend, DEFAULT_EMAIL_FROM, getAppUrl, isEmailConfigured } from "./client";
import {
  renderVerificationEmail,
  renderCalendarReminderEmail,
  renderTodoReminderEmail,
  renderOverdueReminderEmail,
} from "./templates";

export interface SendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Send an account verification email with an expiring secure token
 */
export async function sendVerificationEmail({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}): Promise<SendResult> {
  const appUrl = getAppUrl();
  const verificationUrl = `${appUrl}/verify?token=${encodeURIComponent(token)}`;
  const { subject, html } = renderVerificationEmail({ name, verificationUrl });

  if (!isEmailConfigured() || !resend) {
    console.log("--------------------------------------------------");
    console.log("[EMAIL SIMULATION - RESEND KEY NOT CONFIGURED]");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Verification Link: ${verificationUrl}`);
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_EMAIL_FROM,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send verification email:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email Error] Unexpected failure sending verification email:", err?.message || err);
    return { success: false, error: err?.message || "Internal email failure" };
  }
}

/**
 * Send a calendar event reminder email
 */
export async function sendCalendarReminderEmail({
  name,
  email,
  eventTitle,
  date,
  time,
  location,
  category,
  relativeTiming,
}: {
  name: string;
  email: string;
  eventTitle: string;
  date: string;
  time?: string | null;
  location?: string | null;
  category?: string;
  relativeTiming?: string;
}): Promise<SendResult> {
  const appUrl = getAppUrl();
  const eventUrl = `${appUrl}/calendar`;
  const { subject, html } = renderCalendarReminderEmail({
    name,
    eventTitle,
    date,
    time,
    location,
    category,
    eventUrl,
    relativeTiming,
  });

  if (!isEmailConfigured() || !resend) {
    console.log("--------------------------------------------------");
    console.log("[EMAIL SIMULATION] Calendar Reminder");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Event: ${eventTitle} on ${date}`);
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_EMAIL_FROM,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send calendar reminder:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email Error] Unexpected failure sending calendar reminder:", err?.message || err);
    return { success: false, error: err?.message || "Internal email failure" };
  }
}

/**
 * Send a To-Do deadline reminder email
 */
export async function sendTodoReminderEmail({
  name,
  email,
  taskTitle,
  dueDate,
  dueTime,
  category,
  priority,
}: {
  name: string;
  email: string;
  taskTitle: string;
  dueDate: string;
  dueTime?: string | null;
  category?: string | null;
  priority?: string;
}): Promise<SendResult> {
  const appUrl = getAppUrl();
  const todoUrl = `${appUrl}/todo`;
  const { subject, html } = renderTodoReminderEmail({
    name,
    taskTitle,
    dueDate,
    dueTime,
    category,
    priority,
    todoUrl,
  });

  if (!isEmailConfigured() || !resend) {
    console.log("--------------------------------------------------");
    console.log("[EMAIL SIMULATION] To-Do Deadline Reminder");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Task: ${taskTitle} Due: ${dueDate} ${dueTime || ""}`);
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_EMAIL_FROM,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send to-do reminder:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email Error] Unexpected failure sending to-do reminder:", err?.message || err);
    return { success: false, error: err?.message || "Internal email failure" };
  }
}

/**
 * Send an overdue task supportive reminder email
 */
export async function sendOverdueReminderEmail({
  name,
  email,
  taskTitle,
  originalDueDate,
  taskId,
}: {
  name: string;
  email: string;
  taskTitle: string;
  originalDueDate: string;
  taskId: string;
}): Promise<SendResult> {
  const appUrl = getAppUrl();
  const moveUrl = `${appUrl}/todo?action=move-today&taskId=${encodeURIComponent(taskId)}`;
  const { subject, html } = renderOverdueReminderEmail({
    name,
    taskTitle,
    originalDueDate,
    moveUrl,
  });

  if (!isEmailConfigured() || !resend) {
    console.log("--------------------------------------------------");
    console.log("[EMAIL SIMULATION] Overdue Task Reminder");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Task: ${taskTitle}`);
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_EMAIL_FROM,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send overdue reminder:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email Error] Unexpected failure sending overdue reminder:", err?.message || err);
    return { success: false, error: err?.message || "Internal email failure" };
  }
}

