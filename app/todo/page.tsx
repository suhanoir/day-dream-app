"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TodoTaskItem } from "@/components/todo/TodoTaskItem";
import { AddTodoTaskModal } from "@/components/todo/AddTodoTaskModal";
import { TodoTaskDetailModal } from "@/components/todo/TodoTaskDetailModal";
import {
  TodoTaskData,
  TODO_CATEGORIES,
  TaskSortMode,
  TaskStatusFilter,
  getTaskPriorityRank,
  parseTaskDateParts,
} from "@/components/todo/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowUpDown,
  Tag,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TodoPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [tasks, setTasks] = useState<TodoTaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort state
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<TaskSortMode>("priority");
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Modal State
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<TodoTaskData | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Fetch all tasks for the current user
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/todos");
      if (!res.ok) {
        toastError("Failed to fetch your tasks");
        return;
      }

      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error("Error fetching tasks:", e);
      toastError("Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Overall counts before category filter
  const totalCount = tasks.length;
  const totalCompletedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );
  const totalActiveCount = totalCount - totalCompletedCount;

  // Split into active and completed tasks, filtered by category
  const filteredActiveTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed) return false;
      if (categoryFilter !== "all" && t.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [tasks, categoryFilter]);

  const filteredCompletedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.completed) return false;
      if (categoryFilter !== "all" && t.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [tasks, categoryFilter]);

  // Default intelligent priority sort + user-selected sorts
  const sortedActiveTasks = useMemo(() => {
    const list = [...filteredActiveTasks];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (sortBy === "priority") {
      // 1. Overdue High
      // 2. High priority (not overdue)
      // 3. Overdue Medium
      // 4. Medium priority (not overdue)
      // 5. Overdue Low
      // 6. Low priority (not overdue)
      // 7. Tasks without a due date
      list.sort((a, b) => {
        const rankA = getTaskPriorityRank(a, todayStart);
        const rankB = getTaskPriorityRank(b, todayStart);
        if (rankA !== rankB) return rankA - rankB;

        // Within same rank: earlier due date first
        if (a.date && b.date) {
          const partsA = parseTaskDateParts(a.date);
          const partsB = parseTaskDateParts(b.date);
          if (partsA && partsB) {
            const timeA = new Date(partsA.year, partsA.month, partsA.day).getTime();
            const timeB = new Date(partsB.year, partsB.month, partsB.day).getTime();
            if (timeA !== timeB) return timeA - timeB;
          }
        } else if (a.date && !b.date) {
          return -1;
        } else if (!a.date && b.date) {
          return 1;
        }

        // Stable order: creation time ascending
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } else if (sortBy === "date") {
      // Earlier due date first, tasks without date at the end
      list.sort((a, b) => {
        if (a.date && b.date) {
          const partsA = parseTaskDateParts(a.date);
          const partsB = parseTaskDateParts(b.date);
          if (partsA && partsB) {
            const timeA = new Date(partsA.year, partsA.month, partsA.day).getTime();
            const timeB = new Date(partsB.year, partsB.month, partsB.day).getTime();
            if (timeA !== timeB) return timeA - timeB;
          }
        } else if (a.date && !b.date) {
          return -1;
        } else if (!a.date && b.date) {
          return 1;
        }

        // Tie breaker: priority
        const priorityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
        const prioA = priorityOrder[a.priority] || 2;
        const prioB = priorityOrder[b.priority] || 2;
        if (prioA !== prioB) return prioA - prioB;

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } else if (sortBy === "created") {
      // Newest created first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "alphabetical") {
      // Alphabetical A-Z
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [filteredActiveTasks, sortBy]);

  // Completed tasks: sorted by completion date or creation date descending
  const sortedCompletedTasks = useMemo(() => {
    const list = [...filteredCompletedTasks];
    list.sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
    return list;
  }, [filteredCompletedTasks]);

  // Fast completion handler
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

    setSelectedTaskForDetail((prev) =>
      prev && prev.id === task.id
        ? {
            ...prev,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
          }
        : prev
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
        setSelectedTaskForDetail((prev) => (prev && prev.id === task.id ? task : prev));
        toastError("Failed to update task status");
      } else {
        const data = await res.json();
        const updated = data.task || data.todo;
        if (updated) {
          setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
          setSelectedTaskForDetail((prev) => (prev && prev.id === task.id ? updated : prev));
        }
      }
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setSelectedTaskForDetail((prev) => (prev && prev.id === task.id ? task : prev));
      toastError("Network error while updating task");
    }
  };

  // Save changes handler for Edit Task modal (Section 50: Crash prevention & seamless refresh)
  const handleSaveTask = async (updatedTask: TodoTaskData) => {
    const res = await fetch(`/api/todos/${updatedTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || "Couldn't save this task. Please try again.";
      toastError(errMsg);
      throw new Error(errMsg);
    }

    const data = await res.json();
    const savedTask: TodoTaskData = data.task || data.todo || updatedTask;

    // Update in-memory state smoothly without page reload
    setTasks((prev) => prev.map((t) => (t.id === savedTask.id ? savedTask : t)));
    success("Task updated successfully");
    setSelectedTaskForDetail(null);
  };

  // Delete task handler
  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`/api/todos/${taskId}`, { method: "DELETE" });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || "Failed to delete task";
      toastError(errMsg);
      throw new Error(errMsg);
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskForDetail(null);
    success("Task deleted");
  };

  return (
    <AppShell title="To-Do">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* ============================================================= */}
        {/* 1. PAGE HEADER                                                */}
        {/* ============================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif-heading">
              To-Do
            </h1>
            <p className="text-xs sm:text-sm text-secondary">
              Keep track of what needs to get done.
              {totalCount > 0 && (
                <span className="text-muted ml-1.5 font-medium">
                  · {totalCompletedCount} of {totalCount} completed
                </span>
              )}
            </p>
          </div>

          {/* Primary Action Button: Immediately visible & responsive */}
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="font-semibold shadow-sm self-start sm:self-auto shrink-0 gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Task</span>
          </Button>
        </div>

        {/* ============================================================= */}
        {/* 2. TASK CONTROLS & TOOLBAR                                    */}
        {/* ============================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {/* Status Tabs: [ All ] [ Active ] [ Completed ] */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-white/5 rounded-xl border border-stone-200/60 dark:border-white/10 self-start">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "all"
                  ? "glass-tab-active shadow-2xs font-semibold"
                  : "text-secondary hover:text-primary"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "active"
                  ? "glass-tab-active shadow-2xs font-semibold"
                  : "text-secondary hover:text-primary"
              )}
            >
              Active
              {filteredActiveTasks.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({filteredActiveTasks.length})
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                statusFilter === "completed"
                  ? "glass-tab-active shadow-2xs font-semibold"
                  : "text-secondary hover:text-primary"
              )}
            >
              Completed
              {filteredCompletedTasks.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({filteredCompletedTasks.length})
                </span>
              )}
            </button>
          </div>

          {/* Right Toolbar: Compact Category & Sort Dropdowns */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="text-xs font-medium py-1.5 pl-2.5 pr-7 rounded-xl glass-input text-primary border border-stone-200/70 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] appearance-none cursor-pointer"
              >
                <option value="all">Category: All</option>
                {TODO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Tag className="w-3 h-3 text-muted pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Control */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as TaskSortMode)}
                aria-label="Sort tasks"
                className="text-xs font-medium py-1.5 pl-2.5 pr-7 rounded-xl glass-input text-primary border border-stone-200/70 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] appearance-none cursor-pointer"
              >
                <option value="priority">Sort: Priority</option>
                <option value="date">Sort: Due Date</option>
                <option value="created">Sort: Created</option>
                <option value="alphabetical">Sort: Alphabetical</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-muted pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* 3. TASK LIST / EMPTY STATES                                  */}
        {/* ============================================================= */}
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-muted animate-spin mx-auto" />
            <p className="text-xs text-muted">Loading your tasks...</p>
          </div>
        ) : totalCount === 0 ? (
          /* Empty State: Absolutely no tasks */
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-white/5 text-muted flex items-center justify-center mx-auto border border-stone-200/50 dark:border-white/10 shadow-2xs">
              <ListTodo className="w-7 h-7 text-[var(--theme-primary)] opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-primary font-serif-heading">
              Nothing on your list.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Add a task when there&apos;s something you want to get done.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddTaskModalOpen(true)}
                className="font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>
        ) : filteredActiveTasks.length === 0 && filteredCompletedTasks.length === 0 ? (
          /* Category filter empty state */
          <div className="py-16 text-center space-y-2 max-w-sm mx-auto">
            <p className="text-sm font-semibold text-primary">No tasks in &quot;{categoryFilter}&quot;.</p>
            <p className="text-xs text-muted">Try choosing another category or clear the filter.</p>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className="text-xs font-semibold text-[var(--theme-primary)] hover:underline pt-1 cursor-pointer"
            >
              Show all categories
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ACTIVE TASKS SECTION */}
            {(statusFilter === "all" || statusFilter === "active") && (
              <section className="space-y-2.5">
                {/* Active Section Header */}
                <div className="flex items-center justify-between pb-1 border-b border-stone-200/40 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      Active Tasks
                    </span>
                    <span className="text-[11px] font-semibold text-muted">
                      ({sortedActiveTasks.length})
                    </span>
                  </div>
                </div>

                {sortedActiveTasks.length === 0 ? (
                  /* User completed all tasks */
                  <div className="p-6 rounded-2xl glass-card text-center space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-primary">
                      You&apos;re all caught up.
                    </p>
                    <p className="text-xs text-muted">
                      Everything on your list is complete.
                    </p>
                    {filteredCompletedTasks.length > 0 && !isCompletedExpanded && statusFilter === "all" && (
                      <button
                        type="button"
                        onClick={() => setIsCompletedExpanded(true)}
                        className="text-xs font-semibold text-[var(--theme-primary)] hover:underline pt-1 cursor-pointer"
                      >
                        View Completed ({filteredCompletedTasks.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedActiveTasks.map((task) => (
                      <TodoTaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onClick={(t) => setSelectedTaskForDetail(t)}
                        onDelete={async (t) => handleDeleteTask(t.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* COMPLETED TASKS SECTION */}
            {(statusFilter === "all" || statusFilter === "completed") &&
              filteredCompletedTasks.length > 0 && (
                <section className="pt-2 border-t border-stone-200/60 dark:border-white/10 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                    className="flex items-center justify-between w-full text-xs font-bold text-muted hover:text-primary py-1 cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Completed ({sortedCompletedTasks.length})</span>
                    </span>
                    {isCompletedExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isCompletedExpanded && (
                    <div className="space-y-2 pt-1">
                      {sortedCompletedTasks.map((task) => (
                        <TodoTaskItem
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onClick={(t) => setSelectedTaskForDetail(t)}
                          onDelete={async (t) => handleDeleteTask(t.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TodoTaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />

      {/* Add Task Modal */}
      <AddTodoTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        initialDate={new Date()}
        onTaskAdded={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
      />
    </AppShell>
  );
}
