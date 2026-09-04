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

export interface EditEventModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: (event: EventData) => void;
}

export function EditEventModal({
  event,
  isOpen,
  onClose,
  onEventUpdated,
}: EditEventModalProps) {
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
    if (event) {
      setTitle(event.title);

      const d = new Date(event.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);

      setStartTime(event.startTime || "");
      setEndTime(event.endTime || "");
      setLocation(event.location || "");

      const isPreset = EVENT_CATEGORIES.includes(event.category as any);
      if (isPreset) {
        setCategory(event.category);
        setIsCustomCategory(false);
      } else {
        setCategory("custom");
        setCustomCategory(event.category);
        setIsCustomCategory(true);
      }

      setDescription(event.description || "");
      setReminder(event.reminder || "none");
      setFormError("");
    }
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Event title cannot be empty.");
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
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to update event.");
        toastError(data.error || "Could not update event.");
        return;
      }

      success("Event updated successfully.");
      onEventUpdated(data.event);
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
      title="Edit Event"
      subtitle="Update event details or timing."
      maxWidth="lg"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

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
            />
          </div>

          <div>
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
              Category
            </label>
            {!isCustomCategory ? (
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

        <Textarea
          label="Description & Notes"
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

