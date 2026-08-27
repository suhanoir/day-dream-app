"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BucketListItemData {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  reflection: string | null;
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
        "group relative flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-150 cursor-pointer border border-transparent select-none text-left",
        item.completed
          ? "bg-stone-100/50 hover:bg-stone-100 text-stone-500 border-stone-200/50"
          : "bg-white hover:bg-stone-50 text-stone-900 border-stone-200/80 shadow-xs hover:border-stone-300"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {/* Item Title - Note: NO Checkbox displayed initially per requirement */}
        <span
          className={cn(
            "text-[15px] font-normal leading-snug transition-colors tracking-normal truncate",
            item.completed
              ? "line-through text-stone-400 font-light"
              : "text-stone-800 group-hover:text-stone-950"
          )}
        >
          {item.title}
        </span>

        {/* Subtle completed check indicator */}
        {item.completed && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 text-xs">
            <Check className="w-3 h-3" />
          </span>
        )}

        {/* Optional Reflection indicator dot if memory is recorded */}
        {item.reflection && (
          <span
            title="Has saved reflection memory"
            className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
          />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showCategoryBadge && item.category && (
          <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
            {item.category.name}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
      </div>
    </div>
  );
}

