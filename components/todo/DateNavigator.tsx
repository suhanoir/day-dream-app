"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import {
  formatToDateKey,
  parseDateKey,
  formatFriendlyDate,
  getRelativeDayLabel,
} from "./types";
import { cn } from "@/lib/utils/cn";

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

export function DateNavigator({
  selectedDate,
  onDateChange,
}: DateNavigatorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const selectedDateKey = formatToDateKey(selectedDate);
  const todayKey = formatToDateKey(new Date());
  const isViewingToday = selectedDateKey === todayKey;
  const relativeLabel = getRelativeDayLabel(selectedDate);

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateChange(parseDateKey(e.target.value));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-3 sm:px-5 sm:py-3.5 rounded-2xl">
      {/* Date Header Display */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
          className="w-9 h-9 rounded-xl glass-card text-stone-700 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
          title="Jump to date"
        >
          <CalendarIcon className="w-4 h-4 text-stone-600" />
        </button>

        {/* Hidden native date input for date picker */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDateKey}
          onChange={handleDatePickerChange}
          className="sr-only"
          tabIndex={-1}
        />

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              {formatFriendlyDate(selectedDate)}
            </h2>
            {relativeLabel && (
              <span
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                  isViewingToday
                    ? "bg-[var(--theme-primary,#4F5FD7)] text-white border-[var(--theme-primary,#4F5FD7)] shadow-2xs"
                    : "glass-card text-stone-600 border-stone-200/80"
                )}
              >
                {relativeLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls: ← Previous Day | Today | Next Day → */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={handlePrevDay}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card text-xs font-medium text-stone-700 hover:text-stone-900 transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Previous Day</span>
        </button>

        <button
          type="button"
          onClick={handleTodayClick}
          disabled={isViewingToday}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
            isViewingToday
              ? "bg-stone-100/60 text-stone-400 border-stone-200/40 cursor-default opacity-60"
              : "glass-card text-stone-900 active:scale-95"
          )}
        >
          <RotateCcw className="w-3 h-3" />
          Today
        </button>

        <button
          type="button"
          onClick={handleNextDay}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card text-xs font-medium text-stone-700 hover:text-stone-900 transition-all cursor-pointer active:scale-95"
        >
          <span className="hidden xs:inline">Next Day</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

