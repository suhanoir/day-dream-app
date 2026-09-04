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
