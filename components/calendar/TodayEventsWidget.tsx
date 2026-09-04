"use client";

import React from "react";
import { EventData, getCategoryStyle, formatEventTime } from "./types";
import { cn } from "@/lib/utils/cn";
import { Calendar, Clock, MapPin, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TodayEventsWidgetProps {
  events: EventData[];
  onEventClick: (event: EventData) => void;
  onAddEventClick: () => void;
}

export function TodayEventsWidget({
  events,
  onEventClick,
  onAddEventClick,
}: TodayEventsWidgetProps) {
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const todayEvents = events.filter((e) => isSameDay(new Date(e.date), today));

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Today&apos;s Schedule
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-stone-400">
          {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {todayEvents.length > 0 ? (
        <div className="space-y-2.5">
          {todayEvents.map((event) => {
            const style = getCategoryStyle(event.category);
            const timeStr = formatEventTime(event.startTime, event.endTime);

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="p-3 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200/60 transition-all cursor-pointer text-xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                    <span className="font-semibold text-stone-900 truncate">
                      {event.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {timeStr}
                    </span>
                    {event.location && (
                      <span className="truncate max-w-[120px]">
                        • {event.location}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0",
                    style.badge
                  )}
                >
                  {event.category}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 px-3 text-center rounded-xl bg-stone-50/60 border border-dashed border-stone-200/80">
          <Sparkles className="w-5 h-5 text-stone-300 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-stone-700">
            Nothing planned today.
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5 mb-3">
            Enjoy the day or add something to your calendar.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddEventClick}
            className="text-xs h-7 px-2.5"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Plan
          </Button>
        </div>
      )}
    </div>
  );
}

