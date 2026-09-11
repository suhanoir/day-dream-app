"use client";

import React from "react";
import { Check, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BucketListItemData {
  id: string;
  categoryId: string;
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
  category?: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  };
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
        "group relative flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-150 cursor-pointer select-none text-left active:scale-98",
        item.completed
          ? "bg-stone-100/40 dark:bg-white/5 hover:bg-stone-100/70 dark:hover:bg-white/10 text-muted border border-stone-200/40 dark:border-white/10"
          : "glass-card-interactive text-primary hover:border-stone-300 dark:hover:border-white/20"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {/* Item Title - Note: NO Checkbox displayed initially per requirement */}
        <span
          className={cn(
            "text-[15px] leading-snug transition-colors tracking-normal truncate",
            item.completed
              ? "line-through text-muted font-light"
              : "text-primary group-hover:text-accent font-medium"
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

        {/* Optional Reflection indicator dot if memory is recorded */}
        {item.reflection && (
          <span
            title="Has saved reflection memory"
            className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-2xs"
          />
        )}

        {/* Optional Cover Photo indicator */}
        {item.memoryPhoto && (
          <span
            title="Has postcard memory photo"
            className="text-muted shrink-0"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showCategoryBadge && item.category && (
          <span className="text-[11px] font-medium text-secondary glass-card px-2 py-0.5 rounded-md hidden sm:inline-block">
            {item.category.name}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-0.5 shrink-0" />
      </div>
    </div>
  );
}

