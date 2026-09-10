"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BucketIcon } from "@/components/ui/BucketIcon";
import { Button } from "@/components/ui/Button";
import {
  ListTodo,
  Calendar as CalendarIcon,
  Receipt,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Loader2,
  Check,
  Target,
  Compass,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FocusItem {
  id: string;
  type: "task" | "event";
  title: string;
  time?: string | null;
  priority?: string | null;
  category?: string | null;
  completed?: boolean;
  location?: string | null;
}

interface HomeData {
  overview: {
    tasksRemaining: number;
    tasksCompleted: number;
    tasksTotal: number;
    tasksPercent: number;
    eventsCount: number;
    activeGoalsCount: number;
    completedGoalsCount: number;
    monthlyExpenseTotal: number;
    monthlyExpenseCount: number;
  };
  focusItems: FocusItem[];
  dreamInProgress: {
    id: string;
    title: string;
    description?: string | null;
    targetDate?: string | null;
    category?: {
      id: string;
      name: string;
      color?: string | null;
      icon?: string | null;
    } | null;
  } | null;
  todayEvents: Array<{
    id: string;
    title: string;
    startTime?: string | null;
    endTime?: string | null;
    category: string;
    location?: string | null;
  }>;
  todayTasksSummary: {
    remaining: number;
    completed: number;
    total: number;
    percent: number;
  };
  expensesSummary: {
    monthlyTotal: number;
    count: number;
    topCategory?: string | null;
    topCategoryAmount?: number;
    monthName: string;
    year: number;
  };
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  // Derive client local date (YYYY-MM-DD)
  const localDateStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const fetchHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/home?date=${localDateStr}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        toastError("Failed to load home overview");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      toastError("Network error loading home overview");
    } finally {
      setIsLoading(false);
    }
  }, [localDateStr, router, toastError]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else {
        fetchHomeData();
      }
    }
  }, [user, authLoading, router, fetchHomeData]);

  // Compute greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = user?.name ? user.name.split(" ")[0] : "there";
    if (hour < 12) return `Good morning, ${name}.`;
    if (hour < 17) return `Good afternoon, ${name}.`;
    return `Good evening, ${name}.`;
  }, [user?.name]);

  // Handle checking off a task directly in "Today's Focus"
  const handleToggleTask = async (taskId: string, currentStatus?: boolean) => {
    if (togglingTaskId) return;
    setTogglingTaskId(taskId);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setData((prev) => {
      if (!prev) return prev;
      const updatedFocus = prev.focusItems.map((item) =>
        item.id === taskId && item.type === "task"
          ? { ...item, completed: newStatus }
          : item
      );
      const delta = newStatus ? 1 : -1;
      const nextCompleted = Math.max(0, prev.overview.tasksCompleted + delta);
      const nextRemaining = Math.max(0, prev.overview.tasksRemaining - delta);
      const nextTotal = prev.overview.tasksTotal;
      const nextPercent = nextTotal > 0 ? Math.round((nextCompleted / nextTotal) * 100) : 0;

      return {
        ...prev,
        focusItems: updatedFocus,
        overview: {
          ...prev.overview,
          tasksCompleted: nextCompleted,
          tasksRemaining: nextRemaining,
          tasksPercent: nextPercent,
        },
        todayTasksSummary: {
          remaining: nextRemaining,
          completed: nextCompleted,
          total: nextTotal,
          percent: nextPercent,
        },
      };
    });

    try {
      const res = await fetch(`/api/todos/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus }),
      });

      if (!res.ok) {
        toastError("Failed to update task completion");
        fetchHomeData();
      } else {
        if (newStatus) {
          success("Task completed!");
        }
      }
    } catch {
      toastError("Network error updating task");
      fetchHomeData();
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (authLoading || (isLoading && !data)) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-medium">
          Loading your day...
        </p>
      </div>
    );
  }

  const overview = data?.overview || {
    tasksRemaining: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    tasksPercent: 0,
    eventsCount: 0,
    activeGoalsCount: 0,
    completedGoalsCount: 0,
    monthlyExpenseTotal: 0,
    monthlyExpenseCount: 0,
  };

  const focusItems = data?.focusItems || [];
  const dream = data?.dreamInProgress;
  const todayEvents = data?.todayEvents || [];
  const expensesSummary = data?.expensesSummary;

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col selection:bg-stone-900 selection:text-stone-50">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* 1. Header & Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Here&apos;s what matters today.
          </p>
        </div>

        {/* 2. Today at a Glance (4 compact, clean overview cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Today's Tasks */}
          <Link
            href="/todo"
            className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Today&apos;s Tasks
              </span>
              <ListTodo className="w-4 h-4 text-stone-400 group-hover:text-[var(--theme-primary)] transition-colors" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {overview.tasksRemaining} remaining
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {overview.tasksCompleted} of {overview.tasksTotal} completed
            </p>
          </Link>

          {/* Card 2: Today's Events */}
          <Link
            href="/calendar"
            className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Today&apos;s Events
              </span>
              <CalendarIcon className="w-4 h-4 text-stone-400 group-hover:text-[var(--theme-primary)] transition-colors" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {overview.eventsCount} {overview.eventsCount === 1 ? "event" : "events"}
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {overview.eventsCount > 0 ? "Scheduled for today" : "Free schedule"}
            </p>
          </Link>

          {/* Card 3: BucketList Active */}
          <Link
            href="/dashboard"
            className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                BucketList
              </span>
              <BucketIcon className="w-4 h-4 text-stone-400 group-hover:text-[var(--theme-primary)] transition-colors" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {overview.activeGoalsCount} in progress
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {overview.completedGoalsCount} aspirations fulfilled
            </p>
          </Link>

          {/* Card 4: Monthly Spending */}
          <Link
            href="/expenses"
            className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                This Month
              </span>
              <Receipt className="w-4 h-4 text-stone-400 group-hover:text-[var(--theme-primary)] transition-colors" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              ₹{overview.monthlyExpenseTotal.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {overview.monthlyExpenseCount} {overview.monthlyExpenseCount === 1 ? "expense" : "expenses"} recorded
            </p>
          </Link>
        </div>

        {/* 3. Today's Focus (Surfaces max 3 top items for today) */}
        <section className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Today&apos;s Focus
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/80">
                Top Priorities
              </span>
            </div>
            <Link
              href="/todo"
              className="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-1"
            >
              View all tasks
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {focusItems.length === 0 ? (
            /* Smart Empty State for Today's Focus */
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                You&apos;re all caught up.
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Nothing waiting for you today. Take a breath, enjoy the calm, or plan your next move.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {focusItems.map((item) => {
                if (item.type === "task") {
                  return (
                    <div
                      key={`focus-${item.id}`}
                      className={cn(
                        "flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all",
                        item.completed
                          ? "bg-stone-50 border-stone-200/60 text-stone-400"
                          : "bg-stone-50/50 hover:bg-stone-50 border-stone-200/80 text-stone-800 hover:border-stone-300"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        {/* Interactive Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleTask(item.id, item.completed)}
                          disabled={togglingTaskId === item.id}
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                            item.completed
                              ? "bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white"
                              : "border-stone-300 hover:border-stone-400 bg-white"
                          )}
                          aria-label={item.completed ? "Mark uncompleted" : "Mark completed"}
                        >
                          {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>

                        <span
                          className={cn(
                            "text-sm font-medium leading-snug truncate",
                            item.completed && "line-through text-stone-400 font-normal"
                          )}
                        >
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        {item.priority && (
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                              item.priority.toLowerCase() === "high" || item.priority.toLowerCase() === "urgent"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : item.priority.toLowerCase() === "medium"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-stone-100 text-stone-600 border-stone-200"
                            )}
                          >
                            {item.priority}
                          </span>
                        )}
                        {item.time && (
                          <span className="text-[11px] text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                // Event focus item
                return (
                  <div
                    key={`focus-${item.id}`}
                    className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-all text-stone-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-5 h-5 rounded-md bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium leading-snug truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      {item.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {item.category}
                        </span>
                      )}
                      {item.time && (
                        <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {item.time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Connected Sections (Two Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Dream in Progress & Monthly Spending */}
          <div className="space-y-6">
            {/* 4A. Dream in Progress (BucketList Connection) */}
            <section className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    Dream in Progress
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/80">
                    BucketList
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {dream ? (
                <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-200/70 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {dream.category?.name && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                            {dream.category.name}
                          </span>
                        )}
                        {dream.targetDate && (
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Target className="w-2.5 h-2.5" />
                            {new Date(dream.targetDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {dream.title}
                      </h3>
                      {dream.description && (
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {dream.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-400">
                      Active Milestone
                    </span>
                    <Link
                      href="/dashboard"
                      className="text-xs font-semibold text-[var(--theme-primary)] hover:underline inline-flex items-center gap-1"
                    >
                      Open Goal Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Your next dream starts here.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Add something you&apos;ve always wanted to experience or achieve.
                  </p>
                  <div className="pt-2">
                    <Link href="/dashboard">
                      <Button variant="secondary" size="sm" className="text-xs">
                        Add a Dream
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* 4B. This Month's Spending (Expense Connection) */}
            <section className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    This Month
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/80">
                    Expenses
                  </span>
                </div>
                <Link
                  href="/expenses"
                  className="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-1"
                >
                  Manage budget
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {overview.monthlyExpenseCount > 0 ? (
                <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-200/70 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                        ₹{overview.monthlyExpenseTotal.toLocaleString("en-IN")}
                      </span>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Total spent in {expensesSummary?.monthName} {expensesSummary?.year}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 shadow-2xs">
                      {overview.monthlyExpenseCount} {overview.monthlyExpenseCount === 1 ? "expense" : "expenses"}
                    </span>
                  </div>

                  {expensesSummary?.topCategory && (
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Top Spend Category:</span>
                      <span className="font-semibold text-stone-800">
                        {expensesSummary.topCategory} (₹{expensesSummary.topCategoryAmount?.toLocaleString("en-IN")})
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">
                    No spending recorded this month.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Track your daily expenses and monthly budgets mindfully.
                  </p>
                  <div className="pt-2">
                    <Link href="/expenses">
                      <Button variant="secondary" size="sm" className="text-xs">
                        Add an Expense
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Column 2: Today's Schedule & Today's Tasks Progress */}
          <div className="space-y-6">
            {/* 4C. Today's Schedule (Calendar Connection) */}
            <section className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    Today&apos;s Schedule
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/80">
                    Calendar
                  </span>
                </div>
                <Link
                  href="/calendar"
                  className="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-1"
                >
                  Full calendar
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {todayEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {todayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-stone-50/60 border border-stone-200/70 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-stone-900 truncate">
                            {ev.title}
                          </span>
                          {ev.category && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-stone-200/60 text-stone-600">
                              {ev.category}
                            </span>
                          )}
                        </div>
                        {ev.location && (
                          <p className="text-[11px] text-stone-400 flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {ev.location}
                          </p>
                        )}
                      </div>

                      {ev.startTime && (
                        <span className="text-xs font-semibold text-stone-600 px-2 py-1 rounded-md bg-white border border-stone-200/80 shrink-0">
                          {ev.startTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Nothing planned today.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Enjoy the day or schedule something on your calendar.
                  </p>
                  <div className="pt-2">
                    <Link href="/calendar">
                      <Button variant="secondary" size="sm" className="text-xs">
                        Add an Event
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* 4D. Today's Tasks Progress (To-Do Connection) */}
            <section className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    Today&apos;s Tasks
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/80">
                    To-Do List
                  </span>
                </div>
                <Link
                  href="/todo"
                  className="text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-1"
                >
                  Open To-Do
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {overview.tasksTotal > 0 ? (
                <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-200/70 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-stone-900">
                        {overview.tasksCompleted} of {overview.tasksTotal} done
                      </span>
                      <p className="text-xs text-stone-400">
                        {overview.tasksRemaining === 0
                          ? "All daily tasks completed! 🎉"
                          : `${overview.tasksRemaining} task${overview.tasksRemaining === 1 ? "" : "s"} remaining`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-stone-900 px-2 py-0.5 rounded-md bg-white border border-stone-200/80 shadow-2xs">
                      {overview.tasksPercent}%
                    </span>
                  </div>

                  {/* Subtle progress bar */}
                  <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[var(--theme-primary)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${overview.tasksPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">
                    No tasks scheduled for today.
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Add small actions to keep moving toward your goals.
                  </p>
                  <div className="pt-2">
                    <Link href="/todo">
                      <Button variant="secondary" size="sm" className="text-xs">
                        Add a Task
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
