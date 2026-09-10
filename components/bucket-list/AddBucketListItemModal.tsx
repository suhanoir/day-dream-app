"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { Plus, Sparkles } from "lucide-react";
import { BucketListItemData } from "./BucketListItemCard";

export interface CategoryOption {
  id: string;
  name: string;
  color?: string | null;
}

export interface AddBucketListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  defaultCategoryId?: string;
  onItemAdded: (item: BucketListItemData) => void;
  onOpenAddCategory?: () => void;
}

export function AddBucketListItemModal({
  isOpen,
  onClose,
  categories,
  defaultCategoryId,
  onItemAdded,
  onOpenAddCategory,
}: AddBucketListItemModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || (categories[0]?.id || ""));
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync default category if provided
  React.useEffect(() => {
    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId);
    } else if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [defaultCategoryId, categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter what you want to accomplish.");
      return;
    }

    if (!categoryId) {
      setFormError("Please select a category.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/bucket-list", {
        method: "POST",
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
        setFormError(data.error || "Failed to add goal.");
        toastError(data.error || "Could not add goal.");
        return;
      }

      playSound("success");
      success("New goal added to your bucket list!");
      onItemAdded(data.item);
      // Reset form
      setTitle("");
      setDescription("");
      setTargetDate("");
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
      title="Add Bucket List Goal"
      subtitle="What milestone, experience, or dream do you want to accomplish?"
      maxWidth="md"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="What do you want to accomplish?"
          placeholder="e.g. Travel to Japan, Learn to play cello, Hike Mount Fuji..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
              Category
            </label>
            {onOpenAddCategory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddCategory();
                }}
                className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>
            )}
          </div>
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
          label="Optional Description & Inspiration"
          placeholder="e.g. Experience cherry blossom season in Kyoto, try authentic ramen..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Optional Target Date"
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
            <Sparkles className="w-4 h-4 mr-1.5" />
            Add to Bucket List
          </Button>
        </div>
      </form>
    </Modal>
  );
}

