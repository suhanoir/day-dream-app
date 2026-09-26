"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import {
  ListTodo,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Check,
  Target,
  Compass,
  ChevronRight,
  Moon,
  Sun,
  TrendingUp,
  Receipt,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  focusItems: Array<{
    id: string;
    type: "task" | "event";
    title: string;
    time?: string | null;
    priority?: string | null;
    category?: string | null;
    completed?: boolean;
    location?: string | null;
  }>;
  dreamInProgress?: {
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
  activeDreams?: Array<{
    id: string;
    title: string;
    targetDate?: string | null;
    category?: {
      name: string;
      color?: string | null;
    } | null;
    todos?: Array<{ id: string; completed: boolean }>;
  }>;
  recentMemories?: Array<{
    id: string;
    title: string;
    reflection?: string | null;
    completedAt?: string | null;
    memoryPhoto?: string | null;
    category?: {
      name: string;
      color?: string | null;
    } | null;
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
    monthName: string;
    year: number;
  };
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

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

  // Handle checking off a task directly in Today's Snapshot
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
          playSound("ui-click");
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

  const focusTasks = (data?.focusItems || []).filter((i) => i.type === "task");
  const activeDreams = data?.activeDreams || [];
  const recentMemories = data?.recentMemories || [];

  // Desktop side panel
  const sidePanelContent = (
    <div className="space-y-5">
      {/* Life at a Glance Snapshot */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-white/10 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-muted" />
            Your Life at a Glance
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/dreams"
            className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 glass-card-interactive"
          >
            <span className="text-[10.5px] text-muted block">Active Dreams</span>
            <span className="text-lg font-bold text-primary">
              {overview.activeGoalsCount}
            </span>
          </Link>
          <Link
            href="/memories"
            className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 glass-card-interactive"
          >
            <span className="text-[10.5px] text-muted block">Memories Lived</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {overview.completedGoalsCount}
            </span>
          </Link>
        </div>

        <div className="pt-2 border-t border-stone-200/50 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-muted">This Month Spend:</span>
          <Link
            href="/expenses"
            className="font-bold text-primary hover:text-accent flex items-center gap-1"
          >
            <span>₹{overview.monthlyExpenseTotal.toLocaleString("en-IN")}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="glass-card rounded-2xl p-5 space-y-2.5 text-xs">
        <span className="font-bold uppercase tracking-wider text-secondary text-[11px] block">
          Orientation
        </span>
        <div className="space-y-1.5">
          <Link
            href="/dreams"
            className="p-2.5 rounded-xl glass-card-interactive flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-muted" />
              <span className="font-medium text-primary">My Dreams</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
          </Link>

          <Link
            href="/todo"
            className="p-2.5 rounded-xl glass-card-interactive flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ListTodo className="w-3.5 h-3.5 text-muted" />
              <span className="font-medium text-primary">To-Do List</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
          </Link>

          <Link
            href="/memories"
            className="p-2.5 rounded-xl glass-card-interactive flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted" />
              <span className="font-medium text-primary">Memory Scrapbook</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
          </Link>
        </div>
      </div>
    </div>
  );

  if (authLoading || (isLoading && !data)) {
    return (
      <AppShell title="Home">
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-muted animate-spin mb-3" />
          <p className="text-xs text-muted font-medium">Loading your day...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Home" sidePanel={sidePanelContent}>
      <div className="space-y-8">
        {/* 1. Header & Personal Greeting */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-primary font-serif-heading leading-tight">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Your next memory is waiting. Here is what matters today.
          </p>
        </div>

        {/* 2. Your Active Dreams */}
        <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Active Dreams
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-muted">
                {overview.activeGoalsCount} in progress
              </span>
            </div>
            <Link
              href="/dreams"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>View all Dreams</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeDreams.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100/80 dark:bg-white/10 text-stone-400 flex items-center justify-center mx-auto border border-stone-200/50 dark:border-white/10 shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-primary">
                Your next dream starts here.
              </h3>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Add something you have always wanted to experience or achieve.
              </p>
              <div className="pt-1">
                <Link href="/dreams">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Add a Dream
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeDreams.map((dream) => (
                <Link
                  key={dream.id}
                  href="/dreams"
                  className="p-4 rounded-xl glass-card-interactive flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {dream.category?.name && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-white/10 text-secondary">
                          {dream.category.name}
                        </span>
                      )}
                      {dream.targetDate && (
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" />
                          {new Date(dream.targetDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-primary group-hover:text-accent transition-colors truncate">
                      {dream.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-stone-200/40 dark:border-white/5">
                    <span>
                      {dream.todos && dream.todos.length > 0
                        ? `${dream.todos.filter((t) => t.completed).length}/${dream.todos.length} steps`
                        : "Ready to plan"}
                    </span>
                    <span className="font-semibold text-accent flex items-center gap-0.5">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 3. Action Snapshot */}
        <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-white/10">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[var(--theme-primary)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                To-Do
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-muted">
                {overview.tasksRemaining} remaining
              </span>
            </div>
            <Link
              href="/todo"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>Open To-Do</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {focusTasks.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-primary">
                You are all caught up.
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No pressing tasks waiting. Relax, reflect, or plan your next step.
              </p>
              <div className="pt-1">
                <Link href="/todo">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Open To-Do List
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {focusTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-xs",
                    task.completed
                      ? "bg-stone-100/40 dark:bg-white/5 border-stone-200/40 dark:border-white/5 text-muted"
                      : "glass-card-interactive text-primary"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      disabled={togglingTaskId === task.id}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer",
                        task.completed
                          ? "bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white"
                          : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      )}
                      aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span
                      className={cn(
                        "truncate font-medium",
                        task.completed && "line-through text-muted font-normal"
                      )}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.priority && (
                      <span className="text-[10px] text-muted px-1.5 py-0.5 rounded bg-stone-100 dark:bg-white/10">
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Recent Memories */}
        <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">
                Recent Memories
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-muted">
                {overview.completedGoalsCount} preserved
              </span>
            </div>
            <Link
              href="/memories"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>View Memories</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentMemories.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-primary">
                Your scrapbook is waiting.
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Complete your first dream and the reflection will live here forever.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentMemories.map((mem) => (
                <Link
                  key={mem.id}
                  href="/memories"
                  className="p-4 rounded-xl glass-card-interactive flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Achieved
                      </span>
                      {mem.completedAt && (
                        <span className="text-[10px] text-muted">
                          {new Date(mem.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-primary group-hover:text-accent transition-colors truncate">
                      {mem.title}
                    </h3>
                    {mem.reflection && (
                      <p className="text-xs text-secondary line-clamp-2 italic font-serif">
                        &ldquo;{mem.reflection}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-stone-200/40 dark:border-white/5">
                    <span>Keepsake recorded</span>
                    <span className="font-semibold text-accent flex items-center gap-0.5">
                      View Postcard <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
