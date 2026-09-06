"use client";

export type ExpenseCategory =
  | "Food"
  | "Shopping"
  | "Travel"
  | "Bills"
  | "Education"
  | "Entertainment"
  | "Health"
  | "Other";

export interface ExpenseData {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string; // ISO date string
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpenseSummary {
  monthlyTotal: number;
  count: number;
  categoryBreakdown: Record<string, number>;
  topCategory: { category: string; amount: number } | null;
  dailyAverage: number;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Education",
  "Entertainment",
  "Health",
  "Other",
];

export const EXPENSE_CATEGORY_CONFIG: Record<
  string,
  { label: string; badge: string; text: string; bg: string; dot: string }
> = {
  Food: {
    label: "Food",
    badge: "bg-amber-50 text-amber-800 border-amber-200/80",
    text: "text-amber-700",
    bg: "bg-amber-100/70 text-amber-800",
    dot: "bg-amber-500",
  },
  Shopping: {
    label: "Shopping",
    badge: "bg-rose-50 text-rose-800 border-rose-200/80",
    text: "text-rose-700",
    bg: "bg-rose-100/70 text-rose-800",
    dot: "bg-rose-500",
  },
  Travel: {
    label: "Travel",
    badge: "bg-sky-50 text-sky-800 border-sky-200/80",
    text: "text-sky-700",
    bg: "bg-sky-100/70 text-sky-800",
    dot: "bg-sky-500",
  },
  Bills: {
    label: "Bills",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    text: "text-emerald-700",
    bg: "bg-emerald-100/70 text-emerald-800",
    dot: "bg-emerald-500",
  },
  Education: {
    label: "Education",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
    text: "text-indigo-700",
    bg: "bg-indigo-100/70 text-indigo-800",
    dot: "bg-indigo-500",
  },
  Entertainment: {
    label: "Entertainment",
    badge: "bg-violet-50 text-violet-800 border-violet-200/80",
    text: "text-violet-700",
    bg: "bg-violet-100/70 text-violet-800",
    dot: "bg-violet-500",
  },
  Health: {
    label: "Health",
    badge: "bg-teal-50 text-teal-800 border-teal-200/80",
    text: "text-teal-700",
    bg: "bg-teal-100/70 text-teal-800",
    dot: "bg-teal-500",
  },
  Other: {
    label: "Other",
    badge: "bg-stone-100 text-stone-700 border-stone-200/80",
    text: "text-stone-600",
    bg: "bg-stone-200/70 text-stone-700",
    dot: "bg-stone-500",
  },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatToDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatExpenseDate(dateStr: string): string {
  if (!dateStr) return "";
  const cleanDate = dateStr.split("T")[0];
  const parts = cleanDate.split("-").map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
