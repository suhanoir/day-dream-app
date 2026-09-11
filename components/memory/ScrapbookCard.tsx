"use client";

import React from "react";
import { BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { Sparkles, Image as ImageIcon, Quote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/providers/ThemeProvider";

export interface ScrapbookCardProps {
  item: BucketListItemData;
  onClick: (item: BucketListItemData) => void;
}

export function ScrapbookCard({ item, onClick }: ScrapbookCardProps) {
  const { currentThemeMeta } = useTheme();

  const formattedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  // Clean reflection snippet
  const snippet = item.reflection
    ? item.reflection.length > 90
      ? item.reflection.slice(0, 87) + "..."
      : item.reflection
    : null;

  // Multi-photo album calculation
  const photoCount = React.useMemo(() => {
    if (item.memoryPhotos) {
      try {
        const parsed = JSON.parse(item.memoryPhotos);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.length;
      } catch {
        // ignore
      }
    }
    return item.memoryPhoto ? 1 : 0;
  }, [item.memoryPhotos, item.memoryPhoto]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl p-4 sm:p-5",
        "glass-card-interactive border border-stone-200/80 dark:border-stone-800/80",
        "shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300",
        "cursor-pointer select-none text-left active:scale-[0.98]"
      )}
    >
      {/* Specular Liquid Glass Top Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />

      {/* Top Media: Photo or Artistic Keepsake Plaque */}
      <div className="w-full relative mb-3.5">
        {item.memoryPhoto ? (
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-inner border border-stone-200/60 dark:border-stone-700/60 relative">
            <img
              src={item.memoryPhoto}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10.5px] font-semibold flex items-center gap-1 shadow-xs border border-white/10">
              <ImageIcon className="w-3 h-3" />
              {photoCount > 1 && <span>{photoCount}</span>}
            </span>
          </div>
        ) : (
          <div className="w-full aspect-[4/2.4] rounded-2xl flex flex-col items-center justify-center p-4 text-center bg-stone-100/60 dark:bg-stone-800/30 border border-dashed border-stone-200 dark:border-stone-700/80 group-hover:border-stone-300 transition-colors">
            <Sparkles className="w-5 h-5 text-amber-500/80 mb-1.5 opacity-80 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted font-mono">
              Memory Keepsake
            </span>
          </div>
        )}
      </div>

      {/* Body: Title & Excerpt */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
            {item.category ? (
              <span className="font-bold uppercase tracking-wider text-[10px] text-secondary">
                {item.category.name}
              </span>
            ) : (
              <span className="text-muted font-mono text-[10px]">Dream</span>
            )}
            {formattedDate && (
              <span className="text-muted text-[10px] font-medium">
                {formattedDate}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-primary font-serif-heading line-clamp-2 leading-snug group-hover:text-accent transition-colors">
            {item.title}
          </h3>

          {/* Reflection Quote Snippet */}
          {snippet && (
            <p className="mt-2 text-xs text-secondary leading-relaxed italic font-serif line-clamp-2">
              &ldquo;{snippet}&rdquo;
            </p>
          )}
        </div>

        {/* Footer Seal */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px]">Achieved</span>
          </div>
          <span className="text-[10px] font-semibold group-hover:translate-x-0.5 transition-transform text-secondary group-hover:text-accent">
            View Postcard →
          </span>
        </div>
      </div>
    </div>
  );
}
