"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";
import { formatMonthYear } from "./types";
import { cn } from "@/lib/utils/cn";

interface MonthNavigatorProps {
  currentDate: Date;
  onMonthChange: (newDate: Date) => void;
}

export function MonthNavigator({
  currentDate,
  onMonthChange,
}: MonthNavigatorProps) {
  const now = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === now.getFullYear() &&
    currentDate.getMonth() === now.getMonth();

  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onMonthChange(next);
  };

  const handleCurrentMonth = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-5 sm:py-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-stone-600" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            {formatMonthYear(currentDate)}
          </h2>
          <p className="text-xs text-stone-500">
            Monthly Expense Overview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200/80 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Prev Month</span>
        </button>

        <button
          type="button"
          onClick={handleCurrentMonth}
          disabled={isCurrentMonth}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
            isCurrentMonth
              ? "bg-stone-100 text-stone-400 border-stone-200/60 cursor-default opacity-70"
              : "bg-white text-stone-900 border-stone-200/90 hover:bg-stone-100 shadow-2xs"
          )}
        >
          <RotateCcw className="w-3 h-3" />
          Current Month
        </button>

        <button
          type="button"
          onClick={handleNextMonth}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200/80 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
          title="Next Month"
        >
          <span className="hidden xs:inline">Next Month</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
