"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TodoPage() {
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
      setOverdueCount(data.overdueCount || 0);
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
        setOverdueCount((prev) => Math.max(0, prev - 1));
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

  // Move All to Today handler (bulk rollover)
  const handleMoveAllToToday = async (fromDate?: string) => {
    try {
      setIsMovingAll(true);
      const res = await fetch("/api/todos/move-all-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fromDate ? { fromDate } : {}),
      });

      if (!res.ok) {
        toastError("Failed to move tasks to today");
        return;
      }

      const data = await res.json();
      const count = data.count || 0;

      if (count === 0) {
        success("No unfinished tasks from previous days to move.");
        return;
      }

      success(`Moved ${count} unfinished ${count === 1 ? "task" : "tasks"} to Today!`);
      
      if (selectedDateKey !== todayKey) {
        setSelectedDate(new Date());
      } else {
        fetchTasks();
      }
    } catch {
      toastError("Network error moving tasks to today");
    } finally {
      setIsMovingAll(false);
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
        {/* Page Top Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-900 font-serif-heading leading-tight">
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

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="font-semibold shadow-sm self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </Button>
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

        {/* Pending Rollover Banner for Today */}
        {!isPastDate && overdueCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-900">
                  {overdueCount} unfinished {overdueCount === 1 ? "task" : "tasks"} from previous days
                </p>
                <p className="text-[11px] text-amber-700/90">
                  Move them to today to keep your daily momentum going.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleMoveAllToToday()}
              disabled={isMovingAll}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50"
            >
              <ArrowRightCircle className="w-3.5 h-3.5" />
              {isMovingAll ? "Moving..." : "Move All to Today"}
            </button>
          </div>
        )}

        {/* Optional Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <button
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 font-medium",
                categoryFilter === "all"
                  ? "bg-[var(--theme-primary,#4F5FD7)] text-white border-[var(--theme-primary,#4F5FD7)] shadow-2xs"
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
                    ? "bg-[var(--theme-primary,#4F5FD7)] text-white border-[var(--theme-primary,#4F5FD7)] shadow-2xs"
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

                {isPastDate && activeTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveAllToToday()}
                    disabled={isMovingAll}
                    title="Move all uncompleted tasks from previous days to Today"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <ArrowRightCircle className="w-3.5 h-3.5 text-amber-700" />
                    {isMovingAll ? "Moving..." : "Move All to Today"}
                  </button>
                )}
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

      {/* Add Task Modal */}
      <AddTodoTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={(newTask) => {
          const taskDateKey = formatToDateKey(new Date(newTask.date));
          if (taskDateKey === selectedDateKey) {
            setTasks((prev) => [...prev, newTask]);
          } else {
            setSelectedDate(new Date(newTask.date));
          }
        }}
        initialDate={selectedDate}
      />

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

