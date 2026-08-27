"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { BucketListItemData } from "./BucketListItemCard";
import { CategoryOption } from "./AddBucketListItemModal";

export interface EditBucketListItemModalProps {
  item: BucketListItemData | null;
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  onItemUpdated: (item: BucketListItemData) => void;
}

export function EditBucketListItemModal({
  item,
  isOpen,
  onClose,
  categories,
  onItemUpdated,
}: EditBucketListItemModalProps) {
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setCategoryId(item.categoryId);
      setDescription(item.description || "");
      setTargetDate(item.targetDate ? item.targetDate.split("T")[0] : "");
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Goal title is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/bucket-list/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          categoryId,
          description: description.trim() || null,
          targetDate: targetDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to update goal.");
        toastError(data.error || "Could not update goal.");
        return;
      }

      success("Goal updated successfully.");
      onItemUpdated(data.item);
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
      title="Edit Goal"
      subtitle="Update the title, category, or notes for this goal."
      maxWidth="md"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200/90 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-400 transition-all cursor-pointer"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="Description / Notes"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
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

