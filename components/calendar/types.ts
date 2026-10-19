export interface EventData {
  id: string;
  userId: string;
  bucketListItemId?: string | null;
  title: string;
  description?: string | null;
  date: string; // ISO string
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  category: string;
  color?: string | null;
  reminder?: string | null;
  createdAt: string;
  updatedAt: string;
  bucketListItem?: {
    id: string;
    title: string;
    completed: boolean;
  } | null;
}

import React from "react";
import {
  getCategoryStyle as resolveCategoryStyle,
  DEFAULT_CATEGORY_COLORS,
} from "@/lib/utils/categoryColors";

export interface EventCategoryStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  badge: string;
  style?: React.CSSProperties;
  dotStyle?: React.CSSProperties;
  badgeStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
}

export const EVENT_CATEGORIES = [
  "Personal",
  "Work",
  "College",
  "Travel",
  "Important",
  "Social",
] as const;

export const CATEGORY_STYLES: Record<string, EventCategoryStyle> = {
  Personal: {
    label: "Personal",
    bg: "bg-violet-50/80",
    text: "text-violet-700",
    border: "border-violet-200/80",
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
  Work: {
    label: "Work",
    bg: "bg-emerald-50/80",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  College: {
    label: "College",
    bg: "bg-sky-50/80",
    text: "text-sky-700",
    border: "border-sky-200/80",
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  Travel: {
    label: "Travel",
    bg: "bg-amber-50/80",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Important: {
    label: "Important",
    bg: "bg-rose-50/80",
    text: "text-rose-700",
    border: "border-rose-200/80",
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
  Social: {
    label: "Social",
    bg: "bg-teal-50/80",
    text: "text-teal-700",
    border: "border-teal-200/80",
    dot: "bg-teal-500",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
  },
};

export function getCategoryStyle(category: string, isDark: boolean = false, customColor?: string): EventCategoryStyle {
  const resolved = resolveCategoryStyle(
    category,
    isDark,
    customColor ? { [category]: customColor } : undefined
  );
  return {
    label: resolved.label,
    bg: resolved.bg,
    text: resolved.text,
    border: resolved.border,
    dot: resolved.dot,
    badge: resolved.badge,
    style: resolved.style,
    dotStyle: resolved.dotStyle,
    badgeStyle: resolved.badgeStyle,
    textStyle: resolved.textStyle,
  };
}

export function formatEventTime(startTime?: string | null, endTime?: string | null): string {
  if (!startTime && !endTime) return "All Day";
  if (startTime && !endTime) return startTime;
  if (!startTime && endTime) return `Until ${endTime}`;
  return `${startTime} – ${endTime}`;
}

