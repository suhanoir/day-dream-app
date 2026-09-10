"use client";

import React from "react";
import { EventData, getCategoryStyle, formatEventTime } from "./types";
import { cn } from "@/lib/utils/cn";
import { Calendar as CalendarIcon, Clock, MapPin, Bookmark } from "lucide-react";

export interface AgendaViewProps {
  events: EventData[];
  onEventClick: (event: EventData) => void;
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Group events by date string (YYYY-MM-DD)
  const groupedEvents: { [key: string]: { date: Date; items: EventData[] } } = {};

  events.forEach((event) => {
    const d = new Date(event.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!groupedEvents[key]) {
      groupedEvents[key] = { date: d, items: [] };
    }
    groupedEvents[key].items.push(event);
  });

  const sortedDateKeys = Object.keys(groupedEvents).sort();

  if (sortedDateKeys.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center shadow-xs">
        <CalendarIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-stone-800">No events found</h4>
        <p className="text-xs text-stone-500 mt-1">
          Try changing your search or filters, or add a new event to your schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDateKeys.map((key) => {
        const { date, items } = groupedEvents[key];
        let dateHeading = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        let dayBadge = "";
        if (isSameDay(date, today)) {
          dayBadge = "Today";
        } else if (isSameDay(date, tomorrow)) {
          dayBadge = "Tomorrow";
        }

        return (
          <div key={key} className="space-y-3">
            {/* Date Group Header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {dateHeading}
              </span>
              {dayBadge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--theme-primary,#4F5FD7)] text-white shadow-2xs">
                  {dayBadge}
                </span>
              )}
            </div>

            {/* List of Events on this date */}
            <div className="space-y-2">
              {items.map((event) => {
                const style = getCategoryStyle(event.category);
                const timeStr = formatEventTime(event.startTime, event.endTime);

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="p-4 glass-card-interactive rounded-2xl hover:border-stone-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                          style.dot
                        )}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-semibold text-stone-900 truncate">
                            {event.title}
                          </h4>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                              style.badge
                            )}
                          >
                            {event.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {timeStr}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              <span className="truncate">{event.location}</span>
                            </span>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-xs text-stone-500 mt-1.5 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {event.bucketListItem && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg shrink-0 border border-amber-200/60">
                        <Bookmark className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">
                          {event.bucketListItem.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

