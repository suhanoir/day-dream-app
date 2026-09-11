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
  Clock,
  Flag,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AddTodoTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: TodoTaskData) => void;
  initialDate?: Date;
}

export function AddTodoTaskModal({
  isOpen,
  onClose,
  onTaskAdded,
  initialDate,
}: AddTodoTaskModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("Medium");
  const [category, setCategory] = useState<TodoCategory>("Personal");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDate(formatToDateKey(initialDate || new Date()));
      setDueTime("");
      setPriority("Medium");
      setCategory("Personal");
      setFormError("");
    }
  }, [isOpen, initialDate]);

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
          dueTime: dueTime.trim() || null,
          priority,
          category,
          description: description.trim() || null,
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
      subtitle="Create a task for your daily to-do list"
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

        {/* Date & Due Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div>
            <div className="flex items-center justify-between mb-1.5 min-h-[16px]">
              <label
                htmlFor="todo-due-time-add"
                className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider"
              >
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Due Time (Optional)
              </label>
              {dueTime && (
                <button
                  type="button"
                  onClick={() => setDueTime("")}
                  className="text-[10px] font-semibold text-stone-400 hover:text-rose-500 transition-colors cursor-pointer active:scale-95"
                  title="Clear time"
                  aria-label="Clear due time"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              id="todo-due-time-add"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {}
              }}
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
