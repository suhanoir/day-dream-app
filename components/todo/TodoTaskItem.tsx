"use client";

import React, { useState } from "react";
import {
  TodoTaskData,
  PRIORITY_STYLES,
  formatTaskDueDate,
} from "./types";
import { Check, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";
import { useCategoryColors } from "@/components/providers/CategoryColorProvider";

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
  const [isHovered, setIsHovered] = useState(false);
  const { playSound } = useSound();
  const { getTaskCardStyle } = useCategoryColors();

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

  // Derive theme-aware, full-card tinted styling with strict precedence:
  // 1. task.color override
  // 2. customized category color
  // 3. default category color
  const cardStyle = getTaskCardStyle(task.category, task.color, task.completed);
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered
          ? cardStyle.cardStyle.hoverBg
          : cardStyle.cardStyle.backgroundColor,
        borderColor: isHovered
          ? cardStyle.cardStyle.hoverBorder
          : cardStyle.cardStyle.borderColor,
        boxShadow: isHovered
          ? cardStyle.cardStyle.hoverShadow
          : cardStyle.cardStyle.boxShadow,
        ...(cardStyle.cssVars as React.CSSProperties),
      }}
      className={cn(
        "group relative flex items-start justify-between gap-3.5 p-3.5 sm:px-4 sm:py-3.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.995]",
        "hover:bg-[var(--task-hover-bg)] hover:border-[var(--task-hover-border)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900",
        "motion-reduce:transition-none motion-reduce:transform-none",
        task.completed
          ? "text-muted"
          : "text-primary"
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
          style={
            task.completed
              ? {
                  backgroundColor: cardStyle.color,
                  borderColor: cardStyle.color,
                }
              : {
                  borderColor: isHovered
                    ? cardStyle.color
                    : (cardStyle.checkboxStyle.borderColor as string),
                  backgroundColor: cardStyle.checkboxStyle.backgroundColor as string,
                }
          }
          className={cn(
            "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-150 cursor-pointer mt-0.5 active:scale-90",
            task.completed
              ? "text-white shadow-2xs rotate-0 scale-100"
              : "hover:border-[var(--task-color)]"
          )}
        >
          {task.completed && (
            <Check className="w-3.5 h-3.5 stroke-[2.5] text-white animate-scale-in" />
          )}
        </button>

        {/* Task Information */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title */}
          <h4
            className={cn(
              "text-sm font-semibold transition-all duration-150 break-words leading-snug",
              task.completed
                ? "line-through text-muted/70 font-normal"
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
                  ? "text-muted/50"
                  : "text-secondary/85"
              )}
            >
              {task.description}
            </p>
          )}

          {/* Metadata Row: Category & Linked Dream (and on mobile: Priority & Due Date wrap here) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
            {/* Category Chip: Coordinated with the card's color family */}
            {task.category && (
              <span
                style={!task.completed ? cardStyle.categoryChipStyle : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors",
                  task.completed
                    ? "opacity-60 grayscale border-stone-200/50 dark:border-white/5 bg-stone-100/50 dark:bg-white/5 text-muted"
                    : "shadow-2xs"
                )}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={!task.completed ? cardStyle.categoryDotStyle : undefined}
                />
                <span style={!task.completed ? cardStyle.categoryChipTextStyle : undefined}>
                  {task.category}
                </span>
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
                "sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-white/80 dark:bg-black/35 backdrop-blur-2xs",
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
                    ? "text-rose-800 dark:text-rose-300 bg-rose-500/15 border-rose-500/30 font-semibold"
                    : "text-secondary border-stone-200/70 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur-2xs"
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
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors bg-white/80 dark:bg-black/35 backdrop-blur-2xs",
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
                ? "text-muted/70 border-stone-200/40 dark:border-white/5 bg-transparent"
                : dueInfo.isOverdue
                ? "text-rose-800 dark:text-rose-300 bg-rose-500/15 border-rose-500/30 font-semibold"
                : "text-secondary border-stone-200/70 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur-2xs"
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
