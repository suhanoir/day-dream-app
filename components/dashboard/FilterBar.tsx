"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { CategoryData } from "@/components/categories/AddCategoryModal";
import { cn } from "@/lib/utils/cn";

export type StatusFilter = "all" | "active" | "completed";

export interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: StatusFilter;
  onStatusChange: (val: StatusFilter) => void;
  selectedCategory: string; // "all" or categoryId
  onCategoryChange: (val: string) => void;
  categories: CategoryData[];
  onOpenAddItem?: () => void;
  onOpenAddCategory?: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: FilterBarProps) {
  return (
    <div className="space-y-3 sm:space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search your bucket list..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 glass-input rounded-2xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls: Status Tabs & Category Select */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Segmented Control */}
          <div className="inline-flex p-1 bg-stone-200/50 dark:bg-stone-800/50 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-stone-700/60 shadow-inner">
            <button
              type="button"
              onClick={() => onStatusChange("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95",
                status === "all"
                  ? "glass-tab-active shadow-2xs font-semibold text-primary"
                  : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("active")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95",
                status === "active"
                  ? "glass-tab-active shadow-2xs font-semibold text-primary"
                  : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("completed")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95",
                status === "completed"
                  ? "glass-tab-active shadow-2xs font-semibold text-primary"
                  : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
              )}
            >
              Completed
            </button>
          </div>

          {/* Category Filter Select */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-1.5 glass-input text-primary rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.totalItems || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

