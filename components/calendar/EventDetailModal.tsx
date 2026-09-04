"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import {
  EventData,
  getCategoryStyle,
  formatEventTime,
  REMINDER_OPTIONS,
} from "./types";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Tag,
  Bell,
  Pencil,
  Trash2,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EventDetailModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClick: (event: EventData) => void;
  onEventDeleted: (eventId: string) => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEditClick,
  onEventDeleted,
}: EventDetailModalProps) {
  const { success, error: toastError } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  const categoryStyle = getCategoryStyle(event.category);
  const timeDisplay = formatEventTime(event.startTime, event.endTime);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const reminderLabel =
    REMINDER_OPTIONS.find((r) => r.value === event.reminder)?.label || "No reminder";

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to delete event.");
        return;
      }

      setShowDeleteConfirm(false);
      onEventDeleted(event.id);
      onClose();
      success("Event removed from your calendar.");
    } catch {
      toastError("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={true}>
        <div className="space-y-5">
          {/* Category Pill & Action Buttons */}
          <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border",
                categoryStyle.badge
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", categoryStyle.dot)} />
              {event.category}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onClose();
                  onEditClick(event);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                title="Edit Event"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stone-900 leading-snug">
              {event.title}
            </h2>
          </div>

          {/* Time, Date, Location Grid */}
          <div className="grid grid-cols-1 gap-2.5 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/70 text-xs text-stone-700">
            {/* Date */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="font-medium text-stone-800">{formattedDate}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{timeDisplay}</span>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* Reminder */}
            {event.reminder && event.reminder !== "none" && (
              <div className="flex items-center gap-2 text-stone-600">
                <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Reminder: {reminderLabel}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Notes & Agenda
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-100">
                {event.description}
              </p>
            </div>
          )}

          {/* Linked Bucket List Goal */}
          {event.bucketListItem && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Bookmark className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  Connected Goal: <strong>{event.bucketListItem.title}</strong>
                </span>
              </div>
              <a
                href="/dashboard"
                className="text-[11px] font-semibold text-amber-800 hover:underline shrink-0 flex items-center gap-1"
              >
                View Goal
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message={`Are you sure you want to remove "${event.title}" from your calendar? This cannot be undone.`}
        confirmText="Delete Event"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
