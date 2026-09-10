"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressBarProps {
  value: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  size = "md",
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full flex items-center gap-3", className)}>
      <div
        className={cn(
          "w-full bg-stone-200/60 rounded-full overflow-hidden relative shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.06)]",
          size === "sm" && "h-1.5",
          size === "md" && "h-2.5",
          size === "lg" && "h-3.5"
        )}
      >
        <div
          className="h-full bg-[var(--theme-primary,#4F5FD7)] rounded-full transition-all duration-500 ease-out shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.4)]"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-stone-700 shrink-0 min-w-[36px] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}

