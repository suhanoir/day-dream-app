"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickAddTaskInput } from "@/components/todo/QuickAddTaskInput";
import { TodoTaskItem } from "@/components/todo/TodoTaskItem";
import { TodoTaskDetailModal } from "@/components/todo/TodoTaskDetailModal";
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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TodoPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TodoTaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Modal State
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<TodoTaskData | null>(null);

  const selectedDateKey = formatToDateKey(selectedDate);
  const todayKey = formatToDateKey(new Date());
  const isPastDate = selectedDateKey < todayKey;

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
        toastError("Failed to fetch to-do tasks");
        return;
      }

      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error("Error fetching tasks:", e);
      toastError("Failed to load your to-do tasks");
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

  // Add Task handler
  const handleAddTask = async (title: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: `${selectedDateKey}T00:00:00.000Z`,
          category: categoryFilter !== "all" ? categoryFilter : "Personal",
          priority: priorityFilter !== "all" ? priorityFilter : "Medium",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "Failed to add task");
        return false;
      }

      setTasks((prev) => [...prev, data.task]);
      return true;
    } catch {
      toastError("Failed to create task");
      return false;
    }
  };

  // Toggle completion handler
  const handleToggleComplete = async (task: TodoTaskData) => {
    const nextCompleted = !task.completed;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null }
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
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
        toastError("Failed to update task status");
      } else {
        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? data.task : t))
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
      toastError("Network error while updating task");
    }
  };

  // Move to Today handler
  const handleMoveToToday = async (task: TodoTaskData) => {
    try {
      const res = await fetch(`/api/todos/${task.id}/move-today`, {
        method: "PATCH",
      });

      if (!res.ok) {
        toastError("Failed to move task to today");
        return;
      }

      // If we are currently not on today's view, remove from current view
      if (selectedDateKey !== todayKey) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? data.task : t))
        );
      }

      success("Task moved to Today!");
    } catch {
      toastError("Network error moving task");
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/todos/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toastError("Failed to delete task");
        return;
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTaskForDetail?.id === taskId) {
        setSelectedTaskForDetail(null);
      }
      success("Task deleted");
    } catch {
      toastError("Network error deleting task");
    }
  };

  // Save Task Changes from detail modal
  const handleSaveTask = async (updatedTask: TodoTaskData) => {
    try {
      const res = await fetch(`/api/todos/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (!res.ok) {
        toastError("Failed to save task changes");
        return;
      }

      const data = await res.json();
      const updatedDateKey = data.task.date.split("T")[0];

      // If user changed the date to another day, remove from current day list
      if (updatedDateKey !== selectedDateKey) {
        setTasks((prev) => prev.filter((t) => t.id !== updatedTask.id));
        success("Task updated and moved to assigned date!");
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? data.task : t))
        );
        success("Task changes saved");
      }
    } catch {
      toastError("Network error saving task");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col selection:bg-stone-900 selection:text-stone-50">
      <DashboardHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Top Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              To-Do List
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              Daily Tasks
            </span>
          </div>
          <p className="text-sm text-stone-500">
            Keep track of the things you need to get done.
          </p>
        </div>

        {/* Date Navigator */}
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Progress Indicator Card & Celebration */}
        <TodoProgressWidget
          totalCount={tasks.length}
          completedCount={completedTasks.length}
        />

        {/* Scheduled Calendar Events for this date */}
        <TodayEventsSnippet selectedDate={selectedDate} />

        {/* Quick Add Task Input */}
        <div className="pt-1">
          <QuickAddTaskInput onAddTask={handleAddTask} />
        </div>

        {/* Optional Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <button
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 font-medium",
                categoryFilter === "all"
                  ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                  : "bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50"
              )}
            >
              All Categories
            </button>
            {TODO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setCategoryFilter(categoryFilter === cat ? "all" : cat)
                }
                className={cn(
                  "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 font-medium",
                  categoryFilter === cat
                    ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                    : "bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-stone-400 text-[11px] font-medium hidden sm:inline">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-stone-200/90 rounded-lg px-2 py-1 text-xs text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              {TODO_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-stone-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
            <p className="text-xs font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center rounded-2xl bg-white border border-dashed border-stone-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Your to-do list is empty.
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Add something you want to get done today.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Tasks Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  To-Do List ({activeTasks.length})
                </span>
              </div>

              {activeTasks.length === 0 ? (
                <div className="py-6 px-4 text-center rounded-xl bg-stone-50/70 border border-stone-200/60 text-xs text-stone-500">
                  All active tasks for this day are completed! 🎉
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTasks.map((task) => (
                    <TodoTaskItem
                      key={task.id}
                      task={task}
                      isPastDate={isPastDate}
                      onToggleComplete={handleToggleComplete}
                      onClick={(t) => setSelectedTaskForDetail(t)}
                      onMoveToToday={handleMoveToToday}
                      onDelete={(t) => handleDeleteTask(t.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks Section (Collapsible) */}
            {completedTasks.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors cursor-pointer px-1"
                >
                  {isCompletedExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                  <span>Completed ({completedTasks.length})</span>
                </button>

                {isCompletedExpanded && (
                  <div className="space-y-2 animate-fade-in">
                    {completedTasks.map((task) => (
                      <TodoTaskItem
                        key={task.id}
                        task={task}
                        isPastDate={isPastDate}
                        onToggleComplete={handleToggleComplete}
                        onClick={(t) => setSelectedTaskForDetail(t)}
                        onDelete={(t) => handleDeleteTask(t.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      <TodoTaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onMoveToToday={handleMoveToToday}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}

