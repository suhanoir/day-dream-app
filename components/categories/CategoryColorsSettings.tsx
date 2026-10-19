"use client";

import React, { useState, useMemo } from "react";
import { useCategoryColors } from "@/components/providers/CategoryColorProvider";
import { CategoryColorPickerModal } from "./CategoryColorPickerModal";
import {
  CORE_TODO_CATEGORIES,
  DEFAULT_CATEGORY_COLORS,
  normalizeHexColor,
} from "@/lib/utils/categoryColors";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Palette, RotateCcw, Paintbrush, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function CategoryColorsSettings() {
  const {
    colors,
    allCategories,
    getCategoryStyle,
    getCategoryColor,
    setCategoryColor,
    resetCategoryColor,
  } = useCategoryColors();
  const { toast } = useToast();

  const [activeCategoryModal, setActiveCategoryModal] = useState<string | null>(
    null
  );

  // Split categories into Core (Personal, College, Work, Health, Study, Other) and Additional
  const coreCategories = useMemo(() => {
    return CORE_TODO_CATEGORIES as unknown as string[];
  }, []);

  const additionalCategories = useMemo(() => {
    return allCategories.filter(
      (cat) => !coreCategories.includes(cat)
    );
  }, [allCategories, coreCategories]);

  const handleOpenPicker = (categoryName: string) => {
    setActiveCategoryModal(categoryName);
  };

  const handleSaveColor = async (categoryName: string, newColor: string) => {
    const success = await setCategoryColor(categoryName, newColor);
    if (success) {
      toast(`Updated color for "${categoryName}"`);
    } else {
      toast(`Failed to update color for "${categoryName}"`);
    }
  };

  const handleResetColor = async (categoryName: string) => {
    const success = await resetCategoryColor(categoryName);
    if (success) {
      toast(`Reset "${categoryName}" color to default`);
    } else {
      toast(`Failed to reset color for "${categoryName}"`);
    }
  };

  const renderCategoryRow = (categoryName: string) => {
    const currentColor = getCategoryColor(categoryName);
    const defaultColor =
      DEFAULT_CATEGORY_COLORS[categoryName] ||
      normalizeHexColor(currentColor);
    const style = getCategoryStyle(categoryName);
    const isCustomized =
      normalizeHexColor(currentColor).toLowerCase() !==
      normalizeHexColor(defaultColor).toLowerCase();

    return (
      <div
        key={categoryName}
        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl glass-card border border-stone-200/60 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 transition-all shadow-2xs"
      >
        {/* Left: Category Name + Dynamic Chip Preview */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => handleOpenPicker(categoryName)}
            title="Click to customize color"
            className="w-7 h-7 rounded-full shadow-2xs shrink-0 flex items-center justify-center ring-2 ring-stone-200/60 dark:ring-white/10 hover:scale-110 transition-transform cursor-pointer"
            style={{ backgroundColor: currentColor }}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary truncate">
                {categoryName}
              </span>
              <span
                style={style.badgeStyle}
                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider select-none"
              >
                {categoryName}
              </span>
            </div>
            <span className="text-[11px] text-muted font-mono">
              {currentColor}
              {isCustomized && (
                <span className="ml-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-sans font-medium">
                  (Custom)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isCustomized && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleResetColor(categoryName)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 h-8 px-2 text-xs"
              title="Reset to original color"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-1">Reset</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenPicker(categoryName)}
            className="h-8 px-3 text-xs gap-1.5 font-semibold text-primary"
          >
            <Paintbrush className="w-3.5 h-3.5 text-muted" />
            <span>Change</span>
          </Button>
        </div>
      </div>
    );
  };

  const activeCategory = activeCategoryModal;
  const activeCurrentColor = activeCategory
    ? getCategoryColor(activeCategory)
    : "#78716C";
  const activeDefaultColor = activeCategory
    ? DEFAULT_CATEGORY_COLORS[activeCategory] || activeCurrentColor
    : "#78716C";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro info box */}
      <div className="glass-card rounded-2xl p-5 border border-stone-200/70 dark:border-white/10 space-y-1.5">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--theme-primary)]" />
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            Category Colors
          </h2>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Customize the color for each category. Your chosen colors are automatically applied across
          your To-Do list, Calendar schedules, and dreams.
        </p>
      </div>

      {/* Core Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Core Categories
          </span>
          <span className="text-[11px] text-muted">
            {coreCategories.length} categories
          </span>
        </div>

        <div className="space-y-2">
          {coreCategories.map((name) => renderCategoryRow(name))}
        </div>
      </div>

      {/* Additional & Custom Categories */}
      {additionalCategories.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Additional & Custom Categories
            </span>
            <span className="text-[11px] text-muted">
              {additionalCategories.length} categories
            </span>
          </div>

          <div className="space-y-2">
            {additionalCategories.map((name) => renderCategoryRow(name))}
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {activeCategory && (
        <CategoryColorPickerModal
          isOpen={Boolean(activeCategory)}
          onClose={() => setActiveCategoryModal(null)}
          categoryName={activeCategory}
          currentColor={activeCurrentColor}
          defaultColor={activeDefaultColor}
          onSave={(color) => handleSaveColor(activeCategory, color)}
          onReset={() => handleResetColor(activeCategory)}
        />
      )}
    </div>
  );
}

