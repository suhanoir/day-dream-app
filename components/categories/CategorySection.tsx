"use client";

import React, { useState } from "react";
import { BucketListItemCard, BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { CategoryData } from "./AddCategoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CategorySectionProps {
  category: CategoryData;
  items: BucketListItemData[];
  onItemClick: (item: BucketListItemData) => void;
  onAddItemClick: (categoryId: string) => void;
  onEditCategoryClick: (category: CategoryData) => void;
  onCategoryDeleted: (categoryId: string) => void;
}

export function CategorySection({
  category,
  items,
  onItemClick,
  onAddItemClick,
  onEditCategoryClick,
  onCategoryDeleted,
}: CategorySectionProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleDeleteCategory = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || "Failed to delete category.");
        return;
      }

      playSound("delete");
      setShowDeleteConfirm(false);
      onCategoryDeleted(category.id);
      success(`Category "${category.name}" removed.`);
    } catch {
      toastError("Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="bg-white/70 backdrop-blur-xs border border-stone-200/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:border-stone-300">
        {/* Category Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-stone-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold tracking-wider uppercase text-stone-900 truncate">
                {category.name}
              </h3>
              <span className="text-xs text-stone-400 font-medium shrink-0">
                {completedItems} / {totalItems} completed
              </span>
            </div>

            {category.description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                {category.description}
              </p>
            )}

            {/* Subtle category progress bar */}
            {totalItems > 0 && (
              <div className="w-32 sm:w-48 bg-stone-100 rounded-full h-1 mt-2.5 overflow-hidden">
                <div
                  className="bg-stone-800 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Action Menu */}
          <div className="flex items-center gap-1 shrink-0 relative">
            <button
              onClick={() => onAddItemClick(category.id)}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              title="Add goal to this category"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              title="Category options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-stone-200/90 rounded-xl shadow-xl z-30 py-1.5 text-xs animate-fade-in">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onAddItemClick(category.id);
                    }}
                    className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Goal
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditCategoryClick(category);
                    }}
                    className="w-full px-3.5 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Category
                  </button>
                  <div className="my-1 border-t border-stone-100" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Category
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Item List */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <BucketListItemCard
                key={item.id}
                item={item}
                onClick={onItemClick}
                showCategoryBadge={false}
              />
            ))}
          </div>
        ) : (
          /* Empty Category State */
          <div className="py-6 px-4 text-center rounded-xl border border-dashed border-stone-200/90 bg-stone-50/50">
            <Sparkles className="w-5 h-5 text-stone-300 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-stone-500">
              Nothing here yet.
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5 mb-3">
              What experience do you want to add?
            </p>
            <button
              onClick={() => onAddItemClick(category.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 bg-white border border-stone-200/90 hover:bg-stone-100 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Goal
            </button>
          </div>
        )}
      </section>

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category?"
        message={`Are you sure you want to delete "${category.name}"? All ${totalItems} goal(s) in this category will also be deleted.`}
        confirmText="Delete Category"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}

