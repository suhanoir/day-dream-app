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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl glass-card text-primary flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-muted" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
            {formatMonthYear(currentDate)}
          </h2>
          <p className="text-xs text-muted">
            Monthly Expense Overview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card text-xs font-medium text-secondary hover:text-primary hover:bg-stone-100/60 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
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
            "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95",
            isCurrentMonth
              ? "glass-card text-muted opacity-50 cursor-default"
              : "glass-card text-primary hover:bg-stone-100/60 dark:hover:bg-white/10 shadow-2xs"
          )}
        >
          <RotateCcw className="w-3 h-3" />
          Current Month
        </button>

        <button
          type="button"
          onClick={handleNextMonth}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card text-xs font-medium text-secondary hover:text-primary hover:bg-stone-100/60 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          title="Next Month"
        >
          <span className="hidden xs:inline">Next Month</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
