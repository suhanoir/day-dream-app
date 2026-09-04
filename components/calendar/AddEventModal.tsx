"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  EventData,
  EVENT_CATEGORIES,
  REMINDER_OPTIONS,
} from "./types";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Bell,
  Sparkles,
  Bookmark,
} from "lucide-react";

export interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (event: EventData) => void;
  initialDate?: Date;
  initialBucketListItem?: {
    id: string;
    title: string;
  } | null;
}

export function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  initialDate,
  initialBucketListItem,
}: AddEventModalProps) {
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Personal");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState("");
  const [reminder, setReminder] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialBucketListItem) {
        setTitle(initialBucketListItem.title);
      } else {
        setTitle("");
      }

      if (initialDate) {
        const year = initialDate.getFullYear();
        const month = String(initialDate.getMonth() + 1).padStart(2, "0");
        const day = String(initialDate.getDate()).padStart(2, "0");
        setDate(`${year}-${month}-${day}`);
      } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        setDate(`${year}-${month}-${day}`);
      }

      setStartTime("");
      setEndTime("");
      setLocation("");
      setCategory("Personal");
      setCustomCategory("");
      setIsCustomCategory(false);
      setDescription("");
      setReminder("none");
      setFormError("");
    }
  }, [isOpen, initialDate, initialBucketListItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter an event title.");
      return;
    }

    if (!date) {
      setFormError("Please choose a date.");
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategory.trim() || "Personal"
      : category;

    setIsLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          startTime: startTime.trim() || null,
          endTime: endTime.trim() || null,
          location: location.trim() || null,
          category: finalCategory,
          description: description.trim() || null,
          reminder,
          bucketListItemId: initialBucketListItem?.id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to add event.");
        toastError(data.error || "Could not add event.");
        return;
      }

      success("Event added to your calendar!");
      onEventAdded(data.event);
      onClose();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Event"
      subtitle="Schedule an upcoming plan, milestone, or reminder."
      maxWidth="lg"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      {initialBucketListItem && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
          <Bookmark className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Scheduling milestone from bucket list: <strong>{initialBucketListItem.title}</strong>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Event Title"
          placeholder="e.g. MLH Hackathon, Flight to Tokyo, Team Presentation..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        {/* Date and Times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 10:00 AM"
            />
          </div>

          <div>
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 6:00 PM"
            />
          </div>
        </div>

        {/* Location & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location"
            placeholder="e.g. Bengaluru, Online / Zoom, Central Park..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
              Category
            </label>
            {!isCustomCategory ? (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setIsCustomCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200/90 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/50 cursor-pointer"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">+ Custom Category</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200/90 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 px-2 underline"
                >
                  Presets
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reminder */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
            Reminder
          </label>
          <select
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200/90 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/50 cursor-pointer"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <Textarea
          label="Optional Description & Notes"
          placeholder="Add agenda, flight numbers, notes, or details..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Add Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
