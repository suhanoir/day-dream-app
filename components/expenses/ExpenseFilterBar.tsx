"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";
import { ExpenseCategory, EXPENSE_CATEGORIES, EXPENSE_CATEGORY_CONFIG } from "./types";
import { cn } from "@/lib/utils/cn";

interface ExpenseFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string; // "all" or category
  onCategoryChange: (val: string) => void;
  categoryBreakdown: Record<string, number>;
}

export function ExpenseFilterBar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryBreakdown,
}: ExpenseFilterBarProps) {
  return (
    <div className="space-y-3 pt-2">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search expenses by name or notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-400 transition-all shadow-2xs"
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

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-none">
        <button
          onClick={() => onCategoryChange("all")}
          className={cn(
            "px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 font-medium",
            selectedCategory === "all"
              ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
              : "bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50"
          )}
        >
          All Categories
        </button>

        {EXPENSE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const config = EXPENSE_CATEGORY_CONFIG[cat];
          const hasExpenses = Boolean(categoryBreakdown[cat]);

          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 font-medium flex items-center gap-1.5",
                isSelected
                  ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                  : "bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
              <span>{cat}</span>
              {hasExpenses && (
                <span
                  className={cn(
                    "text-[10px] px-1 rounded-md",
                    isSelected ? "bg-stone-800 text-stone-200" : "bg-stone-100 text-stone-500"
                  )}
                >
                  ₹{Math.round(categoryBreakdown[cat])}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
