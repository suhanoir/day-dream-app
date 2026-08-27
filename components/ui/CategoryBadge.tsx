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
  sky: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200/80" },
  amber: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200/80" },
  rose: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200/80" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200/80" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200/80" },
  teal: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200/80" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200/80" },
  violet: { bg: "bg-violet-50", text: "text-violet-800", border: "border-violet-200/80" },
  purple: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200/80" },
  stone: { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200/80" },
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
        "inline-flex items-center font-medium rounded-md border tracking-wide uppercase",
        styles.bg,
        styles.text,
        styles.border,
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        className
      )}
    >
      {name}
    </span>
  );
}

