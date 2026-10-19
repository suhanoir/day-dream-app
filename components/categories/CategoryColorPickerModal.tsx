"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  PRESET_PALETTE,
  normalizeHexColor,
  hexToRgb,
  getCategoryStyle,
} from "@/lib/utils/categoryColors";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { Check, RotateCcw, Sparkles, Calendar, CheckSquare, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CategoryColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  currentColor: string;
  defaultColor: string;
  onSave: (color: string) => Promise<boolean | void>;
  onReset: () => Promise<boolean | void>;
}

export function CategoryColorPickerModal({
  isOpen,
  onClose,
  categoryName,
  currentColor,
  defaultColor,
  onSave,
  onReset,
}: CategoryColorPickerModalProps) {
  const { isDark } = useTheme();
  const { playSound } = useSound();

  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [hexInput, setHexInput] = useState<string>(currentColor);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sync state whenever modal opens or currentColor changes
  useEffect(() => {
    if (isOpen) {
      const normalized = normalizeHexColor(currentColor);
      setSelectedColor(normalized);
      setHexInput(normalized);
    }
  }, [isOpen, currentColor]);

  // Generate live preview styles for the currently selected color
  const previewStyle = useMemo(() => {
    return getCategoryStyle(categoryName, isDark, {
      [categoryName]: selectedColor,
    });
  }, [categoryName, selectedColor, isDark]);

  const handleSelectPreset = (hex: string) => {
    setSelectedColor(hex);
    setHexInput(hex);
    playSound("ui-click");
  };

  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    const cleaned = val.startsWith("#") ? val : `#${val}`;
    if (hexToRgb(cleaned)) {
      setSelectedColor(cleaned.toUpperCase());
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSelectedColor(val);
    setHexInput(val);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedColor);
      playSound("success");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      await onReset();
      setSelectedColor(defaultColor);
      setHexInput(defaultColor);
      playSound("success");
      onClose();
    } finally {
      setIsResetting(false);
    }
  };

  const isDefault =
    normalizeHexColor(selectedColor).toLowerCase() ===
    normalizeHexColor(defaultColor).toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customize Color: ${categoryName}`}
      subtitle="Choose a category color once, use it everywhere across DayDream."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Live Preview Card */}
        <div className="glass-card rounded-2xl p-4 space-y-2.5 border border-stone-200/70 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Preview
            </span>
            <span className="text-[10px] text-muted font-mono">{selectedColor}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* 1. Category Chip */}
            <div className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/50 dark:border-white/5 flex flex-col items-center justify-center gap-1 text-center">
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Chip
              </span>
              <span
                style={previewStyle.badgeStyle}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold border truncate max-w-full"
              >
                {categoryName}
              </span>
            </div>

            {/* 2. Calendar Event Pill */}
            <div className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/50 dark:border-white/5 flex flex-col gap-1 justify-center">
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> Calendar Event
              </span>
              <div
                style={previewStyle.style}
                className="px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 truncate"
              >
                <span
                  style={previewStyle.dotStyle}
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                />
                <span className="truncate">{categoryName} Event</span>
              </div>
            </div>

            {/* 3. Task Badge */}
            <div className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/50 dark:border-white/5 flex flex-col gap-1 justify-center">
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                <CheckSquare className="w-2.5 h-2.5" /> To-Do Task
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  style={previewStyle.badgeStyle}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium border truncate"
                >
                  {categoryName}
                </span>
                <span className="text-[11px] text-primary truncate font-medium">Task item</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Palette Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary block">
            Curated Palette (16 Colors)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {PRESET_PALETTE.map((swatch) => {
              const isSelected =
                selectedColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.id}
                  type="button"
                  title={`${swatch.name} (${swatch.hex})`}
                  onClick={() => handleSelectPreset(swatch.hex)}
                  className={cn(
                    "group relative aspect-square rounded-xl p-1 flex items-center justify-center transition-all cursor-pointer border",
                    isSelected
                      ? "ring-2 ring-[var(--theme-primary)] scale-105 shadow-sm border-transparent"
                      : "border-stone-200/70 dark:border-white/10 hover:scale-105"
                  )}
                >
                  <span
                    className="w-full h-full rounded-lg shadow-2xs flex items-center justify-center transition-transform"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary block">
            Custom Color (Hex)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#3B82F6"
                maxLength={7}
                className="w-full px-3.5 py-2 glass-input text-primary font-mono text-sm rounded-xl uppercase tracking-wider"
              />
            </div>

            {/* Native Color Picker Trigger */}
            <label
              className="relative w-10 h-10 rounded-xl border border-stone-200/70 dark:border-white/15 overflow-hidden shadow-2xs cursor-pointer shrink-0 flex items-center justify-center hover:scale-105 transition-all"
              style={{ backgroundColor: selectedColor }}
              title="Open Color Wheel"
            >
              <input
                type="color"
                value={selectedColor}
                onChange={handleNativeColorChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200/60 dark:border-white/10 flex-wrap">
          <div>
            {!isDefault && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetToDefault}
                disabled={isResetting || isSaving}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving || isResetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isResetting}
              className="gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Color"}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

