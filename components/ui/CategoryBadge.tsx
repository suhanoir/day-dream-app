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
  sky: {
    bg: "bg-sky-50/90 dark:bg-sky-950/70 backdrop-blur-xs",
    text: "text-sky-800 dark:text-sky-200 font-semibold",
    border: "border-sky-200/80 dark:border-sky-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  amber: {
    bg: "bg-amber-50/90 dark:bg-amber-950/70 backdrop-blur-xs",
    text: "text-amber-800 dark:text-amber-200 font-semibold",
    border: "border-amber-200/80 dark:border-amber-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  rose: {
    bg: "bg-rose-50/90 dark:bg-rose-950/70 backdrop-blur-xs",
    text: "text-rose-800 dark:text-rose-200 font-semibold",
    border: "border-rose-200/80 dark:border-rose-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  indigo: {
    bg: "bg-indigo-50/90 dark:bg-indigo-950/70 backdrop-blur-xs",
    text: "text-indigo-800 dark:text-indigo-200 font-semibold",
    border: "border-indigo-200/80 dark:border-indigo-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  emerald: {
    bg: "bg-emerald-50/90 dark:bg-emerald-950/70 backdrop-blur-xs",
    text: "text-emerald-800 dark:text-emerald-200 font-semibold",
    border: "border-emerald-200/80 dark:border-emerald-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  teal: {
    bg: "bg-teal-50/90 dark:bg-teal-950/70 backdrop-blur-xs",
    text: "text-teal-800 dark:text-teal-200 font-semibold",
    border: "border-teal-200/80 dark:border-teal-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  yellow: {
    bg: "bg-yellow-50/90 dark:bg-yellow-950/70 backdrop-blur-xs",
    text: "text-yellow-800 dark:text-yellow-200 font-semibold",
    border: "border-yellow-200/80 dark:border-yellow-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  violet: {
    bg: "bg-violet-50/90 dark:bg-violet-950/70 backdrop-blur-xs",
    text: "text-violet-800 dark:text-violet-200 font-semibold",
    border: "border-violet-200/80 dark:border-violet-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  purple: {
    bg: "bg-purple-50/90 dark:bg-purple-950/70 backdrop-blur-xs",
    text: "text-purple-800 dark:text-purple-200 font-semibold",
    border: "border-purple-200/80 dark:border-purple-500/30 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  stone: {
    bg: "bg-stone-100/90 dark:bg-white/10 backdrop-blur-xs",
    text: "text-stone-800 dark:text-stone-100 font-semibold",
    border: "border-stone-200/80 dark:border-white/15 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
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

