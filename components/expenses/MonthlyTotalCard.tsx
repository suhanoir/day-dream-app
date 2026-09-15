"use client";

import React from "react";
import { IndianRupee, Tag, TrendingUp, Receipt } from "lucide-react";
import { formatCurrency, formatMonthYear, EXPENSE_CATEGORY_CONFIG } from "./types";
import { cn } from "@/lib/utils/cn";

interface MonthlyTotalCardProps {
  currentDate: Date;
  monthlyTotal: number;
  count: number;
  topCategory: { category: string; amount: number } | null;
  dailyAverage: number;
  isLoading?: boolean;
}

export function MonthlyTotalCard({
  currentDate,
  monthlyTotal,
  count,
  topCategory,
  dailyAverage,
  isLoading = false,
}: MonthlyTotalCardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "glass-card border border-stone-200/60 dark:border-white/10 rounded-2xl p-4 sm:p-5 animate-pulse-subtle h-24",
              i === 1 ? "col-span-2 sm:col-span-1" : "col-span-1"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Primary Monthly Total Card */}
      <div className="col-span-2 sm:col-span-1 glass-card rounded-2xl p-4 sm:p-5 hover:border-stone-300 dark:hover:border-white/20 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Total Spent ({formatMonthYear(currentDate)})
          </span>
          <div className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-primary">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          {formatCurrency(monthlyTotal)}
        </div>
        <div className="text-xs text-muted mt-1 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-muted" />
          <span>{count} {count === 1 ? "expense" : "expenses"} recorded</span>
        </div>
      </div>

      {/* Top Category Card */}
      <div className="col-span-1 glass-card rounded-2xl p-4 sm:p-5 hover:border-stone-300 dark:hover:border-white/20 transition-all">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary truncate">
            Top Category
          </span>
          <div className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-primary shrink-0">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        {topCategory ? (
          <>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-primary truncate flex items-center gap-2">
              <span>{topCategory.category}</span>
            </div>
            <div className="text-xs text-muted mt-1 truncate">
              {formatCurrency(topCategory.amount)} spent
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-muted">
              —
            </div>
            <div className="text-xs text-muted mt-1 truncate">
              No category data
            </div>
          </>
        )}
      </div>

      {/* Daily Average Card */}
      <div className="col-span-1 glass-card rounded-2xl p-4 sm:p-5 hover:border-stone-300 dark:hover:border-white/20 transition-all">
        <div className="flex items-center justify-between text-muted mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary truncate">
            Daily Average
          </span>
          <div className="w-7 h-7 rounded-lg glass-card flex items-center justify-center text-primary shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-primary">
          {formatCurrency(dailyAverage)}
        </div>
        <div className="text-xs text-muted mt-1 truncate">
          Daily avg this month
        </div>
      </div>
    </div>
  );
}
