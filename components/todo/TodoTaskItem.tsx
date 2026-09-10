"use client";

import React, { useState } from "react";
import {
  TodoTaskData,
  PRIORITY_STYLES,
  CATEGORY_STYLES,
} from "./types";
import { Check, Clock, ArrowRightCircle, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";

interface TodoTaskItemProps {
  task: TodoTaskData;
  isPastDate?: boolean;
  onToggleComplete: (task: TodoTaskData) => Promise<void>;
  onClick: (task: TodoTaskData) => void;
  onMoveToToday?: (task: TodoTaskData) => Promise<void>;
  onDelete?: (task: TodoTaskData) => Promise<void>;
}

export function TodoTaskItem({
  task,
  isPastDate = false,
  onToggleComplete,
  onClick,
  onMoveToToday,
  onDelete,
}: TodoTaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const { playSound } = useSound();

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    try {
      setIsToggling(true);
      if (!task.completed) {
        playSound("success");
      } else {
        playSound("ui-click");
      }
      await onToggleComplete(task);
    } finally {
      setIsToggling(false);
    }
  };

  const handleMoveToToday = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onMoveToToday || isMoving) return;
    try {
      setIsMoving(true);
      playSound("ui-click");
      await onMoveToToday(task);
    } finally {
      setIsMoving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    playSound("delete");
    await onDelete(task);
  };

  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const categoryStyle = task.category ? CATEGORY_STYLES[task.category] : null;

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        "group relative flex items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-98",
        task.completed
          ? "bg-stone-100/40 border-stone-200/40 text-stone-400 hover:bg-stone-100/60"
          : "glass-card-interactive text-stone-900"
      )}
    >
      {/* Checkbox and Task Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Always visible Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          disabled={isToggling}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          className={cn(
            "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer active:scale-95",
            task.completed
              ? "bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-2xs rotate-0 scale-100"
              : "border-stone-300/80 bg-white/80 hover:border-[var(--theme-primary)] hover:bg-white"
          )}
        >
          {task.completed && (
            <Check className="w-3.5 h-3.5 stroke-[2.5] animate-scale-in" />
          )}
        </button>

        {/* Title and metadata */}
        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
          <span
            className={cn(
              "text-sm font-medium transition-all duration-150 break-words",
              task.completed
                ? "line-through text-stone-400 font-normal"
                : "text-stone-900"
            )}
          >
            {task.title}
          </span>

          {/* Sub-tags / Due time / Category in row */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {task.dueTime && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors",
                  task.completed
                    ? "text-stone-400 bg-stone-100/40"
                    : "text-stone-600 glass-card"
                )}
              >
                <Clock className="w-3 h-3 text-stone-400" />
                {task.dueTime}
              </span>
            )}

            {task.category && categoryStyle && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                  task.completed
                    ? "opacity-50 grayscale"
                    : categoryStyle.badge
                )}
              >
                {categoryStyle.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right-side Priority and Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Priority Badge */}
        {task.priority && (
          <span
            className={cn(
              "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors",
              task.completed
                ? "opacity-40 grayscale"
                : priorityStyle.badge
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)}
            />
            {priorityStyle.label}
          </span>
        )}

        {/* Overdue helper: Move to Today button */}
        {!task.completed && isPastDate && onMoveToToday && (
          <button
            type="button"
            onClick={handleMoveToToday}
            disabled={isMoving}
            title="Move to Today"
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <ArrowRightCircle className="w-3 h-3" />
            <span className="hidden md:inline">Move to Today</span>
          </button>
        )}

        {/* Delete button (hover on desktop, always visible on touch) */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete task"
            className="opacity-0 group-hover:opacity-100 sm:transition-opacity p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

