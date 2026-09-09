"use client";

import React from "react";
import { EventData, getCategoryStyle, formatEventTime } from "./types";
import { cn } from "@/lib/utils/cn";
import { Clock, MapPin, Plus } from "lucide-react";

export interface WeekViewProps {
  currentDate: Date;
  events: EventData[];
  onEventClick: (event: EventData) => void;
  onAddEventClick: (date: Date) => void;
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onAddEventClick,
}: WeekViewProps) {
  // Get start of week (Monday)
  const dayOfWeek = currentDate.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() + distanceToMonday);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }

  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-stone-100 min-h-[450px]">
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));

          const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
          const dayNumber = day.getDate();
          const monthName = day.toLocaleDateString("en-US", { month: "short" });

          return (
            <div key={idx} className="p-3 flex flex-col justify-between bg-white hover:bg-stone-50/50 transition-colors">
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold",
                        isToday
                          ? "bg-[var(--theme-primary,#4F5FD7)] text-white font-bold shadow-2xs"
                          : "bg-stone-100 text-stone-800"
                      )}
                    >
                      {dayNumber}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-stone-900 leading-tight">
                        {dayName}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {monthName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddEventClick(day)}
                    className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                    title="Add event on this date"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day's Event Cards */}
                <div className="space-y-2">
                  {dayEvents.map((event) => {
                    const style = getCategoryStyle(event.category);
                    const timeStr = formatEventTime(event.startTime, event.endTime);

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          "p-2 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-xs",
                          style.bg,
                          style.border
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                          <span className={cn("font-semibold truncate", style.text)}>
                            {event.title}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{timeStr}</span>
                        </div>

                        {event.location && (
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {dayEvents.length === 0 && (
                    <p className="text-[11px] text-stone-400 italic py-4 text-center">
                      No plans
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Quick Add */}
              <button
                type="button"
                onClick={() => onAddEventClick(day)}
                className="mt-3 text-[11px] font-medium text-stone-400 hover:text-stone-800 flex items-center justify-center gap-1 py-1 rounded hover:bg-stone-100/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

