"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  TodoTaskData,
  TodoPriority,
  TodoCategory,
  TODO_PRIORITIES,
  TODO_CATEGORIES,
  PRIORITY_STYLES,
  CATEGORY_STYLES,
  formatToDateKey,
} from "./types";
import {
  Calendar,
  Clock,
  Tag,
  Flag,
  Trash2,
  ArrowRightCircle,
  Save,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TodoTaskDetailModalProps {
  task: TodoTaskData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: TodoTaskData) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onMoveToToday: (task: TodoTaskData) => Promise<void>;
  onToggleComplete: (task: TodoTaskData) => Promise<void>;
}

export function TodoTaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onMoveToToday,
  onToggleComplete,
}: TodoTaskDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("Medium");
  const [category, setCategory] = useState<TodoCategory>("Personal");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      // Date in YYYY-MM-DD
      const dateVal = task.date.split("T")[0];
      setDate(dateVal);
      setDueTime(task.dueTime || "");
      setPriority(task.priority || "Medium");
      setCategory((task.category as TodoCategory) || "Personal");
    }
  }, [task]);

  if (!task) return null;

  const todayKey = formatToDateKey(new Date());
  const isNotToday = date !== todayKey;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    try {
      setIsSaving(true);
      await onSave({
        ...task,
        title: title.trim(),
        description: description.trim() || null,
        date: date ? `${date}T00:00:00.000Z` : task.date,
        dueTime: dueTime.trim() || null,
        priority,
        category,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveTodayClick = async () => {
    if (isMoving) return;
    try {
      setIsMoving(true);
      await onMoveToToday(task);
      setDate(todayKey);
    } finally {
      setIsMoving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Task Details"
        subtitle="Manage details, schedule, priority, and category"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Completion status bar */}
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border transition-colors",
              task.completed
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900"
                : "bg-stone-50 border-stone-200/80 text-stone-700"
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              {task.completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Task completed</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-stone-400" />
                  <span>Task in progress</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer",
                task.completed
                  ? "border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
              )}
            >
              {task.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish Java assignment"
              className="text-sm font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or notes..."
              className="text-sm leading-relaxed"
            />
          </div>

          {/* Date & Due Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Due Time
              </label>
              <Input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 5:00 PM"
                className="text-xs"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              <Flag className="w-3.5 h-3.5 text-stone-400" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TODO_PRIORITIES.map((p) => {
                const style = PRIORITY_STYLES[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "py-1.5 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      isSelected
                        ? cn(style.badge, "border-current shadow-2xs font-semibold ring-1 ring-current")
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TODO_CATEGORIES.map((cat) => {
                const style = CATEGORY_STYLES[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "py-1 px-2.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                      isSelected
                        ? cn(style.badge, "ring-1 ring-current font-semibold")
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isNotToday && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMoveTodayClick}
                  isLoading={isMoving}
                  className="text-xs"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5 mr-1" />
                  Move to Today
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
