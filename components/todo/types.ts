export type TodoPriority = "Low" | "Medium" | "High";

export type TodoCategory =
  | "Personal"
  | "College"
  | "Work"
  | "Health"
  | "Study"
  | "Other";

export interface TodoTaskData {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  date: string; // ISO string
  completed: boolean;
  completedAt?: string | null;
  dueTime?: string | null; // e.g. "5:00 PM"
  priority: TodoPriority;
  category?: TodoCategory | string | null;
  bucketListItemId?: string | null;
  bucketListItem?: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export const TODO_CATEGORIES: TodoCategory[] = [
  "Personal",
  "College",
  "Work",
  "Health",
  "Study",
  "Other",
];

export const TODO_PRIORITIES: TodoPriority[] = ["Low", "Medium", "High"];

// Subtle priority indicators
export const PRIORITY_STYLES: Record<
  TodoPriority,
  { label: string; badge: string; text: string; dot: string }
> = {
  High: {
    label: "High",
    badge: "bg-rose-50 text-rose-700 border-rose-200/80",
    text: "text-rose-600",
    dot: "bg-rose-500",
  },
  Medium: {
    label: "Medium",
    badge: "bg-amber-50 text-amber-700 border-amber-200/80",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  Low: {
    label: "Low",
    badge: "bg-stone-100 text-stone-600 border-stone-200/80",
    text: "text-stone-500",
    dot: "bg-stone-400",
  },
};

// Subtle category indicators matching existing design system
export const CATEGORY_STYLES: Record<
  string,
  { label: string; badge: string; text: string }
> = {
  Personal: {
    label: "Personal",
    badge: "bg-violet-50 text-violet-700 border-violet-200/60",
    text: "text-violet-700",
  },
  College: {
    label: "College",
    badge: "bg-sky-50 text-sky-700 border-sky-200/60",
    text: "text-sky-700",
  },
  Work: {
    label: "Work",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    text: "text-emerald-700",
  },
  Health: {
    label: "Health",
    badge: "bg-teal-50 text-teal-700 border-teal-200/60",
    text: "text-teal-700",
  },
  Study: {
    label: "Study",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    text: "text-indigo-700",
  },
  Other: {
    label: "Other",
    badge: "bg-stone-100 text-stone-700 border-stone-200/60",
    text: "text-stone-600",
  },
};

/**
 * Format a Date object to "YYYY-MM-DD" in local time
 */
export function formatToDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse "YYYY-MM-DD" into a local Date at midnight
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Return friendly date header label: e.g. "Friday, September 4"
 */
export function formatFriendlyDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Return short relative indicator: "Today", "Yesterday", "Tomorrow", or null
 */
export function getRelativeDayLabel(d: Date): string | null {
  const today = new Date();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";
  return null;
}

/**
 * Normalizes any time string ("5:00 PM", "5:00pm", "17:00", "9:30 AM", etc.)
 * into a valid HTML5 input[type="time"] value: "HH:mm" (24-hour format).
 * Returns "" if empty or invalid.
 */
export function formatTimeTo24H(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "";
  const clean = timeStr.trim();
  if (!clean) return "";

  const is12Hour = /am|pm/i.test(clean);
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);

  const numPart = clean.replace(/[^\d:]/g, "");
  const parts = numPart.split(":");
  if (parts.length < 2) return "";

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return "";
  if (minutes < 0 || minutes > 59) return "";

  if (is12Hour) {
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  }

  if (hours < 0 || hours > 23) return "";

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Formats a time string ("17:00", "09:30", "5:00 PM") for clean user-facing display.
 * Uses the user's browser/system locale preferences (12-hour or 24-hour).
 */
export function formatTimeForDisplay(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "";
  const clean = timeStr.trim();
  if (!clean) return "";

  // If already an explicit 12-hour string (e.g. "5:00 PM"), return normalized
  if (/am|pm/i.test(clean)) {
    return clean;
  }

  // Parse "HH:mm" or "HH:mm:ss"
  const parts = clean.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      try {
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      } catch {
        const period = hours >= 12 ? "PM" : "AM";
        const h12 = hours % 12 === 0 ? 12 : hours % 12;
        const mm = String(minutes).padStart(2, "0");
        return `${h12}:${mm} ${period}`;
      }
    }
  }

  return clean;
}

export type TaskSortMode = "priority" | "date" | "created" | "alphabetical";
export type TaskStatusFilter = "all" | "active" | "completed";

/**
 * Safely parses any date string format ("YYYY-MM-DD", "DD-MM-YYYY", ISO string)
 * into numeric year, 0-indexed month, and day.
 */
export function parseTaskDateParts(dateStr?: string | null): {
  year: number;
  month: number;
  day: number;
} | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const clean = dateStr.split("T")[0].trim();
  const parts = clean.split("-").map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    if (parts[0] > 1000) {
      // YYYY-MM-DD
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    } else if (parts[2] > 1000) {
      // DD-MM-YYYY
      return { year: parts[2], month: parts[1] - 1, day: parts[0] };
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

/**
 * Formats a task due date into human-friendly representation:
 * "Today", "Tomorrow", "21 Sep", or "Overdue · 21 Sep" (if past due date).
 * Timestamp / hours / minutes are intentionally omitted.
 */
export function formatTaskDueDate(
  dateStr?: string | null,
  isCompleted: boolean = false
): { label: string; isOverdue: boolean; isToday: boolean } | null {
  if (!dateStr) return null;
  const parts = parseTaskDateParts(dateStr);
  if (!parts) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(parts.year, parts.month, parts.day);

  const diffMs = targetDate.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const dayStr = String(parts.day).padStart(2, "0");
  const monthStr = monthNames[parts.month] || "";
  const currentYear = now.getFullYear();
  const yearSuffix = parts.year !== currentYear ? ` ${parts.year}` : "";
  const standardDate = `${dayStr} ${monthStr}${yearSuffix}`;

  if (isCompleted) {
    if (diffDays === 0) return { label: "Today", isOverdue: false, isToday: true };
    if (diffDays === 1) return { label: "Tomorrow", isOverdue: false, isToday: false };
    return { label: standardDate, isOverdue: false, isToday: false };
  }

  if (diffDays < 0) {
    return {
      label: `Overdue · ${dayStr} ${monthStr}`,
      isOverdue: true,
      isToday: false,
    };
  } else if (diffDays === 0) {
    return { label: "Today", isOverdue: false, isToday: true };
  } else if (diffDays === 1) {
    return { label: "Tomorrow", isOverdue: false, isToday: false };
  } else {
    return { label: standardDate, isOverdue: false, isToday: false };
  }
}

/**
 * Calculates priority rank (1 through 7) for intelligent default ordering:
 * 1. Overdue High
 * 2. High priority (not overdue)
 * 3. Overdue Medium
 * 4. Medium priority (not overdue)
 * 5. Overdue Low
 * 6. Low priority (not overdue)
 * 7. Tasks without a due date
 */
export function getTaskPriorityRank(
  task: TodoTaskData,
  todayStart: Date
): number {
  const priority = task.priority || "Medium";
  const hasDate = Boolean(task.date);

  if (!hasDate) {
    return 7;
  }

  const parts = parseTaskDateParts(task.date);
  if (!parts) return 7;

  const targetDate = new Date(parts.year, parts.month, parts.day);
  const isOverdue = targetDate.getTime() < todayStart.getTime();

  if (priority === "High") {
    return isOverdue ? 1 : 2;
  }
  if (priority === "Medium") {
    return isOverdue ? 3 : 4;
  }
  // Low priority
  return isOverdue ? 5 : 6;
}

