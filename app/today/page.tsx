"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { TodoTaskItem } from "@/components/todo/TodoTaskItem";
import { TodoTaskDetailModal } from "@/components/todo/TodoTaskDetailModal";
import { AddTodoTaskModal } from "@/components/todo/AddTodoTaskModal";
import { DateNavigator } from "@/components/todo/DateNavigator";
import { TodoProgressWidget } from "@/components/todo/TodoProgressWidget";
import { TodayEventsSnippet } from "@/components/todo/TodayEventsSnippet";
import {
  TodoTaskData,
  formatToDateKey,
  TODO_CATEGORIES,
  TODO_PRIORITIES,
} from "@/components/todo/types";
import { useToast } from "@/components/providers/ToastProvider";
import {
  CheckSquare,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Inbox,
  Loader2,
  Filter,
  Plus,
  ArrowRightCircle,
  Clock,
  Sparkles,
  Moon,
  ArrowRight,
  Target,
  SunMedium,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TodayPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TodoTaskData[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMovingAll, setIsMovingAll] = useState(false);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Modal State
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<TodoTaskData | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const selectedDateKey = formatToDateKey(selectedDate);
  const todayKey = formatToDateKey(new Date());
  const isPastDate = selectedDateKey < todayKey;
  const isToday = selectedDateKey === todayKey;

  // Fetch tasks for current selected date
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append("date", selectedDateKey);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const res = await fetch(`/api/todos?${params.toString()}`);
      if (!res.ok) {
        toastError("Failed to fetch today's tasks");
        return;
      }

      const data = await res.json();
      setTasks(data.tasks || []);
      setOverdueCount(data.overdueCount || 0);
    } catch (e) {
      console.error("Error fetching tasks:", e);
      toastError("Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDateKey, categoryFilter, priorityFilter, toastError]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Split into active and completed tasks
  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed),
    [tasks]
  );

  // Toggle completion handler
  const handleToggleComplete = async (task: TodoTaskData) => {
    const nextCompleted = !task.completed;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      const res = await fetch(`/api/todos/${task.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!res.ok) {
        // Revert on error
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        toastError("Failed to update task status");
      } else {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
      }
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      toastError("Network error while updating task");
    }
  };

  // Move single task to Today handler
  const handleMoveToToday = async (task: TodoTaskData) => {
    try {
      const res = await fetch(`/api/todos/${task.id}/move-today`, {
        method: "PATCH",
      });

      if (!res.ok) {
        toastError("Failed to move task to today");
        return;
      }

      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      success("Task moved to Today!");
    } catch {
      toastError("Error moving task to today");
    }
  };

  // Move all past uncompleted tasks to Today
  const handleMoveAllToToday = async () => {
    try {
      setIsMovingAll(true);
      const res = await fetch(`/api/todos/move-all-today`, {
        method: "POST",
      });

      if (!res.ok) {
        toastError("Failed to rollover past tasks");
        return;
      }

      const data = await res.json();
      success(data.message || "All past tasks moved to Today!");
      fetchTasks();
    } catch {
      toastError("Network error rolling over tasks");
    } finally {
      setIsMovingAll(false);
    }
  };

  // Desktop side panel
  const sidePanelContent = (
    <div className="space-y-5">
      {/* Today's Progress Widget */}
      <TodoProgressWidget totalCount={tasks.length} completedCount={completedTasks.length} />

      {/* Today's Events Snippet */}
      <TodayEventsSnippet selectedDate={selectedDate} />

      {/* Linked Dreams Motivation Card */}
      <div className="glass-card rounded-2xl p-5 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-muted" />
          Connected Dreams
        </span>
        <p className="text-xs text-muted leading-relaxed">
          Every daily action keeps you moving toward your lifelong aspirations.
        </p>
        <div className="pt-1">
          <Link
            href="/dreams"
            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
          >
            <span>Browse All Dreams</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell title="Today" sidePanel={sidePanelContent}>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary font-serif-heading leading-tight">
                Today
              </h1>
              {isToday && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20 inline-flex items-center gap-1">
                  <SunMedium className="w-3 h-3 text-amber-500" />
                  <span>Present Day</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-secondary">
              What can I do right now to make my dreams real?
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
            {/* Future Zen Focus spot */}
            <span
              title="Zen Focus Mode (Coming Soon)"
              className="text-xs font-semibold px-3 py-2 rounded-xl glass-card text-muted border border-stone-200/50 dark:border-white/5 opacity-75 hidden sm:inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-muted" />
              <span>Zen Focus</span>
            </span>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>

        {/* Date Navigator */}
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={(d) => setSelectedDate(d)}
        />

        {/* Overdue rollover alert banner (if user is viewing a past date or has overdue tasks) */}
        {overdueCount > 0 && isToday && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-amber-900 dark:text-amber-200 font-medium truncate">
                You have {overdueCount} uncompleted task{overdueCount === 1 ? "" : "s"} from past days.
              </span>
            </div>
            <button
              type="button"
              onClick={handleMoveAllToToday}
              disabled={isMovingAll}
              className="font-bold text-amber-800 dark:text-amber-200 hover:underline shrink-0 cursor-pointer"
            >
              {isMovingAll ? "Moving..." : "Move All to Today →"}
            </button>
          </div>
        )}

        {/* Filters bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted font-semibold uppercase text-[10px] tracking-wider mr-1">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
                categoryFilter === "all"
                  ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-2xs"
                  : "text-secondary hover:text-primary bg-stone-100/80 dark:bg-white/10"
              )}
            >
              All
            </button>
            {TODO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer",
                  categoryFilter === cat
                    ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-2xs"
                    : "text-secondary hover:text-primary bg-stone-100/80 dark:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks View / Content */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-muted animate-spin mb-3" />
            <p className="text-xs text-muted font-medium">Loading tasks for this date...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100/80 dark:bg-white/10 text-stone-500 flex items-center justify-center mx-auto border border-stone-200/50 dark:border-white/10 shadow-2xs">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-primary font-serif-heading">
              Nothing pressing today.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Take a breath, enjoy the moment, or add small steps toward your dreams.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddTaskModalOpen(true)}
                className="font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Task</span>
              </Button>
              <Link href="/dreams">
                <Button variant="outline" size="md">
                  <span>Browse Dreams</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active (Incomplete) Tasks */}
            <div className="space-y-2.5">
              {activeTasks.length === 0 ? (
                <div className="p-5 rounded-2xl glass-card text-center space-y-1">
                  <p className="text-sm font-bold text-primary">All tasks completed! 🎉</p>
                  <p className="text-xs text-muted">
                    You have achieved everything planned for this date.
                  </p>
                </div>
              ) : (
                activeTasks.map((task) => (
                  <TodoTaskItem
                    key={task.id}
                    task={task}
                    isPastDate={isPastDate}
                    onToggleComplete={handleToggleComplete}
                    onClick={(t) => setSelectedTaskForDetail(t)}
                    onMoveToToday={handleMoveToToday}
                  />
                ))
              )}
            </div>

            {/* Collapsible Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  {isCompletedExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>Completed ({completedTasks.length})</span>
                </button>

                {isCompletedExpanded && (
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <TodoTaskItem
                        key={task.id}
                        task={task}
                        isPastDate={isPastDate}
                        onToggleComplete={handleToggleComplete}
                        onClick={(t) => setSelectedTaskForDetail(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TodoTaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onSave={async (updatedTask) => {
          try {
            const res = await fetch(`/api/todos/${updatedTask.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedTask),
            });
            if (res.ok) {
              const data = await res.json();
              setTasks((prev) => prev.map((t) => (t.id === data.todo.id ? data.todo : t)));
              setSelectedTaskForDetail(null);
            }
          } catch (err) {
            console.error(err);
          }
        }}
        onDelete={async (taskId) => {
          try {
            const res = await fetch(`/api/todos/${taskId}`, { method: "DELETE" });
            if (res.ok) {
              setTasks((prev) => prev.filter((t) => t.id !== taskId));
              setSelectedTaskForDetail(null);
            }
          } catch (err) {
            console.error(err);
          }
        }}
        onMoveToToday={async (task) => {
          await handleMoveToToday(task);
          setSelectedTaskForDetail(null);
        }}
        onToggleComplete={async (task) => {
          await handleToggleComplete(task);
        }}
      />

      {/* Add Task Modal */}
      <AddTodoTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        initialDate={selectedDate}
        onTaskAdded={(newTask) => {
          // If task date matches current view date, append to list
          if (newTask.date.split("T")[0] === selectedDateKey) {
            setTasks((prev) => [newTask, ...prev]);
          }
        }}
      />
    </AppShell>
  );
}
