"use client";

import React from "react";
import {
  STANDARD_ACCENT_PALETTE,
  PaletteColor,
  normalizeHexColor,
} from "@/lib/utils/categoryColors";
import { useCategoryColors } from "@/components/providers/CategoryColorProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { Check, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ColorPickerProps {
  /**
   * The currently selected hex color string, or null/empty if using automatic category color.
   */
  value?: string | null;
  /**
   * Callback when a color is selected or cleared back to automatic (null).
   */
  onChange: (color: string | null) => void;
  /**
   * Optional category name, used to preview the inherited color when in automatic mode.
   */
  categoryName?: string | null;
  /**
   * Whether to display the "Use Category Color" / "Automatic" option. Defaults to true.
   */
  allowAuto?: boolean;
  /**
   * Custom label for the automatic option. Defaults to "Category Color".
   */
  autoLabel?: string;
  /**
   * Section label. Defaults to "Accent Color". Pass empty string to hide.
   */
  label?: string;
  /**
   * Whether to render in a compact layout (smaller swatch sizes).
   */
  compact?: boolean;
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  categoryName,
  allowAuto = true,
  autoLabel = "Category Color",
  label = "Accent Color",
  compact = false,
  className,
}: ColorPickerProps) {
  const { playSound } = useSound();
  const { getCategoryColor } = useCategoryColors();

  // If value is null, empty, or 'auto', item uses category color
  const isAuto = !value || value.trim() === "" || value.toLowerCase() === "auto";
  const activeColorHex = !isAuto ? normalizeHexColor(value) : null;

  // Resolve category color for previewing what auto represents
  const inheritedCategoryColor = getCategoryColor(categoryName || "Personal");

  const handleSelectColor = (hex: string) => {
    playSound("ui-click");
    onChange(hex);
  };

  const handleSelectAuto = () => {
    playSound("ui-click");
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and current state indicator */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-secondary tracking-wide uppercase flex items-center gap-1.5">
            <span>{label}</span>
          </label>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            {isAuto ? (
              <span className="flex items-center gap-1 font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 dark:border-white/20 shadow-2xs"
                  style={{ backgroundColor: inheritedCategoryColor }}
                />
                Auto ({autoLabel})
              </span>
            ) : (
              <span className="flex items-center gap-1 font-mono font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 dark:border-white/20 shadow-2xs"
                  style={{ backgroundColor: activeColorHex || undefined }}
                />
                {activeColorHex}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Swatches Container */}
      <div className="space-y-2">
        {/* 12-Color Swatch Grid: 6 columns on desktop (2 rows of 6), touch-friendly */}
        <div
          role="radiogroup"
          aria-label={label || "Color Palette"}
          className="grid grid-cols-6 gap-1.5 sm:gap-2"
        >
          {STANDARD_ACCENT_PALETTE.map((swatch: PaletteColor) => {
            const isSelected =
              !isAuto &&
              activeColorHex?.toLowerCase() === swatch.hex.toLowerCase();

            return (
              <button
                key={swatch.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${swatch.name} (${swatch.hex})`}
                title={`${swatch.name} (${swatch.hex})`}
                onClick={() => handleSelectColor(swatch.hex)}
                className={cn(
                  "relative group aspect-square rounded-xl transition-all cursor-pointer flex items-center justify-center p-1",
                  compact ? "h-8 sm:h-9" : "h-9 sm:h-10",
                  isSelected
                    ? "ring-2 ring-[var(--theme-primary)] scale-105 shadow-sm"
                    : "hover:scale-105 hover:shadow-xs active:scale-95"
                )}
              >
                <span
                  className="w-full h-full rounded-lg flex items-center justify-center shadow-2xs border border-black/10 dark:border-white/15 transition-transform"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />
                  )}
                </span>
                {/* Tooltip on hover */}
                <span className="sr-only sm:not-sr-only pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap shadow-md z-30">
                  {swatch.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Automatic Category Color Reset Option */}
        {allowAuto && (
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSelectAuto}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                isAuto
                  ? "bg-[var(--theme-primary-soft,#EEF0FF)] text-[var(--theme-primary,#4F5FD7)] border-[var(--theme-primary,#4F5FD7)]/30 font-semibold shadow-2xs"
                  : "bg-stone-100/60 dark:bg-white/5 border-stone-200/70 dark:border-white/10 text-secondary hover:text-primary hover:bg-stone-100 dark:hover:bg-white/10"
              )}
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>Use {autoLabel}</span>
              <span
                className="w-2 h-2 rounded-full shrink-0 ml-0.5 border border-black/10 dark:border-white/20"
                style={{ backgroundColor: inheritedCategoryColor }}
                title={`Inherited: ${inheritedCategoryColor}`}
              />
            </button>

            {!isAuto && (
              <span className="text-[11px] text-muted italic">
                Custom accent active
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
