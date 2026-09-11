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
    bg: "bg-sky-50/90 dark:bg-sky-950/60 backdrop-blur-xs",
    text: "text-sky-700 dark:text-sky-300 font-semibold",
    border: "border-sky-200/80 dark:border-sky-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  amber: {
    bg: "bg-amber-50/90 dark:bg-amber-950/60 backdrop-blur-xs",
    text: "text-amber-800 dark:text-amber-300 font-semibold",
    border: "border-amber-200/80 dark:border-amber-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  rose: {
    bg: "bg-rose-50/90 dark:bg-rose-950/60 backdrop-blur-xs",
    text: "text-rose-700 dark:text-rose-300 font-semibold",
    border: "border-rose-200/80 dark:border-rose-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  indigo: {
    bg: "bg-indigo-50/90 dark:bg-indigo-950/60 backdrop-blur-xs",
    text: "text-indigo-700 dark:text-indigo-300 font-semibold",
    border: "border-indigo-200/80 dark:border-indigo-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  emerald: {
    bg: "bg-emerald-50/90 dark:bg-emerald-950/60 backdrop-blur-xs",
    text: "text-emerald-800 dark:text-emerald-300 font-semibold",
    border: "border-emerald-200/80 dark:border-emerald-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  teal: {
    bg: "bg-teal-50/90 dark:bg-teal-950/60 backdrop-blur-xs",
    text: "text-teal-700 dark:text-teal-300 font-semibold",
    border: "border-teal-200/80 dark:border-teal-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  yellow: {
    bg: "bg-yellow-50/90 dark:bg-yellow-950/60 backdrop-blur-xs",
    text: "text-yellow-800 dark:text-yellow-300 font-semibold",
    border: "border-yellow-200/80 dark:border-yellow-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  violet: {
    bg: "bg-violet-50/90 dark:bg-violet-950/60 backdrop-blur-xs",
    text: "text-violet-700 dark:text-violet-300 font-semibold",
    border: "border-violet-200/80 dark:border-violet-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  purple: {
    bg: "bg-purple-50/90 dark:bg-purple-950/60 backdrop-blur-xs",
    text: "text-purple-700 dark:text-purple-300 font-semibold",
    border: "border-purple-200/80 dark:border-purple-700/60 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
  },
  stone: {
    bg: "bg-stone-100/90 dark:bg-stone-800/80 backdrop-blur-xs",
    text: "text-stone-800 dark:text-stone-200 font-semibold",
    border: "border-stone-200/80 dark:border-stone-700/80 shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.8)] dark:shadow-none",
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

