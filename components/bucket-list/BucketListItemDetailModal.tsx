"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BucketListItemData } from "./BucketListItemCard";
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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { useSound } from "@/components/providers/SoundProvider";
import { PostcardEditorModal } from "@/components/memory/PostcardEditorModal";

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
  const [isScheduleCalendarOpen, setIsScheduleCalendarOpen] = useState(false);
  const [isAddToTodoOpen, setIsAddToTodoOpen] = useState(false);
  const [todoTaskTitle, setTodoTaskTitle] = useState("");
  const [todoTaskDate, setTodoTaskDate] = useState("");
  const [isAddingToTodo, setIsAddingToTodo] = useState(false);
  const [isPostcardModalOpen, setIsPostcardModalOpen] = useState(false);

  // Sync reflection text when item changes
  useEffect(() => {
    if (item) {
      setReflectionText(item.reflection || "");
      setIsEditingReflection(false);
      setTodoTaskTitle(item.title ? `Goal: ${item.title}` : "");
    }
  }, [item]);

  if (!item) return null;

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
          description: `Linked to goal: ${item.title}${item.description ? `\n\n${item.description}` : ""}`,
        }),
      });

      if (!res.ok) {
        toastError("Failed to add task to To-Do List.");
        return;
      }

      playSound("success");
      success("Goal added to your To-Do List!");
      setIsAddToTodoOpen(false);
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
        success("Goal completed! 🎉 Take a moment to capture the memory.");
        setIsEditingReflection(true);
      } else {
        success("Goal moved back to active.");
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
        toastError(data.error || "Failed to delete item.");
        return;
      }

      setShowDeleteConfirm(false);
      onDelete(item.id);
      onClose();
      success("Goal removed from your bucket list.");
    } catch {
      toastError("Failed to delete goal.");
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" showCloseButton={true}>
        <div className="space-y-6">
          {/* Top metadata & Action bar */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800/80 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {item.category && (
                <CategoryBadge
                  name={item.category.name}
                  color={item.category.color}
                  size="md"
                />
              )}
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
                className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                title="Edit Goal"
                aria-label="Edit Goal"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-muted hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete Goal"
                aria-label="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Goal Title */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              {item.title}
              {item.completed && (
                <span className="text-emerald-500 ml-2 font-normal text-xl">✓</span>
              )}
            </h2>

            {/* Optional Description */}
            {item.description && (
              <p className="text-sm text-secondary mt-2 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            )}

            {/* Target Date & Calendar Scheduling */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {item.targetDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                  <Calendar className="w-3.5 h-3.5 text-muted" />
                  <span>Target: {new Date(item.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsScheduleCalendarOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary bg-stone-100/80 dark:bg-white/10 hover:bg-stone-200/80 dark:hover:bg-white/15 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-muted" />
                Schedule on Calendar
              </button>

              <button
                type="button"
                onClick={() => {
                  setTodoTaskTitle(`Work on: ${item.title}`);
                  setTodoTaskDate(
                    item.targetDate
                      ? item.targetDate.split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  );
                  setIsAddToTodoOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary bg-stone-100/80 dark:bg-white/10 hover:bg-stone-200/80 dark:hover:bg-white/15 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <ListTodo className="w-3.5 h-3.5 text-muted" />
                Add to To-Do List
              </button>
            </div>
          </div>

          {/* Completion Section */}
          <div
            className={cn(
              "p-4 rounded-2xl border transition-all duration-200",
              item.completed
                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100"
                : "bg-stone-50/80 dark:bg-white/5 border-stone-200/80 dark:border-white/10"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-0.5">
                  Have you completed this?
                </span>
                {item.completed ? (
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Completed on {formattedCompletedDate || "Recently"}
                  </p>
                ) : (
                  <p className="text-xs text-secondary">
                    Mark this milestone as achieved when you accomplish it.
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleToggleComplete}
                isLoading={isTogglingComplete}
                variant={item.completed ? "outline" : "primary"}
                size="sm"
                className={cn(
                  "shrink-0",
                  item.completed && "border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                )}
              >
                {item.completed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5" />
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5 mr-1.5" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>

            {item.completed && (
              <div className="mt-3.5 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Turn this milestone into an authentic keepsake
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPostcardModalOpen(true)}
                  className="bg-white/80 dark:bg-stone-900/60 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200 hover:bg-white text-xs font-semibold gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {item.memoryPhoto || (item.memoryPhotos && item.memoryPhotos !== "[]")
                      ? "View Memory Postcard"
                      : "Create Memory Postcard"}
                  </span>
                </Button>
              </div>
            )}
          </div>

          {/* Reflection / Memory Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-muted" />
                <h4 className="text-sm font-bold text-primary">
                  {item.completed ? "My Experience & Memory" : "Reflection / Vision"}
                </h4>
              </div>

              {!isEditingReflection && item.reflection && (
                <button
                  type="button"
                  onClick={() => setIsEditingReflection(true)}
                  className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Reflection
                </button>
              )}
            </div>

            {/* Display Saved Memory */}
            {!isEditingReflection && item.reflection ? (
              <div className="relative p-5 rounded-2xl glass-journal text-primary">
                <Quote className="w-8 h-8 text-muted opacity-30 absolute top-3 right-3 pointer-events-none" />
                <p className="text-sm leading-relaxed whitespace-pre-wrap italic font-serif text-primary">
                  &ldquo;{item.reflection}&rdquo;
                </p>
                {formattedCompletedDate && (
                  <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-muted">
                    <span>Captured milestone</span>
                    <span>{formattedCompletedDate}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Reflection Form */
              <div className="space-y-3">
                <Textarea
                  rows={4}
                  placeholder={
                    item.completed
                      ? "Tell your future self about this experience... How did it go? Who were you with? What made it unforgettable?"
                      : "Write what you hope to experience, why this goal matters to you, or your thoughts so far..."
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
          </div>
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
        title="Delete Bucket List Goal?"
        message={`Are you sure you want to remove "${item.title}"? This action cannot be undone.`}
        confirmText="Delete Goal"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Add Goal to To-Do List Modal */}
      <Modal
        isOpen={isAddToTodoOpen}
        onClose={() => setIsAddToTodoOpen(false)}
        title="Add to To-Do List"
        subtitle="Create an actionable daily task from this bucket-list goal"
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
              placeholder="e.g. Study Java for 1 hour"
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