"use client";

import React from "react";
import { Check, ChevronRight, Image as ImageIcon, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BucketListItemData {
  id: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  reflection: string | null;
  memoryPhoto?: string | null;
  memoryPhotos?: string | null;
  postcardStyle?: string | null;
  targetDate: string | null;
  createdAt: string;
  todos?: Array<{
    id: string;
    title: string;
    completed: boolean;
    date?: string;
    priority?: string;
  }>;
  events?: Array<{
    id: string;
    title: string;
    date: string;
    startTime?: string | null;
    location?: string | null;
  }>;
}

export type DreamStatus = "Dreaming" | "Planning" | "In Progress" | "Completed";

export function getDreamStatus(item: BucketListItemData): DreamStatus {
  if (item.completed) return "Completed";
  if (item.todos && item.todos.some((t) => t.completed)) return "In Progress";
  if (item.todos && item.todos.length > 0) return "Planning";
  if (item.targetDate || (item.events && item.events.length > 0)) return "Planning";
  return "Dreaming";
}

export interface BucketListItemCardProps {
  item: BucketListItemData;
  onClick: (item: BucketListItemData) => void;
  showCategoryBadge?: boolean;
}

export function BucketListItemCard({
  item,
  onClick,
  showCategoryBadge = false,
}: BucketListItemCardProps) {
  const status = getDreamStatus(item);

  // Status visual style
  const statusStyles: Record<DreamStatus, string> = {
    Dreaming: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    Planning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    "In Progress": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  };

  const formattedTargetDate = item.targetDate
    ? new Date(item.targetDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  // Real action calculation (no artificial percentages)
  const totalActions = item.todos?.length || 0;
  const completedActions = item.todos?.filter((t) => t.completed).length || 0;
  const nextAction = item.todos?.find((t) => !t.completed)?.title;

  return (
    <div
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between py-3.5 px-4 rounded-2xl transition-all duration-150 cursor-pointer select-none text-left active:scale-[0.99] gap-2",
        item.completed
          ? "bg-stone-100/40 dark:bg-white/5 hover:bg-stone-100/70 dark:hover:bg-white/10 text-muted border border-stone-200/40 dark:border-white/10"
          : "glass-card-interactive text-primary hover:border-stone-300 dark:hover:border-white/20"
      )}
    >
      {/* Primary Row: Title, Indicators, Badges */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Item Title */}
          <span
            className={cn(
              "text-[15px] leading-snug transition-colors tracking-normal truncate font-medium",
              item.completed
                ? "line-through text-muted font-light"
                : "text-primary group-hover:text-accent"
            )}
          >
            {item.title}
          </span>

          {/* Subtle completed check indicator */}
          {item.completed && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0 text-xs shadow-2xs">
              <Check className="w-3 h-3" />
            </span>
          )}

          {/* Reflection indicator dot if memory is recorded */}
          {item.reflection && (
            <span
              title="Has saved reflection memory"
              className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-2xs"
            />
          )}

          {/* Cover Photo indicator */}
          {(item.memoryPhoto || (item.memoryPhotos && item.memoryPhotos !== "[]")) && (
            <span
              title="Has postcard memory photo"
              className="text-muted shrink-0"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Target Date Pill */}
          {formattedTargetDate && !item.completed && (
            <span className="text-[10.5px] font-medium text-muted hidden md:inline-block">
              {formattedTargetDate}
            </span>
          )}

          {/* Conceptual Journey Status */}
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide transition-colors",
              statusStyles[status]
            )}
          >
            {status}
          </span>

          {showCategoryBadge && item.category && (
            <span className="text-[11px] font-medium text-secondary glass-card px-2 py-0.5 rounded-md hidden sm:inline-block">
              {item.category.name}
            </span>
          )}

          <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-0.5 shrink-0" />
        </div>
      </div>

      {/* Secondary Progressive Disclosure Row: Next Action & Action Progress */}
      {(!item.completed || totalActions > 0) && (
        <div className="flex items-center justify-between gap-3 text-xs text-secondary pt-0.5 border-t border-stone-200/30 dark:border-white/5">
          {/* Next Action Snippet */}
          <div className="flex items-center gap-1.5 min-w-0 truncate text-[11.5px]">
            {nextAction ? (
              <>
                <span className="text-muted font-medium shrink-0">Next:</span>
                <span className="truncate text-primary font-normal">{nextAction}</span>
              </>
            ) : !item.completed ? (
              <span className="text-muted italic flex items-center gap-1 text-[11px]">
                <Plus className="w-3 h-3" />
                Add your first action
              </span>
            ) : null}
          </div>

          {/* Real Action Completion (No artificial percentages) */}
          {totalActions > 0 && (
            <span className="text-[10.5px] text-muted shrink-0 font-medium">
              {completedActions} of {totalActions} complete
            </span>
          )}
        </div>
      )}
    </div>
  );
}
