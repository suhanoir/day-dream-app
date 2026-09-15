"use client";

import React from "react";
import { EventData, getCategoryStyle, formatEventTime } from "./types";
import { cn } from "@/lib/utils/cn";
import { Calendar, Clock, MapPin, ChevronRight, Bookmark } from "lucide-react";

export interface UpcomingEventsListProps {
  events: EventData[];
  onEventClick: (event: EventData) => void;
  maxItems?: number;
}

export function UpcomingEventsList({
  events,
  onEventClick,
  maxItems = 8,
}: UpcomingEventsListProps) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter events from today onwards, sorted chronologically
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= startOfToday)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxItems);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/40 dark:border-white/10 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
          Upcoming Events
        </h3>
        <span className="text-[11px] font-medium text-muted">
          {upcomingEvents.length} scheduled
        </span>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(event.date);
            const style = getCategoryStyle(event.category);
            const timeStr = formatEventTime(event.startTime, event.endTime);

            let dateLabel = eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            if (isSameDay(eventDate, today)) {
              dateLabel = "Today";
            } else if (isSameDay(eventDate, tomorrow)) {
              dateLabel = "Tomorrow";
            }

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="group p-3 rounded-xl glass-card hover:border-stone-300 dark:hover:border-white/20 transition-all cursor-pointer text-xs"
              >
                {/* Date header & Category */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      dateLabel === "Today"
                        ? "text-rose-600 dark:text-rose-400"
                        : dateLabel === "Tomorrow"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-secondary"
                    )}
                  >
                    {dateLabel}
                  </span>

                  <span
                    className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.5 rounded border",
                      style.badge
                    )}
                  >
                    {event.category}
                  </span>
                </div>

                {/* Event Title */}
                <h4 className="font-semibold text-primary text-sm transition-colors truncate mb-1">
                  {event.title}
                </h4>

                {/* Time & Location */}
                <div className="flex items-center justify-between text-[11px] text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted shrink-0" />
                    <span>{timeStr}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-1 truncate max-w-[110px] text-muted">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                {event.bucketListItem && (
                  <div className="mt-2 pt-1.5 border-t border-stone-200/40 dark:border-white/10 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300">
                    <Bookmark className="w-2.5 h-2.5" />
                    <span className="truncate">Goal: {event.bucketListItem.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted italic py-6 text-center">
          No upcoming events.
        </p>
      )}
    </div>
  );
}

