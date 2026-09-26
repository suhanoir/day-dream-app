"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
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
  Plus,
  Calendar,
  Flag,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AddTodoTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: TodoTaskData) => void;
  initialDate?: Date;
  initialBucketListItemId?: string;
  initialBucketListTitle?: string;
}

export function AddTodoTaskModal({
  isOpen,
  onClose,
  onTaskAdded,
  initialDate,
  initialBucketListItemId,
  initialBucketListTitle,
}: AddTodoTaskModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("Medium");
  const [category, setCategory] = useState<TodoCategory>("Personal");
  const [bucketListItemId, setBucketListItemId] = useState<string>("");
  const [activeDreams, setActiveDreams] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch active dreams for the dropdown
  useEffect(() => {
    if (isOpen) {
      fetch("/api/bucket-list?status=active")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.items) {
            setActiveDreams(data.items.map((i: any) => ({ id: i.id, title: i.title })));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDate(formatToDateKey(initialDate || new Date()));
      setPriority("Medium");
      setCategory("Personal");
      setBucketListItemId(initialBucketListItemId || "");
      setFormError("");
    }
  }, [isOpen, initialDate, initialBucketListItemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError("Please enter a task name.");
      return;
    }

    if (!date) {
      setFormError("Please choose a date for the task.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          date: `${date}T00:00:00.000Z`,
          priority,
          category,
          description: description.trim() || null,
          bucketListItemId: bucketListItemId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to add task.");
        toastError(data.error || "Could not add task.");
        return;
      }

      playSound("success");
      success("Task added to your list!");
      onTaskAdded(data.task);
      onClose();
    } catch {
      setFormError("Network error. Please try again.");
      toastError("Network error while adding task.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Task"
      subtitle="Create a task for your to-do list"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 font-medium">
            {formError}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Task Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish quarterly project review"
            className="text-sm font-medium"
          />
        </div>

        {/* Associated Dream (Optional) */}
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            <span>🌙</span>
            Associated Dream (Optional)
          </label>
          {initialBucketListItemId && initialBucketListTitle ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span>{initialBucketListTitle}</span>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Locked</span>
            </div>
          ) : (
            <select
              value={bucketListItemId}
              onChange={(e) => setBucketListItemId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl glass-input text-primary focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 border border-stone-200 dark:border-stone-800"
            >
              <option value="">None (Standalone daily task)</option>
              {activeDreams.map((d) => (
                <option key={d.id} value={d.id}>
                  🌙 {d.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Date <span className="text-rose-500">*</span>
          </label>
          <Input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs"
          />
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
                      ? cn(
                          style.badge,
                          "border-current shadow-2xs font-semibold ring-1 ring-current"
                        )
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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {TODO_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const catStyle = CATEGORY_STYLES[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "py-1.5 px-2 rounded-xl text-xs font-medium border transition-all text-center cursor-pointer",
                    isSelected
                      ? cn(
                          catStyle?.badge || "bg-stone-900 text-white",
                          "border-current shadow-2xs font-semibold ring-1 ring-current"
                        )
                      : "border-stone-200/80 text-stone-600 hover:bg-stone-50"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Notes / Description (Optional)
          </label>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any extra details, links, or notes..."
            className="text-xs leading-relaxed"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddTodoTaskModal;
