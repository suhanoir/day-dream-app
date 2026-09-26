"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BucketListItemData, getDreamStatus, DreamStatus } from "./BucketListItemCard";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Quote,
  Pencil,
  Trash2,
  Save,
  CalendarPlus,
  ListTodo,
  Sparkles,
  Plus,
  ArrowRight,
  Check,
  Compass,
  Target,
  Coins,
  Loader2,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { useSound } from "@/components/providers/SoundProvider";
import { PostcardEditorModal } from "@/components/memory/PostcardEditorModal";
import Link from "next/link";

export interface BucketListItemDetailModalProps {
  item: BucketListItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedItem: BucketListItemData) => void;
  onDelete: (itemId: string) => void;
  onEditClick: (item: BucketListItemData) => void;
}

export function BucketListItemDetailModal({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onEditClick,
}: BucketListItemDetailModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [reflectionText, setReflectionText] = useState("");
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRememberPrompt, setShowRememberPrompt] = useState(false);

  // Planning modals
  const [isScheduleCalendarOpen, setIsScheduleCalendarOpen] = useState(false);
  const [isAddToTodoOpen, setIsAddToTodoOpen] = useState(false);
  const [todoTaskTitle, setTodoTaskTitle] = useState("");
  const [todoTaskDate, setTodoTaskDate] = useState("");
  const [isAddingToTodo, setIsAddingToTodo] = useState(false);
  const [isPostcardModalOpen, setIsPostcardModalOpen] = useState(false);

  // Linked tasks state
  const [dreamTasks, setDreamTasks] = useState<
    Array<{
      id: string;
      title: string;
      completed: boolean;
      date?: string;
      priority?: string;
    }>
  >([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const nextActionRef = useRef<HTMLDivElement>(null);

  // Fetch tasks linked to this dream
  const fetchDreamTasks = useCallback(async () => {
    if (!item?.id) return;
    try {
      setIsLoadingTasks(true);
      const res = await fetch(`/api/todos?bucketListItemId=${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setDreamTasks(data.tasks || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingTasks(false);
    }
  }, [item?.id]);

  // Sync reflection text and tasks when item changes
  useEffect(() => {
    if (item && isOpen) {
      setReflectionText(item.reflection || "");
      setIsEditingReflection(false);
      setShowRememberPrompt(false);
      setTodoTaskTitle("");
      setTodoTaskDate(
        item.targetDate
          ? item.targetDate.split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      if (item.todos) {
        setDreamTasks(item.todos);
      }
      fetchDreamTasks();
    }
  }, [item, isOpen, fetchDreamTasks]);

  // Compute status
  const status: DreamStatus = useMemo(() => {
    if (!item) return "Dreaming";
    return getDreamStatus({ ...item, todos: dreamTasks });
  }, [item, dreamTasks]);

  if (!item) return null;

  // Real action counts
  const totalTasks = dreamTasks.length;
  const completedTasks = dreamTasks.filter((t) => t.completed).length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const nextActionTask = dreamTasks.find((t) => !t.completed);

  // Toggle task completion within Dream Container
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (togglingTaskId) return;
    setTogglingTaskId(taskId);
    const nextCompleted = !currentCompleted;

    // Optimistic update
    setDreamTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t))
    );

    try {
      const res = await fetch(`/api/todos/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (res.ok) {
        if (nextCompleted) playSound("ui-click");
      } else {
        fetchDreamTasks();
      }
    } catch {
      fetchDreamTasks();
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Create new task linked directly to this Dream
  const handleCreateTodoFromGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTaskTitle.trim()) return;
    try {
      setIsAddingToTodo(true);
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: todoTaskTitle.trim(),
          date: todoTaskDate ? `${todoTaskDate}T00:00:00.000Z` : new Date().toISOString(),
          category: item.category?.name || "Personal",
          priority: "Medium",
          description: `Linked to dream: ${item.title}`,
          bucketListItemId: item.id,
        }),
      });

      if (!res.ok) {
        toastError("Failed to add task to To-Do.");
        return;
      }

      playSound("success");
      success("Task added to your To-Do list!");
      setIsAddToTodoOpen(false);
      setTodoTaskTitle("");
      fetchDreamTasks();
    } catch {
      toastError("Network error adding task.");
    } finally {
      setIsAddingToTodo(false);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"],
    });
  };

  const handleToggleComplete = async () => {
    setIsTogglingComplete(true);
    const newCompleted = !item.completed;

    try {
      const res = await fetch(`/api/bucket-list/${item.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to update status.");
        return;
      }

      onUpdate(data.item);

      if (newCompleted) {
        playSound("dream.completed");
        triggerCelebration();
        success("Dream achieved! 🎉 Take a moment to capture the memory.");
        setShowRememberPrompt(true);
      } else {
        setShowRememberPrompt(false);
        success("Dream moved back to active.");
      }
    } catch {
      toastError("Failed to update completion status.");
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const handleSaveReflection = async () => {
    setIsSavingReflection(true);

    try {
      const res = await fetch(`/api/bucket-list/${item.id}/reflection`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: reflectionText }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to save reflection.");
        return;
      }

      playSound("memory.journalSaved");
      onUpdate(data.item);
      setIsEditingReflection(false);
      setShowRememberPrompt(false);
      success("Memory reflection saved permanently.");
    } catch {
      toastError("Failed to save reflection.");
    } finally {
      setIsSavingReflection(false);
    }
  };

  const handleDeleteItem = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/bucket-list/${item.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to delete dream.");
        return;
      }

      setShowDeleteConfirm(false);
      onDelete(item.id);
      onClose();
      success("Dream removed.");
    } catch {
      toastError("Failed to delete dream.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedCreatedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedCompletedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Status visual style
  const statusStyles: Record<DreamStatus, string> = {
    Dreaming: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    Planning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    "In Progress": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  };

  const journeySteps = ["DREAM", "PLAN", "DO", "LIVE", "REMEMBER"];
  const currentStepIndex =
    status === "Completed"
      ? 4
      : status === "In Progress"
      ? 3
      : status === "Planning"
      ? 1
      : 0;

  const isNearlyComplete = !item.completed && totalTasks > 0 && completedTasks === totalTasks;

  // Contextual primary action (Section 3.8)
  const handlePrimaryAction = () => {
    if (item.completed) {
      setIsPostcardModalOpen(true);
    } else if (isNearlyComplete) {
      handleToggleComplete();
    } else if (status === "Dreaming" || dreamTasks.length === 0) {
      setTodoTaskTitle("");
      setIsAddToTodoOpen(true);
    } else {
      // In Progress -> Focus Next Action
      nextActionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const primaryActionLabel = item.completed
    ? "View Keepsake"
    : isNearlyComplete
    ? "Finish Dream"
    : status === "In Progress"
    ? "Continue"
    : status === "Planning"
    ? (dreamTasks.length === 0 ? "Add First Action" : "Continue Dream")
    : "Start Planning";

  // Section 3.7 & 3.11: Adaptive Memory section component
  const renderMemorySection = () => (
    <section className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/50 dark:border-stone-800/80">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-muted" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
            {item.completed ? "Memory & Keepsake" : "Personal Vision & Reflection"}
          </h3>
        </div>

        {!isEditingReflection && item.reflection && (
          <button
            type="button"
            onClick={() => setIsEditingReflection(true)}
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            <span>Edit Reflection</span>
          </button>
        )}
      </div>

      {/* Display Saved Reflection or Editor */}
      {!isEditingReflection && item.reflection ? (
        <div className="relative p-4 rounded-2xl glass-journal text-primary">
          <Quote className="w-7 h-7 text-muted opacity-30 absolute top-3 right-3 pointer-events-none" />
          <p className="text-sm leading-relaxed whitespace-pre-wrap italic font-serif text-primary">
            &ldquo;{item.reflection}&rdquo;
          </p>
          {formattedCompletedDate && (
            <div className="mt-2.5 pt-2.5 border-t border-stone-200/60 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-muted">
              <span>Captured memory</span>
              <span>{formattedCompletedDate}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <Textarea
            rows={3}
            placeholder={
              item.completed
                ? "Tell your future self about this experience... How did it feel? What made it unforgettable?"
                : "Write what you hope to experience, why this dream matters to you, or your thoughts so far..."
            }
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="text-sm leading-relaxed"
          />

          <div className="flex items-center justify-end gap-2">
            {item.reflection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReflectionText(item.reflection || "");
                  setIsEditingReflection(false);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveReflection}
              isLoading={isSavingReflection}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Reflection
            </Button>
          </div>
        </div>
      )}

      {/* Memory Postcard & Scrapbook Callout */}
      {item.completed && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-200/50 dark:border-stone-800/80">
          <div className="text-xs">
            <span className="font-semibold text-primary block">
              Authentic Memory Keepsake
            </span>
            <span className="text-muted text-[11px]">
              Curate photos, customize composition, and save to your phone
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPostcardModalOpen(true)}
              className="text-xs font-semibold gap-1.5 shadow-2xs border-amber-500/30 text-amber-900 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {item.memoryPhoto || (item.memoryPhotos && item.memoryPhotos !== "[]")
                  ? "View Keepsake Postcard"
                  : "Create Keepsake Postcard"}
              </span>
            </Button>

            <Link
              href="/memories"
              onClick={onClose}
              className="p-1.5 text-muted hover:text-primary rounded-lg transition-colors"
              title="View Scrapbook"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={true}>
        <div className="space-y-6">
          {/* ========================================================= */}
          {/* 1. HEADER (Title, Category, Status, Target Date)          */}
          {/* ========================================================= */}
          <div className="border-b border-stone-200/60 dark:border-stone-800/80 pb-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.category && (
                  <CategoryBadge
                    name={item.category.name}
                    color={item.category.color}
                    size="md"
                  />
                )}
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    statusStyles[status]
                  )}
                >
                  {status}
                </span>
                <span className="text-xs text-muted font-normal">
                  Added {formattedCreatedDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditClick(item);
                  }}
                  className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Edit Dream"
                  aria-label="Edit Dream"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-muted hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Delete Dream"
                  aria-label="Delete Dream"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Context-Sensitive Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-serif-heading">
                  {item.title}
                  {item.completed && (
                    <span className="text-emerald-500 ml-2 font-normal text-xl">✓</span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <Button
                  type="button"
                  onClick={handlePrimaryAction}
                  variant="primary"
                  size="sm"
                  className="font-semibold shadow-2xs gap-1"
                >
                  <span>{primaryActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>

                <Button
                  type="button"
                  onClick={handleToggleComplete}
                  isLoading={isTogglingComplete}
                  variant={item.completed ? "outline" : "ghost"}
                  size="sm"
                  className={cn(
                    "font-semibold text-xs",
                    item.completed &&
                      "border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                  )}
                >
                  {item.completed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
                      Achieved
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 mr-1" />
                      Mark Achieved
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Subtle Dream Journey Indicator */}
            <div className="pt-1">
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold tracking-wider text-muted">
                {journeySteps.map((step, idx) => {
                  const isPast = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <React.Fragment key={step}>
                      <span
                        className={cn(
                          "transition-colors",
                          isCurrent
                            ? "text-[var(--theme-primary)] font-extrabold"
                            : isPast
                            ? "text-primary/80 font-semibold"
                            : "text-muted/60"
                        )}
                      >
                        {step}
                      </span>
                      {idx < journeySteps.length - 1 && (
                        <span className="text-muted/40 font-normal">→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CALM COMPLETION FLOW NOTIFICATION (Section 6.12)          */}
          {/* ========================================================= */}
          {showRememberPrompt && item.completed && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Want to remember this one?
                </span>
              </div>
              <p className="text-xs text-amber-950/80 dark:text-amber-300/80 leading-relaxed">
                Take a quiet moment to capture a personal thought, or create an authentic keepsakes postcard.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEditingReflection(true)}
                  className="text-xs font-semibold"
                >
                  Add Reflection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPostcardModalOpen(true)}
                  className="text-xs font-semibold"
                >
                  Create Postcard
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRememberPrompt(false)}
                  className="text-xs text-muted hover:text-primary"
                >
                  Done for now
                </Button>
              </div>
            </div>
          )}

          {/* Section 3.7 & 3.11: For Achieved Dreams, Memory & Reflection sits prominently at top */}
          {item.completed && renderMemorySection()}

          {/* ========================================================= */}
          {/* 2. NEXT ACTION (Prioritized for Active Dreams)            */}
          {/* ========================================================= */}
          {!item.completed && (
            <div ref={nextActionRef}>
              <section className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-accent" />
                    Next Action
                  </span>
                  {nextActionTask && (
                    <Link
                      href="/todo"
                      onClick={onClose}
                      className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open in To-Do</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {nextActionTask ? (
                  <div className="p-3.5 rounded-xl bg-stone-50/80 dark:bg-white/5 border border-stone-200/60 dark:border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(nextActionTask.id, nextActionTask.completed)}
                        disabled={togglingTaskId === nextActionTask.id}
                        className="w-4 h-4 rounded border flex items-center justify-center shrink-0 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 cursor-pointer"
                        aria-label="Mark action complete"
                      >
                        {nextActionTask.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className="text-xs font-semibold text-primary truncate">
                        {nextActionTask.title}
                      </span>
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20 shrink-0 font-medium">
                      Ready to do
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-dashed border-stone-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted">
                      No action steps yet. Add your first concrete step to get this dream moving.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTodoTaskTitle("");
                        setIsAddToTodoOpen(true);
                      }}
                      className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Action</span>
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. OVERVIEW (Description)                                 */}
          {/* ========================================================= */}
          {item.description && (
            <section className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                Overview
              </span>
              <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. PLAN & SCHEDULE                                        */}
          {/* ========================================================= */}
          <section className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Planning & Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleCalendarOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule on Calendar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-muted block">
                    Target Milestone
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {item.targetDate
                      ? new Date(item.targetDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No target date set"}
                  </span>
                </div>
                <Calendar className="w-4 h-4 text-muted shrink-0" />
              </div>

              <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-muted block">
                    Calendar Connection
                  </span>
                  <Link
                    href="/calendar"
                    onClick={onClose}
                    className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Calendar</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <Compass className="w-4 h-4 text-muted shrink-0" />
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. TASKS / ACTIONS (Section 4.7)                          */}
          {/* ========================================================= */}
          <section className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/50 dark:border-stone-800/80">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Action Steps {totalTasks > 0 && `(${completedTasks} of ${totalTasks} complete)`}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTodoTaskTitle("");
                  setIsAddToTodoOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-stone-100/90 dark:bg-white/10 hover:bg-stone-200/80 dark:hover:bg-white/15 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Real Progress (Section 4.4 - no artificial percentages) */}
            {totalTasks > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">
                    {completedTasks === totalTasks
                      ? "All action steps completed! 🎉"
                      : `${totalTasks - completedTasks} action step${totalTasks - completedTasks === 1 ? "" : "s"} remaining`}
                  </span>
                  <span className="font-bold text-primary">
                    {completedTasks} of {totalTasks} complete
                  </span>
                </div>
                <div className="w-full bg-stone-200/60 dark:bg-stone-800/80 rounded-full h-2 overflow-hidden shadow-inner p-0.5">
                  <div
                    className="bg-linear-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] h-full rounded-full transition-all duration-300"
                    style={{ width: `${taskProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tasks List */}
            {isLoadingTasks ? (
              <div className="py-4 text-center">
                <Loader2 className="w-5 h-5 text-muted animate-spin mx-auto" />
              </div>
            ) : dreamTasks.length === 0 ? (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs text-muted">
                  No action steps created for this dream yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddToTodoOpen(true)}
                  className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create the first step</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dreamTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all text-xs",
                      task.completed
                        ? "bg-stone-100/40 dark:bg-white/5 border-stone-200/40 dark:border-white/5 text-muted"
                        : "glass-card-interactive text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
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

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted">
                Action steps synchronize with To-Do
              </span>
              <Link
                href="/todo"
                onClick={onClose}
                className="font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Open in To-Do</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. DREAM FUND & BUDGET PREVIEW                            */}
          {/* ========================================================= */}
          <section className="glass-card rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Dream Fund & Budget
                </h3>
              </div>
              <Link
                href="/expenses"
                onClick={onClose}
                className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Manage Expenses</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Track expenditures and plan financial milestones for this experience.
              Seamlessly integrates with your monthly budget.
            </p>
          </section>

          {/* ========================================================= */}
          {/* 7. MEMORY & REFLECTION (LIVE & REMEMBER)                  */}
          {/* ========================================================= */}
          {!item.completed && renderMemorySection()}
        </div>
      </Modal>

      {/* Schedule on Calendar Modal */}
      <AddEventModal
        isOpen={isScheduleCalendarOpen}
        onClose={() => setIsScheduleCalendarOpen(false)}
        onEventAdded={() => {
          setIsScheduleCalendarOpen(false);
          success("Milestone scheduled on your calendar!");
        }}
        initialDate={item.targetDate ? new Date(item.targetDate) : new Date()}
        initialBucketListItem={{
          id: item.id,
          title: item.title,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteItem}
        title="Delete Dream?"
        message={`Are you sure you want to remove "${item.title}"? This action cannot be undone.`}
        confirmText="Delete Dream"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Add Task Linked Directly to Dream Modal */}
      <Modal
        isOpen={isAddToTodoOpen}
        onClose={() => setIsAddToTodoOpen(false)}
        title={`Add Step for: ${item.title}`}
        subtitle="This action step will appear in To-Do and link directly to this Dream"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateTodoFromGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={todoTaskTitle}
              onChange={(e) => setTodoTaskTitle(e.target.value)}
              placeholder="e.g. Book hotel or research train pass"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Scheduled Date
            </label>
            <Input
              type="date"
              required
              value={todoTaskDate}
              onChange={(e) => setTodoTaskDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/60 dark:border-stone-800/80">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddToTodoOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingToTodo}
            >
              Add Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Memory Postcard Editor Modal */}
      <PostcardEditorModal
        isOpen={isPostcardModalOpen}
        onClose={() => setIsPostcardModalOpen(false)}
        item={item}
        onSaved={(updated) => {
          onUpdate(updated);
        }}
      />
    </>
  );
}