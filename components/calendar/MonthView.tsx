"use client";

import React from "react";
import { EventData, getCategoryStyle, formatEventTime } from "./types";
import { cn } from "@/lib/utils/cn";
import { Plus } from "lucide-react";

export interface MonthViewProps {
  currentDate: Date;
  events: EventData[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: EventData) => void;
  onAddEventClick: (date: Date) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
  onEventClick,
  onAddEventClick,
}: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  // Last day of current month
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week for 1st of month: 0 (Sun) to 6 (Sat). We want Monday as 0:
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  // Total days in month
  const totalDays = lastDayOfMonth.getDate();

  // Days from previous month to fill first week
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    prevDays.push(new Date(year, month - 1, prevMonthLastDay - i));
  }

  // Days of current month
  const currentDays = [];
  for (let d = 1; d <= totalDays; d++) {
    currentDays.push(new Date(year, month, d));
  }

  // Days from next month to complete 35 or 42 grid cells
  const totalCells = prevDays.length + currentDays.length > 35 ? 42 : 35;
  const nextDaysCount = totalCells - (prevDays.length + currentDays.length);
  const nextDays = [];
  for (let d = 1; d <= nextDaysCount; d++) {
    nextDays.push(new Date(year, month + 1, d));
  }

  const allCalendarDays = [...prevDays, ...currentDays, ...nextDays];

  // Helper to check if two dates are same day
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const today = new Date();

  // Map events to date strings (YYYY-MM-DD)
  const getEventsForDay = (date: Date) => {
    return events.filter((e) => {
      const eDate = new Date(e.date);
      return isSameDay(eDate, date);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-stone-100 text-center py-2.5 bg-stone-50/60">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-stone-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100">
        {allCalendarDays.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[85px] sm:min-h-[110px] p-1 sm:p-2 transition-colors cursor-pointer group relative flex flex-col justify-between",
                !isCurrentMonth && "bg-stone-50/40 text-stone-400",
                isCurrentMonth && "hover:bg-stone-50/80",
                isSelected && "bg-[var(--theme-primary-soft,#EEF0FF)]/50 ring-1 ring-inset ring-[var(--theme-primary,#4F5FD7)]/40"
              )}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                    isToday
                      ? "bg-[var(--theme-primary,#4F5FD7)] text-white font-bold shadow-2xs"
                      : isSelected
                      ? "text-[var(--theme-primary,#4F5FD7)] font-bold"
                      : isCurrentMonth
                      ? "text-stone-700"
                      : "text-stone-300"
                  )}
                >
                  {day.getDate()}
                </span>

                {/* Quick Add Button on Hover (Desktop) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEventClick(day);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded"
                  title="Add event on this day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Pills (Desktop) */}
              <div className="hidden sm:flex flex-col gap-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const style = getCategoryStyle(event.category);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[11px] font-medium truncate flex items-center gap-1 border transition-all cursor-pointer hover:shadow-2xs",
                        style.bg,
                        style.text,
                        style.border
                      )}
                      title={`${event.title} (${event.startTime || "All Day"})`}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <span className="text-[10px] font-medium text-stone-400 pl-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>

              {/* Event Indicator Dots (Mobile) */}
              <div className="sm:hidden flex items-center justify-center gap-1 mt-1 flex-wrap">
                {dayEvents.slice(0, 3).map((event) => {
                  const style = getCategoryStyle(event.category);
                  return (
                    <span
                      key={event.id}
                      className={cn("w-1.5 h-1.5 rounded-full", style.dot)}
                    />
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-bold text-stone-400">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

