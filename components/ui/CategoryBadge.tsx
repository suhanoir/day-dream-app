"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { useCategoryColors } from "@/components/providers/CategoryColorProvider";

export interface CategoryBadgeProps {
  name: string;
  color?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({
  name,
  color,
  className,
  size = "sm",
}: CategoryBadgeProps) {
  const { getCategoryStyle } = useCategoryColors();
  const resolvedStyle = getCategoryStyle(name, color);

  return (
    <span
      style={resolvedStyle.badgeStyle}
      className={cn(
        "inline-flex items-center font-semibold rounded-full border tracking-wide uppercase shadow-2xs select-none",
        size === "sm" && "text-[9.5px] px-2.5 py-0.5",
        size === "md" && "text-[11px] px-3 py-1",
        className
      )}
    >
      {name}
    </span>
  );
}
