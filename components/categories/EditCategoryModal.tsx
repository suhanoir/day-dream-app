"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { cn } from "@/lib/utils/cn";
import { CategoryData } from "./AddCategoryModal";

export interface EditCategoryModalProps {
  category: CategoryData | null;
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdated: (category: CategoryData) => void;
}

import { PRESET_PALETTE } from "@/lib/utils/categoryColors";

export function EditCategoryModal({
  category,
  isOpen,
  onClose,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("emerald");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setColor(category.color || "emerald");
    }
  }, [category]);

  if (!category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to update category.");
        toastError(data.error || "Could not update category.");
        return;
      }

      playSound("success");
      success(`Category "${data.category.name}" updated!`);
      onCategoryUpdated(data.category);
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
      title="Edit Category"
      subtitle="Update name, description, or color theme."
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase block mb-2">
            Color Accent
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_PALETTE.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center shadow-2xs",
                  color.toLowerCase() === c.hex.toLowerCase() || color === c.id
                    ? "ring-2 ring-[var(--theme-primary)] ring-offset-2 scale-110"
                    : "opacity-80 hover:opacity-100 hover:scale-105"
                )}
                title={c.name}
              />
            ))}
          </div>
        </div>

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

