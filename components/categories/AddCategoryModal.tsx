"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { STANDARD_ACCENT_PALETTE } from "@/lib/utils/categoryColors";

export interface CategoryData {
  id: string;
  name: string;
  description: string | null;
  color?: string | null;
  icon?: string | null;
  totalItems?: number;
  completedItems?: number;
  progress?: number;
}

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: CategoryData) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(STANDARD_ACCENT_PALETTE[0].hex);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter a category name.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create category.");
        toastError(data.error || "Could not create category.");
        return;
      }

      playSound("success");
      success(`Category "${data.category.name}" created!`);
      onCategoryAdded(data.category);
      setName("");
      setDescription("");
      setColor("emerald");
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
      title="Create Custom Category"
      subtitle="Organize your experiences into a new theme or domain."
      maxWidth="md"
    >
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Adventures, Culinary, Music, Photography..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Optional Description"
          placeholder="What kind of dreams fit into this category?"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <ColorPicker
          value={color}
          onChange={(newColor) => setColor(newColor || STANDARD_ACCENT_PALETTE[0].hex)}
          allowAuto={false}
          label="Color Accent"
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
            <Plus className="w-4 h-4 mr-1.5" />
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
}

