"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TodoTaskItem } from "@/components/todo/TodoTaskItem";
import { AddTodoTaskModal } from "@/components/todo/AddTodoTaskModal";
import { TodoTaskDetailModal } from "@/components/todo/TodoTaskDetailModal";
import { DateNavigator } from "@/components/todo/DateNavigator";
import { TodoProgressWidget } from "@/components/todo/TodoProgressWidget";
import { TodayEventsSnippet } from "@/components/todo/TodayEventsSnippet";
import {
  TodoTaskData,
  TODO_CATEGORIES,
  TODO_PRIORITIES,
  formatToDateKey,
} from "@/components/todo/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Loader2,
  Moon,
  Sparkles,
  ArrowRight,
  LayoutList,
  Layers,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type TaskGroupMode = "priority" | "dream";

export default function TodayPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TodoTaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);

  // Grouping & Filter states
  const [groupMode, setGroupMode] = useState<TaskGroupMode>("priority");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Modal State
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<TodoTaskData | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Active Dream for Desktop Side Panel
  const [activeDreamInFocus, setActiveDreamInFocus] = useState<any | null>(null);

  const selectedDateKey = formatToDateKey(selectedDate);
  const todayKey = formatToDateKey(new Date());
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

  // Fetch active dream for the side panel (Section 5.10)
  useEffect(() => {
    if (user) {
      fetch("/api/bucket-list?status=active")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.items && data.items.length > 0) {
            const best =
              data.items.find((d: any) => d.targetDate) ||
              data.items.find((d: any) => d.todos && d.todos.length > 0) ||
              data.items[0];
            setActiveDreamInFocus(best);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Split into active and completed tasks
  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed),
    [tasks]
  );

  // Priority-based split (Section 5.2)
  const highPriorityTasks = useMemo(
    () => activeTasks.filter((t) => t.priority === "High"),
    [activeTasks]
  );
  const normalPriorityTasks = useMemo(
    () => activeTasks.filter((t) => t.priority !== "High"),
    [activeTasks]
  );

  // Dream-based grouping (Section 5.4)
  const dreamGroups = useMemo(() => {
    const groups: Record<
      string,
      { title: string; dreamId?: string; tasks: TodoTaskData[] }
    > = {};

    activeTasks.forEach((t) => {
      const key = t.bucketListItemId || "independent";
      const title = t.bucketListItem?.title || "Independent Actions";
      if (!groups[key]) {
        groups[key] = { title, dreamId: t.bucketListItemId || undefined, tasks: [] };
      }
      groups[key].tasks.push(t);
    });

    return Object.values(groups);
  }, [activeTasks]);

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

  // Desktop side panel (Section 5.10: Dream in Focus)
  const sidePanelContent = (
    <div className="space-y-5">
      {/* Today's Progress Widget */}
      <TodoProgressWidget totalCount={tasks.length} completedCount={completedTasks.length} />

      {/* Dream in Focus Card */}
      {activeDreamInFocus && (
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-accent" />
              Dream in Focus
            </span>
            {activeDreamInFocus.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-md glass-card text-secondary font-medium">
                {activeDreamInFocus.category.name}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-primary truncate">
              {activeDreamInFocus.title}
            </h4>
            {activeDreamInFocus.todos && activeDreamInFocus.todos.length > 0 ? (
              <p className="text-[11px] text-muted">
                {activeDreamInFocus.todos.filter((t: any) => t.completed).length} of{" "}
                {activeDreamInFocus.todos.length} actions complete
              </p>
            ) : (
              <p className="text-[11px] text-muted italic">Ready to plan</p>
            )}
          </div>

          {/* Next Action if available */}
          {(() => {
            const nextAction = activeDreamInFocus.todos?.find((t: any) => !t.completed);
            if (nextAction) {
              return (
                <div className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 text-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block mb-0.5">
                    Next Action:
                  </span>
                  <p className="font-medium text-primary truncate">{nextAction.title}</p>
                </div>
              );
            }
            return null;
          })()}

          <div className="pt-1">
            <Link
              href={`/dreams?id=${activeDreamInFocus.id}`}
              className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>Continue Dream</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Today's Events Snippet */}
      <TodayEventsSnippet selectedDate={selectedDate} />
    </div>
  );

  const formattedHeaderDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell title="Today" sidePanel={sidePanelContent}>
      <div className="space-y-6">
        {/* Page Top Header (Section 5.1) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary font-serif-heading leading-tight">
                Today
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-secondary border border-stone-200/70 dark:border-white/10">
                {formattedHeaderDate}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-secondary">
              Small steps toward the things you want to live.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
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

        {/* Overdue rollover alert banner (Section 5.5) */}
        {overdueCount > 0 && isToday && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-amber-950 dark:text-amber-200 font-medium truncate">
                Carry these forward? You have {overdueCount} uncompleted task{overdueCount === 1 ? "" : "s"} from past days.
              </span>
            </div>
            <button
              type="button"
              onClick={handleMoveAllToToday}
              disabled={isMovingAll}
              className="font-bold text-amber-900 dark:text-amber-300 hover:underline shrink-0 cursor-pointer"
            >
              {isMovingAll ? "Moving..." : "Move All to Today →"}
            </button>
          </div>
        )}

        {/* Toolbar: Grouping Mode Switcher & Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* View Grouping Switcher (Section 5.4) */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-white/5 rounded-xl border border-stone-200/60 dark:border-white/10 self-start">
            <button
              type="button"
              onClick={() => setGroupMode("priority")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                groupMode === "priority"
                  ? "glass-tab-active shadow-2xs font-semibold"
                  : "text-secondary hover:text-primary"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Priority</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupMode("dream")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                groupMode === "dream"
                  ? "glass-tab-active shadow-2xs font-semibold"
                  : "text-secondary hover:text-primary"
              )}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>By Dream</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                categoryFilter === "all"
                  ? "glass-tab-active shadow-2xs font-semibold"
                  : "text-secondary hover:text-primary"
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
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                  categoryFilter === cat
                    ? "glass-tab-active shadow-2xs font-semibold"
                    : "text-secondary hover:text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Task List / Empty State (Section 5.9) */}
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-muted animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted">Gathering today&apos;s actions...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State (Section 5.9) */
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-white/5 text-muted flex items-center justify-center mx-auto border border-stone-200/50 dark:border-white/10 shadow-2xs">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-primary font-serif-heading">
              Nothing you need to chase today.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Take a quiet breath, or explore your dreams to choose your next step.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
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
                <Button variant="outline" size="md" className="font-semibold">
                  <span>Explore Dreams</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : groupMode === "dream" ? (
          /* View By Dream Grouping (Section 5.4) */
          <div className="space-y-6">
            {dreamGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-stone-200/40 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span>🌙</span>
                      <span>{group.title}</span>
                    </span>
                    <span className="text-[10.5px] text-muted font-medium">
                      ({group.tasks.length})
                    </span>
                  </div>
                  {group.dreamId && (
                    <Link
                      href={`/dreams?id=${group.dreamId}`}
                      className="text-[11px] font-semibold text-accent hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>View Dream</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="space-y-2">
                  {group.tasks.map((task) => (
                    <TodoTaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onClick={(t) => setSelectedTaskForDetail(t)}
                      onMoveToToday={handleMoveToToday}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Completed Tasks Group */}
            {completedTasks.length > 0 && (
              <div className="pt-2 border-t border-stone-200/60 dark:border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="flex items-center justify-between w-full text-xs font-bold text-muted hover:text-primary py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed Actions ({completedTasks.length})</span>
                  </span>
                  {isCompletedExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isCompletedExpanded && (
                  <div className="space-y-2 pt-1">
                    {completedTasks.map((task) => (
                      <TodoTaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onClick={(t) => setSelectedTaskForDetail(t)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* View By Priority (Section 5.2) */
          <div className="space-y-5">
            {/* High Priority / Focus Section */}
            {highPriorityTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <Flag className="w-3.5 h-3.5" />
                  <span>Important Focus ({highPriorityTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {highPriorityTasks.map((task) => (
                    <TodoTaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onClick={(t) => setSelectedTaskForDetail(t)}
                      onMoveToToday={handleMoveToToday}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Active Actions */}
            {normalPriorityTasks.length > 0 && (
              <div className="space-y-2">
                {highPriorityTasks.length > 0 && (
                  <div className="text-xs font-bold text-muted uppercase tracking-wider">
                    Other Actions ({normalPriorityTasks.length})
                  </div>
                )}
                <div className="space-y-2">
                  {normalPriorityTasks.map((task) => (
                    <TodoTaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onClick={(t) => setSelectedTaskForDetail(t)}
                      onMoveToToday={handleMoveToToday}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks Collapsible */}
            {completedTasks.length > 0 && (
              <div className="pt-3 border-t border-stone-200/60 dark:border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  className="flex items-center justify-between w-full text-xs font-bold text-muted hover:text-primary py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed Actions ({completedTasks.length})</span>
                  </span>
                  {isCompletedExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {isCompletedExpanded && (
                  <div className="space-y-2 pt-1">
                    {completedTasks.map((task) => (
                      <TodoTaskItem
                        key={task.id}
                        task={task}
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
          const res = await fetch(`/api/todos/${updatedTask.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error || "Failed to update task";
            toastError(errMsg);
            throw new Error(errMsg);
          }

          const data = await res.json();
          const savedTask: TodoTaskData = data.task || data.todo || updatedTask;

          // Check if date was changed to a different day
          const taskDateKey = savedTask.date ? savedTask.date.split("T")[0] : selectedDateKey;
          if (taskDateKey !== selectedDateKey) {
            // Task date was moved to another day, remove from current day list
            setTasks((prev) => prev.filter((t) => t.id !== savedTask.id));
          } else {
            // Update in place
            setTasks((prev) => prev.map((t) => (t.id === savedTask.id ? savedTask : t)));
          }

          success("Task updated successfully");
          setSelectedTaskForDetail(null);
        }}
        onDelete={async (taskId) => {
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
          if (newTask.date.split("T")[0] === selectedDateKey) {
            setTasks((prev) => [newTask, ...prev]);
          }
        }}
      />
    </AppShell>
  );
}
