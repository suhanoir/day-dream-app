"use client";

import React from "react";
import { Sparkles, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";

export interface DashboardEmptyStateProps {
  isSearchOrFilter?: boolean;
  onOpenAddItem: () => void;
  onClearFilter?: () => void;
}

export function DashboardEmptyState({
  isSearchOrFilter = false,
  onOpenAddItem,
  onClearFilter,
}: DashboardEmptyStateProps) {
  if (isSearchOrFilter) {
    return (
      <div className="text-center py-16 px-6 bg-white/70 border border-stone-200/80 rounded-3xl my-8">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-stone-900 mb-1">
          No matching goals found
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5 leading-relaxed">
          We couldn&apos;t find any goals matching your search keywords or filter criteria.
        </p>
        {onClearFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilter}
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-6 bg-white border border-stone-200/80 rounded-3xl my-8 shadow-xs">
      <div className="mb-5">
        <DayDreamLogo size={56} className="w-14 h-14 mx-auto shadow-sm" />
      </div>
      <h3 className="text-xl font-bold text-stone-900 mb-2 tracking-tight">
        Your bucket list is empty.
      </h3>
      <p className="text-sm text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
        Start adding the things you want to experience, accomplish, and remember throughout your life.
      </p>
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={onOpenAddItem}
        className="font-semibold shadow-sm"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Create Your First Goal
      </Button>
    </div>
  );
}

