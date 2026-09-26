"use client";

import React, { useState } from "react";
import {
  TodoTaskData,
  PRIORITY_STYLES,
  CATEGORY_STYLES,
  formatTaskDueDate,
} from "./types";
import { Check, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";

export interface TodoTaskItemProps {
  task: TodoTaskData;
  isPastDate?: boolean;
  onToggleComplete: (task: TodoTaskData) => Promise<void>;
  onClick: (task: TodoTaskData) => void;
  onMoveToToday?: (task: TodoTaskData) => Promise<void>;
  onDelete?: (task: TodoTaskData) => Promise<void>;
}

export function TodoTaskItem({
  task,
  onToggleComplete,
  onClick,
  onDelete,
}: TodoTaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    playSound("delete");
    await onDelete(task);
  };

  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
  const categoryStyle = task.category ? CATEGORY_STYLES[task.category] : null;
  const dueInfo = formatTaskDueDate(task.date, task.completed);
  const hasDescription = Boolean(task.description && task.description.trim().length > 0);

  return (
    <div
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(task);
        }
      }}
      className={cn(
        "group relative flex items-start justify-between gap-3.5 p-3.5 sm:px-4 sm:py-3.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.995]",
        task.completed
          ? "bg-stone-100/40 dark:bg-white/[0.02] border-stone-200/50 dark:border-white/5 text-muted hover:bg-stone-100/60 dark:hover:bg-white/[0.04]"
          : "glass-card-interactive text-primary"
      )}
    >
      {/* Left side: Checkbox + Content */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Fast completion Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          disabled={isToggling}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          className={cn(
            "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer mt-0.5 active:scale-90",
            task.completed
              ? "bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-2xs rotate-0 scale-100"
              : "border-stone-300/80 dark:border-white/20 bg-white/80 dark:bg-stone-900/80 hover:border-[var(--theme-primary)] hover:bg-white dark:hover:bg-stone-800"
          )}
        >
          {task.completed && (
            <Check className="w-3.5 h-3.5 stroke-[2.5] animate-scale-in" />
          )}
        </button>

        {/* Task Information */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title */}
          <h4
            className={cn(
              "text-sm font-semibold transition-all duration-150 break-words leading-snug",
              task.completed
                ? "line-through text-muted font-normal"
                : "text-primary"
            )}
          >
            {task.title}
          </h4>

          {/* Description Preview: Only rendered when user provided a description */}
          {hasDescription && (
            <p
              className={cn(
                "text-xs leading-relaxed break-words line-clamp-2",
                task.completed
                  ? "text-muted/60"
                  : "text-secondary/80 dark:text-secondary/70"
              )}
            >
              {task.description}
            </p>
          )}

          {/* Metadata Row: Category & Linked Dream (and on mobile: Priority & Due Date wrap here) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
            {/* Category Chip */}
            {task.category && categoryStyle && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                  task.completed
                    ? "opacity-50 grayscale border-stone-200/50 dark:border-white/5"
                    : categoryStyle.badge
                )}
              >
                {categoryStyle.label}
              </span>
            )}

            {/* Linked Dream Badge */}
            {task.bucketListItem && (
              <a
                href={`/dreams?id=${task.bucketListItem.id}`}
                onClick={(e) => e.stopPropagation()}
                title={`Linked Dream: ${task.bucketListItem.title}`}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer",
                  task.completed
                    ? "opacity-50 grayscale border-stone-200 dark:border-white/10 bg-stone-100 dark:bg-white/5 text-muted"
                    : "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/25 hover:bg-amber-500/15"
                )}
              >
                <span>🌙</span>
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {task.bucketListItem.title}
                </span>
              </a>
            )}

            {/* Mobile Only: Priority Badge (visible on small screens) */}
            <span
              className={cn(
                "sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                task.completed ? "opacity-40 grayscale" : priorityStyle.badge
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
              {priorityStyle.label}
            </span>

            {/* Mobile Only: Due Date (aligned right in the metadata row) */}
            {dueInfo && (
              <span
                className={cn(
                  "sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ml-auto",
                  task.completed
                    ? "text-muted/70 border-stone-200/40 dark:border-white/5 bg-transparent"
                    : dueInfo.isOverdue
                    ? "text-amber-900 dark:text-amber-300 bg-amber-500/10 border-amber-500/25 font-semibold"
                    : "text-secondary border-stone-200/70 dark:border-white/10 bg-stone-100/70 dark:bg-white/5"
                )}
              >
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{dueInfo.label}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Desktop Priority & Due Date + Quick Actions */}
      <div className="hidden sm:flex items-center gap-3 shrink-0 ml-3 self-center">
        {/* Priority Badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors",
            task.completed ? "opacity-40 grayscale" : priorityStyle.badge
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
          {priorityStyle.label}
        </span>

        {/* Due Date: Clearly on the right on desktop */}
        {dueInfo && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors",
              task.completed
                ? "text-muted border-stone-200/40 dark:border-white/5 bg-transparent"
                : dueInfo.isOverdue
                ? "text-amber-900 dark:text-amber-300 bg-amber-500/10 border-amber-500/25 font-semibold"
                : "text-secondary border-stone-200/70 dark:border-white/10 bg-stone-100/70 dark:bg-white/5"
            )}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{dueInfo.label}</span>
          </span>
        )}

        {/* Quick Delete icon (desktop hover) */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete task"
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TodoTaskItem;
