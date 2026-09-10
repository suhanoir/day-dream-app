"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

const COLOR_OPTIONS = [
  { id: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { id: "sky", label: "Sky Blue", class: "bg-sky-500" },
  { id: "amber", label: "Amber", class: "bg-amber-500" },
  { id: "rose", label: "Rose", class: "bg-rose-500" },
  { id: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { id: "violet", label: "Violet", class: "bg-violet-500" },
  { id: "teal", label: "Teal", class: "bg-teal-500" },
  { id: "yellow", label: "Gold", class: "bg-yellow-500" },
];

export function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("emerald");
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

        <div>
          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase block mb-2">
            Color Accent
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center",
                  c.class,
                  color === c.id
                    ? "ring-2 ring-stone-900 ring-offset-2 scale-110"
                    : "opacity-80 hover:opacity-100 hover:scale-105"
                )}
                title={c.label}
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
            <Plus className="w-4 h-4 mr-1.5" />
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
}

