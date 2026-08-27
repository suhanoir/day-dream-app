"use client";

import React from "react";
import { Search, Plus, X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  onOpenAddItem: () => void;
  onOpenAddCategory: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onOpenAddItem,
  onOpenAddCategory,
}: FilterBarProps) {
  return (
    <div className="space-y-3 sm:space-y-4 mb-8">
      {/* Top row: Search and Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search your bucket list..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-400 transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenAddCategory}
            className="text-stone-700"
          >
            <FolderPlus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">New Category</span>
            <span className="sm:hidden">Category</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onOpenAddItem}
            className="font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Bottom row: Filter Tabs and Category Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Status Segmented Control */}
        <div className="inline-flex p-1 bg-stone-200/60 rounded-xl">
          <button
            type="button"
            onClick={() => onStatusChange("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              status === "all"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("active")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              status === "active"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("completed")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              status === "completed"
                ? "bg-white text-stone-900 shadow-2xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            Completed
          </button>
        </div>

        {/* Category Filter Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-medium hidden sm:inline">
            Filter by:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 bg-white text-stone-800 border border-stone-200/90 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-stone-400/50 cursor-pointer shadow-2xs"
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
  );
}

