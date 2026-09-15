"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { AgendaView } from "@/components/calendar/AgendaView";
import { TodayEventsWidget } from "@/components/calendar/TodayEventsWidget";
import { UpcomingEventsList } from "@/components/calendar/UpcomingEventsList";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { EditEventModal } from "@/components/calendar/EditEventModal";
import { EventDetailModal } from "@/components/calendar/EventDetailModal";
import {
  EventData,
  EVENT_CATEGORIES,
  getCategoryStyle,
  formatEventTime,
} from "@/components/calendar/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Columns,
  Loader2,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CalendarViewMode = "month" | "week" | "agenda";
export type EventTimelineFilter = "all" | "today" | "upcoming" | "past";

export default function CalendarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timelineFilter, setTimelineFilter] = useState<EventTimelineFilter>("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<Date | undefined>(undefined);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventData | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventData | null>(null);

  // Fetch events from backend
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (timelineFilter !== "all") params.append("filter", timelineFilter);

      // If viewing month, pass month filter (e.g. 2026-09)
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      if (timelineFilter === "all" && viewMode === "month") {
        params.append("month", `${year}-${month}`);
      }

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        toastError("Failed to fetch calendar events.");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      toastError("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, search, categoryFilter, timelineFilter, viewMode, toastError]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "week") {
        next.setDate(prev.getDate() - 7);
      } else {
        next.setMonth(prev.getMonth() - 1);
      }
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "week") {
        next.setDate(prev.getDate() + 7);
      } else {
        next.setMonth(prev.getMonth() + 1);
      }
      return next;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Add event trigger
  const handleOpenAdd = (date?: Date) => {
    setAddModalInitialDate(date || selectedDate || new Date());
    setIsAddModalOpen(true);
  };

  const handleEventAdded = (newEvent: EventData) => {
    setEvents((prev) => [...prev, newEvent]);
    // Refresh to keep all views synchronized
    fetchEvents();
  };

  const handleEventUpdated = (updatedEvent: EventData) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    if (selectedEventForDetail?.id === updatedEvent.id) {
      setSelectedEventForDetail(updatedEvent);
    }
    fetchEvents();
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail(null);
    }
  };

  // Filter events for currently selected day
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const selectedDayEvents = useMemo(() => {
    return events.filter((e) => isSameDay(new Date(e.date), selectedDate));
  }, [events, selectedDate]);

  const monthHeading = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (authLoading) {
    return (
      <AppShell title="Calendar">
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-muted animate-spin mb-3" />
          <p className="text-xs text-muted font-medium">Loading your calendar...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Calendar">
      <div className="space-y-6">
        {/* Page Top Title & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary font-serif-heading leading-tight">
                Upcoming Events & Plans
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-secondary border border-stone-200/60 dark:border-white/10">
                Calendar & Schedule
              </span>
            </div>
            <p className="text-xs sm:text-sm text-secondary">
              Stay organized, remember what matters, and look forward to what&apos;s coming.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleOpenAdd()}
            className="font-semibold shadow-sm self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Event
          </Button>
        </div>

        {/* Toolbar: Navigation, View Toggle, and Filters */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* Top Toolbar Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-3 sm:px-5 sm:py-3.5 rounded-2xl">
            {/* Month / Week Navigation Controls */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl glass-card text-secondary flex items-center justify-center shrink-0">
                <CalendarIcon className="w-4 h-4 text-muted" />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight min-w-[140px]">
                {monthHeading}
              </h2>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg glass-card text-secondary hover:text-primary transition-all cursor-pointer active:scale-95"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg glass-card text-secondary hover:text-primary transition-all cursor-pointer active:scale-95"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold text-secondary glass-card hover:text-primary rounded-lg transition-all cursor-pointer active:scale-95"
              >
                Today
              </button>
            </div>

            {/* View Switcher: Month / Week / Agenda */}
            <div className="inline-flex p-1 bg-stone-200/50 dark:bg-white/10 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-white/10 shadow-inner self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95",
                  viewMode === "month"
                    ? "glass-tab-active shadow-2xs font-semibold"
                    : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95",
                  viewMode === "week"
                    ? "glass-tab-active shadow-2xs font-semibold"
                    : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
                )}
              >
                <Columns className="w-3.5 h-3.5" />
                Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode("agenda")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95",
                  viewMode === "agenda"
                    ? "glass-tab-active shadow-2xs font-semibold"
                    : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
                )}
              >
                <List className="w-3.5 h-3.5" />
                Agenda
              </button>
            </div>
          </div>

          {/* Filter Bar: Search, Category & Timeline Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events, locations, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 glass-input text-primary rounded-2xl text-base sm:text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 transition-all shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown & Timeline Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 glass-input text-primary rounded-xl text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 cursor-pointer shadow-2xs"
              >
                <option value="all" className="bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">All Categories</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                    {cat}
                  </option>
                ))}
              </select>

              {/* Timeline Status tabs */}
              <div className="inline-flex p-1 bg-stone-200/50 dark:bg-white/10 backdrop-blur-xs rounded-xl border border-stone-200/60 dark:border-white/10 shadow-inner">
                {(["all", "today", "upcoming", "past"] as EventTimelineFilter[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTimelineFilter(tab)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer",
                      timelineFilter === tab
                        ? "glass-tab-active shadow-2xs font-semibold"
                        : "text-secondary hover:text-primary hover:bg-stone-100/50 dark:hover:bg-white/10"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar View Area (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs">Updating events...</span>
              </div>
            ) : viewMode === "month" ? (
              <MonthView
                currentDate={currentDate}
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onEventClick={(ev) => setSelectedEventForDetail(ev)}
                onAddEventClick={(date) => handleOpenAdd(date)}
              />
            ) : viewMode === "week" ? (
              <WeekView
                currentDate={currentDate}
                events={events}
                onEventClick={(ev) => setSelectedEventForDetail(ev)}
                onAddEventClick={(date) => handleOpenAdd(date)}
              />
            ) : (
              <AgendaView
                events={events}
                onEventClick={(ev) => setSelectedEventForDetail(ev)}
              />
            )}

            {/* Selected Day's Schedule (Shown in Month view) */}
            {viewMode === "month" && (
              <div className="glass-card rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/40 dark:border-white/10 mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Events on {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAdd(selectedDate)}
                    className="text-xs h-7 px-2.5"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Plan
                  </Button>
                </div>

                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedDayEvents.map((event) => {
                      const style = getCategoryStyle(event.category);
                      const timeStr = formatEventTime(event.startTime, event.endTime);

                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEventForDetail(event)}
                          className="p-3.5 rounded-xl glass-card hover:border-stone-300 dark:hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", style.dot)} />
                            <div className="min-w-0">
                              <h4 className="font-semibold text-primary truncate">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-2.5 text-[11px] text-secondary mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted" />
                                  {timeStr}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1 truncate max-w-xs">
                                    <MapPin className="w-3 h-3 text-muted" />
                                    <span className="truncate">{event.location}</span>
                                  </span>
                                )}
                              </div>
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
                  <p className="text-xs text-muted italic py-4 text-center">
                    No events scheduled for this day. Click &quot;Add Plan&quot; to create one.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Today's Schedule + Upcoming Events */}
          <div className="space-y-6">
            <TodayEventsWidget
              events={events}
              onEventClick={(ev) => setSelectedEventForDetail(ev)}
              onAddEventClick={() => handleOpenAdd(new Date())}
            />

            <UpcomingEventsList
              events={events}
              onEventClick={(ev) => setSelectedEventForDetail(ev)}
              maxItems={6}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* 1. Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEventAdded={handleEventAdded}
        initialDate={addModalInitialDate}
      />

      {/* 2. Event Detail Modal */}
      <EventDetailModal
        event={selectedEventForDetail}
        isOpen={Boolean(selectedEventForDetail)}
        onClose={() => setSelectedEventForDetail(null)}
        onEditClick={(ev) => setSelectedEventForEdit(ev)}
        onEventDeleted={handleEventDeleted}
      />

      {/* 3. Edit Event Modal */}
      <EditEventModal
        event={selectedEventForEdit}
        isOpen={Boolean(selectedEventForEdit)}
        onClose={() => setSelectedEventForEdit(null)}
        onEventUpdated={handleEventUpdated}
      />
    </AppShell>
  );
}

