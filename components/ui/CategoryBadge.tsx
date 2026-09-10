"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CategoryBadgeProps {
  name: string;
  color?: string | null;
  className?: string;
  size?: "sm" | "md";
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  sky: { bg: "bg-sky-50/80 backdrop-blur-xs", text: "text-sky-850", border: "border-sky-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  amber: { bg: "bg-amber-50/80 backdrop-blur-xs", text: "text-amber-850", border: "border-amber-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  rose: { bg: "bg-rose-50/80 backdrop-blur-xs", text: "text-rose-850", border: "border-rose-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  indigo: { bg: "bg-indigo-50/80 backdrop-blur-xs", text: "text-indigo-850", border: "border-indigo-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  emerald: { bg: "bg-emerald-50/80 backdrop-blur-xs", text: "text-emerald-850", border: "border-emerald-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  teal: { bg: "bg-teal-50/80 backdrop-blur-xs", text: "text-teal-850", border: "border-teal-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  yellow: { bg: "bg-yellow-50/80 backdrop-blur-xs", text: "text-yellow-850", border: "border-yellow-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  violet: { bg: "bg-violet-50/80 backdrop-blur-xs", text: "text-violet-850", border: "border-violet-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  purple: { bg: "bg-purple-50/80 backdrop-blur-xs", text: "text-purple-850", border: "border-purple-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
  stone: { bg: "bg-stone-100/80 backdrop-blur-xs", text: "text-stone-700", border: "border-stone-200/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)]" },
};

export function CategoryBadge({
  name,
  color = "emerald",
  className,
  size = "sm",
}: CategoryBadgeProps) {
  const styles = (color && colorMap[color]) || colorMap.stone;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border tracking-wide uppercase shadow-2xs select-none",
        styles.bg,
        styles.text,
        styles.border,
        size === "sm" && "text-[9.5px] px-2.5 py-0.5",
        size === "md" && "text-[11px] px-3 py-1",
        className
      )}
    >
      {name}
    </span>
  );
}

