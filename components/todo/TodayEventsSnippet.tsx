"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, ArrowUpRight } from "lucide-react";
import { EventData, formatEventTime } from "@/components/calendar/types";
import { formatToDateKey } from "./types";
import { cn } from "@/lib/utils/cn";

interface TodayEventsSnippetProps {
  selectedDate: Date;
}

export function TodayEventsSnippet({ selectedDate }: TodayEventsSnippetProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedDateKey = formatToDateKey(selectedDate);
  const isToday = formatToDateKey(new Date()) === selectedDateKey;

  useEffect(() => {
    let isCancelled = false;

    async function loadEvents() {
      try {
        setIsLoading(true);
        // Query events for this month, then filter to this specific day
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const res = await fetch(`/api/events?month=${year}-${month}`);
        if (!res.ok) return;

        const data = await res.json();
        if (!isCancelled && Array.isArray(data.events)) {
          const dayEvents = data.events.filter((ev: EventData) => {
            const evDateKey = ev.date.split("T")[0];
            return evDateKey === selectedDateKey;
          });
          setEvents(dayEvents);
        }
      } catch (e) {
        console.error("Failed to load events snippet:", e);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [selectedDateKey]);

  if (isLoading || events.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
          <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
          <span>{isToday ? "Today's Scheduled Events" : "Scheduled Events"}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-stone-200/70 text-stone-600 font-semibold">
            {events.length}
          </span>
        </div>

        <Link
          href="/calendar"
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-0.5 transition-colors"
        >
          Open Calendar
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Events list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
        {events.map((event) => {
          const formattedTime = formatEventTime(event.startTime, event.endTime);
          return (
            <div
              key={event.id}
              className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900 truncate">
                  {event.title}
                </p>
                {formattedTime && (
                  <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate">{formattedTime}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

