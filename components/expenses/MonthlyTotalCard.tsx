"use client";

import React from "react";
import { DollarSign, Tag, TrendingUp, Receipt } from "lucide-react";
import { formatCurrency, formatMonthYear, EXPENSE_CATEGORY_CONFIG } from "./types";

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-stone-200/60 rounded-2xl p-4 sm:p-5 animate-pulse-subtle h-24"
          />
        ))}
      </div>
    );
  }

  const topCategoryConfig = topCategory
    ? EXPENSE_CATEGORY_CONFIG[topCategory.category] || EXPENSE_CATEGORY_CONFIG.Other
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Primary Monthly Total Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors relative overflow-hidden group">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Total Spent ({formatMonthYear(currentDate)})
          </span>
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {formatCurrency(monthlyTotal)}
        </div>
        <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-stone-400" />
          <span>{count} {count === 1 ? "expense" : "expenses"} recorded</span>
        </div>
      </div>

      {/* Top Category Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Top Category
          </span>
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        {topCategory ? (
          <>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 truncate flex items-center gap-2">
              <span>{topCategory.category}</span>
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {formatCurrency(topCategory.amount)} spent in this category
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-300">
              —
            </div>
            <div className="text-xs text-stone-400 mt-1">
              No category data yet
            </div>
          </>
        )}
      </div>

      {/* Daily Average Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Daily Average
          </span>
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {formatCurrency(dailyAverage)}
        </div>
        <div className="text-xs text-stone-500 mt-1">
          Avg. daily spend this month
        </div>
      </div>
    </div>
  );
}
