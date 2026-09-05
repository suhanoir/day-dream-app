/**
 * Clean, responsive HTML email templates styled with the BucketList aesthetic.
 */

function baseLayout({
  previewText,
  heading,
  contentHtml,
}: {
  previewText: string;
  heading?: string;
  contentHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading || "BucketList"}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fafaf9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #fafaf9;
      padding: 40px 16px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(28, 25, 23, 0.05);
    }
    .header {
      padding: 32px 32px 20px;
      border-bottom: 1px solid #f5f5f4;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-badge {
      display: inline-block;
      width: 34px;
      height: 34px;
      background-color: #1c1917;
      color: #ffffff;
      border-radius: 10px;
      text-align: center;
      line-height: 34px;
      font-weight: 700;
      font-size: 16px;
    }
    .logo-text {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #1c1917;
      vertical-align: middle;
      display: inline-block;
      margin-left: 8px;
    }
    .content {
      padding: 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.3;
      color: #1c1917;
      margin: 0 0 12px;
      letter-spacing: -0.4px;
    }
    .subtitle {
      font-size: 14px;
      line-height: 1.6;
      color: #78716c;
      margin: 0 0 24px;
    }
    .card {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      padding: 20px;
      margin: 24px 0;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1c1917;
      margin: 0 0 8px;
    }
    .card-detail {
      font-size: 13px;
      color: #57534e;
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn {
      display: inline-block;
      background-color: #1c1917;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 13px 26px;
      border-radius: 12px;
      margin: 16px 0 24px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(28, 25, 23, 0.15);
    }
    .footer {
      padding: 24px 32px;
      background-color: #fafaf9;
      border-top: 1px solid #f5f5f4;
      font-size: 12px;
      line-height: 1.6;
      color: #a8a29e;
      text-align: center;
    }
    .footer-quote {
      font-style: italic;
      color: #78716c;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <span style="display:none;font-size:0;line-height:0;max-height:0;mso-hide:all;">${previewText}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">✦</div>
        <span class="logo-text">BucketList</span>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <div class="footer-quote">Dream it. Plan it. Do it. Remember it.</div>
        <div>BucketList · Designed for meaningful life experiences.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. Verification Email Template
 */
export function renderVerificationEmail({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}): { subject: string; html: string } {
  const subject = "🌱 Welcome to BucketList — Verify your email";
  const previewText = "Your next adventure starts here. Verify your email to get started.";

  const contentHtml = `
    <h1 class="title">Welcome to BucketList, ${name} 🌱</h1>
    <p class="subtitle">
      Your next adventure starts here. Click below to verify your email address and start building your list of things worth remembering.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${verificationUrl}" class="btn" target="_blank">Verify My Email</a>
    </div>

    <p style="font-size: 13px; color: #78716c; line-height: 1.6;">
      This link will expire in 24 hours. If you didn't create a BucketList account, you can safely ignore this email.
    </p>
    <p style="font-size: 13px; color: #a8a29e; word-break: break-all; margin-top: 16px;">
      Or copy and paste this URL into your browser:<br>
      <a href="${verificationUrl}" style="color: #78716c;">${verificationUrl}</a>
    </p>
  `;

  return {
    subject,
    html: baseLayout({ previewText, heading: "Verify your email", contentHtml }),
  };
}

/**
 * 2. Calendar Reminder Email Template
 */
export function renderCalendarReminderEmail({
  name,
  eventTitle,
  date,
  time,
  location,
  category,
  eventUrl,
  relativeTiming,
}: {
  name: string;
  eventTitle: string;
  date: string;
  time?: string | null;
  location?: string | null;
  category?: string;
  eventUrl: string;
  relativeTiming?: string;
}): { subject: string; html: string } {
  const timingText = relativeTiming || "coming up soon";
  const subject = `🌍 ${timingText === "tomorrow" ? "Tomorrow is a day worth remembering" : `Reminder: "${eventTitle}" is ${timingText}`}`;
  const previewText = `Something you've planned is ${timingText}: ${eventTitle}`;

  const contentHtml = `
    <p style="font-size: 14px; color: #78716c; margin: 0 0 6px;">Hi ${name},</p>
    <h1 class="title">Just a little nudge from your BucketList</h1>
    <p class="subtitle">
      Something you've planned is ${timingText}. Make sure you're ready to experience it!
    </p>

    <div class="card">
      <div class="card-title">📅 ${eventTitle}</div>
      <div class="card-detail"><strong>Date:</strong> ${date}</div>
      ${time ? `<div class="card-detail"><strong>Time:</strong> ${time}</div>` : ""}
      ${location ? `<div class="card-detail"><strong>Location:</strong> 📍 ${location}</div>` : ""}
      ${category ? `<div class="card-detail"><strong>Category:</strong> ${category}</div>` : ""}
    </div>

    <p style="font-size: 14px; color: #57534e; line-height: 1.6;">
      You've got somewhere to be and something to experience.<br>
      Make it count. ✨
    </p>

    <div style="text-align: center; margin: 20px 0 8px;">
      <a href="${eventUrl}" class="btn" target="_blank">View in Calendar</a>
    </div>
  `;

  return {
    subject,
    html: baseLayout({ previewText, heading: "Upcoming Event", contentHtml }),
  };
}

/**
 * 3. To-Do Deadline Reminder Email Template
 */
export function renderTodoReminderEmail({
  name,
  taskTitle,
  dueDate,
  dueTime,
  category,
  priority,
  todoUrl,
}: {
  name: string;
  taskTitle: string;
  dueDate: string;
  dueTime?: string | null;
  category?: string | null;
  priority?: string;
  todoUrl: string;
}): { subject: string; html: string } {
  const subject = `🎯 One small task between you and done: "${taskTitle}"`;
  const previewText = `Your future self left you a reminder for "${taskTitle}".`;

  const contentHtml = `
    <p style="font-size: 14px; color: #78716c; margin: 0 0 6px;">Hey ${name},</p>
    <h1 class="title">Your future self left you a little reminder</h1>
    <p class="subtitle">
      You've got a deadline approaching on your To-Do List.
    </p>

    <div class="card">
      <div class="card-title">✓ ${taskTitle}</div>
      <div class="card-detail"><strong>Due Date:</strong> ${dueDate}</div>
      ${dueTime ? `<div class="card-detail"><strong>Due Time:</strong> ${dueTime}</div>` : ""}
      ${priority ? `<div class="card-detail"><strong>Priority:</strong> ${priority}</div>` : ""}
      ${category ? `<div class="card-detail"><strong>Category:</strong> ${category}</div>` : ""}
    </div>

    <p style="font-size: 14px; color: #57534e; line-height: 1.6;">
      You're closer than you think.<br>
      Get it done, check it off, and move on to the next thing. 💪
    </p>

    <div style="text-align: center; margin: 20px 0 8px;">
      <a href="${todoUrl}" class="btn" target="_blank">Open To-Do List</a>
    </div>
  `;

  return {
    subject,
    html: baseLayout({ previewText, heading: "Task Reminder", contentHtml }),
  };
}

/**
 * 4. Overdue Task Supportive Reminder Email Template
 */
export function renderOverdueReminderEmail({
  name,
  taskTitle,
  originalDueDate,
  moveUrl,
}: {
  name: string;
  taskTitle: string;
  originalDueDate: string;
  moveUrl: string;
}): { subject: string; html: string } {
  const subject = `⏰ One thing is still waiting for you: "${taskTitle}"`;
  const previewText = `No guilt. No drama. You can pick it back up whenever you're ready.`;

  const contentHtml = `
    <p style="font-size: 14px; color: #78716c; margin: 0 0 6px;">Hey ${name},</p>
    <h1 class="title">One thing is still waiting for you</h1>
    <p class="subtitle">
      Looks like this one didn't quite make it across the finish line yet:
    </p>

    <div class="card">
      <div class="card-title">⏳ ${taskTitle}</div>
      <div class="card-detail"><strong>Was due:</strong> ${originalDueDate}</div>
    </div>

    <p style="font-size: 14px; color: #57534e; line-height: 1.6;">
      No guilt. No drama.<br>
      You can pick it back up whenever you're ready. One step at a time.
    </p>

    <div style="text-align: center; margin: 20px 0 8px;">
      <a href="${moveUrl}" class="btn" target="_blank">Move It To Today</a>
    </div>
  `;

  return {
    subject,
    html: baseLayout({ previewText, heading: "Gentle Reminder", contentHtml }),
  };
}

