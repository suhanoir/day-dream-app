"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { THEMES, ThemeId, useTheme } from "@/components/providers/ThemeProvider";
import { Sparkles, Calendar, Quote, CheckCircle2 } from "lucide-react";

export type PostcardStyle = "polaroid" | "editorial" | "journal";

export interface MemoryPostcardProps {
  title: string;
  completedAt?: string | Date | null;
  reflection?: string | null;
  coverPhoto?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  style?: PostcardStyle;
  themeId?: ThemeId;
  showCategory?: boolean;
  showDate?: boolean;
  className?: string;
}

export const MemoryPostcard = forwardRef<HTMLDivElement, MemoryPostcardProps>(
  (
    {
      title,
      completedAt,
      reflection,
      coverPhoto,
      categoryName,
      categoryColor,
      style = "polaroid",
      themeId,
      showCategory = true,
      showDate = true,
      className,
    },
    ref
  ) => {
    const { theme, currentThemeMeta: activeThemeMeta } = useTheme();

    // Resolve target theme
    const resolvedThemeId = themeId || theme;
    const themeMeta =
      THEMES.find((t) => t.id === resolvedThemeId) || activeThemeMeta;

    const isDark = themeMeta.mode === "dark";
    const isMidnightCitrus = themeMeta.id === "midnight-citrus";

    // Format completed date
    const formattedDate = completedAt
      ? new Date(completedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

    // Intelligently truncate reflection for postcard preview
    const cleanReflection = reflection?.trim() || "";
    const truncatedReflection =
      cleanReflection.length > 180
        ? cleanReflection.slice(0, 177).trim() + "..."
        : cleanReflection;

    // Fallback quote if reflection is empty
    const displayQuote =
      truncatedReflection || "Another dream lived and remembered.";

    // Palette tokens
    const { palette } = themeMeta;

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 select-none",
          "w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5.4] rounded-3xl",
          "flex flex-col justify-between shadow-2xl p-5 sm:p-6",
          className
        )}
        style={{
          backgroundColor: isDark
            ? isMidnightCitrus
              ? "#0B0D12"
              : palette.surface
            : "#FFFFFF",
          color: palette.text,
          border: `1px solid ${
            isMidnightCitrus
              ? "rgba(245, 158, 11, 0.25)"
              : isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.08)"
          }`,
          boxShadow: isMidnightCitrus
            ? "0 25px 50px -12px rgba(245, 158, 11, 0.08), 0 0 0 1px rgba(245, 158, 11, 0.15)"
            : isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
            : "0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Specular Liquid Glass Top Rim Highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${
              isMidnightCitrus ? "#FBBF24" : palette.primary
            } 50%, transparent 100%)`,
          }}
        />

        {/* Ambient Theme Backlight Glow */}
        <div
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: palette.primary }}
        />

        {/* ================================================================= */}
        {/* COMPOSITION 1: POLAROID (Classic Photo Keepsake)                  */}
        {/* ================================================================= */}
        {style === "polaroid" && (
          <div className="flex flex-col h-full justify-between">
            {/* Upper Section: Photo or Typographic Plaque */}
            <div className="w-full relative">
              {coverPhoto ? (
                <div
                  className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md relative"
                  style={{
                    border: `1px solid ${
                      isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)"
                    }`,
                  }}
                >
                  <img
                    src={coverPhoto}
                    alt={title}
                    className="w-full h-full object-cover object-center"
                    crossOrigin="anonymous"
                  />
                  {/* Subtle photo vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                /* Elegant Typographic Vignette if no photo */
                <div
                  className="w-full aspect-[4/2.6] rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0, 0, 0, 0.02)",
                    border: `1px dashed ${
                      isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"
                    }`,
                  }}
                >
                  <Sparkles
                    className="w-6 h-6 mb-2 opacity-80"
                    style={{ color: palette.primary }}
                  />
                  <span
                    className="text-[11px] font-bold tracking-widest uppercase font-mono"
                    style={{ color: isDark ? "rgba(240, 245, 255, 0.85)" : "#4B5563" }}
                  >
                    DayDream Keepsake
                  </span>
                </div>
              )}
            </div>

            {/* Lower Section: Story & Metadata */}
            <div className="mt-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {showCategory && categoryName && (
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full inline-block shadow-2xs"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(0, 0, 0, 0.06)",
                        color: isDark ? "#FFFFFF" : palette.primary,
                      }}
                    >
                      {categoryName}
                    </span>
                  )}
                  {showDate && formattedDate && (
                    <span
                      className="text-[10px] tracking-wide font-medium ml-auto"
                      style={{ color: isDark ? "rgba(220, 225, 235, 0.85)" : "#4B5563" }}
                    >
                      {formattedDate}
                    </span>
                  )}
                </div>

                {/* Dream Title */}
                <h3
                  className="text-xl sm:text-2xl font-bold tracking-tight font-serif-heading leading-tight line-clamp-2 mt-1"
                  style={{ color: isDark ? "#FFFFFF" : "#18181B" }}
                >
                  {title}
                </h3>

                {/* Reflection Quote */}
                <div className="mt-3 relative">
                  <p
                    className="text-xs sm:text-[13px] leading-relaxed italic font-serif font-normal"
                    style={{ color: isDark ? "rgba(248, 250, 252, 0.94)" : "#27272A" }}
                  >
                    &ldquo;{displayQuote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom Subtle Brand Seal */}
              <div
                className="mt-4 pt-3 flex items-center justify-between text-[10px] border-t"
                style={{
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(0, 0, 0, 0.08)",
                  color: isDark ? "rgba(220, 225, 235, 0.85)" : "#4B5563",
                }}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: palette.success || palette.primary }}
                  />
                  <span>Milestone Achieved</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <DayDreamLogo size={14} />
                  <span className="tracking-wide">DayDream</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* COMPOSITION 2: EDITORIAL (Modern Museum Gallery Print)            */}
        {/* ================================================================= */}
        {style === "editorial" && (
          <div className="flex flex-col h-full justify-between">
            {/* Top Header Stamp */}
            <div
              className="flex items-center justify-between pb-3 border-b text-[10px] tracking-wider uppercase font-semibold"
              style={{
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
                color: palette.primary,
              }}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <DayDreamLogo size={14} />
                <span>DayDream Archive</span>
              </div>
              {showCategory && categoryName && (
                <span
                  className="font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    color: isDark ? "#FFFFFF" : "#334155",
                  }}
                >
                  {categoryName}
                </span>
              )}
            </div>

            {/* Middle Section: Title & Optional Photo */}
            <div className="my-auto py-3 flex flex-col gap-3">
              {coverPhoto && (
                <div
                  className="w-full aspect-[16/10] rounded-xl overflow-hidden shadow-sm"
                  style={{
                    border: `1px solid ${
                      isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)"
                    }`,
                  }}
                >
                  <img
                    src={coverPhoto}
                    alt={title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight font-serif-heading leading-tight line-clamp-3"
                style={{ color: isDark ? "#FFFFFF" : "#18181B" }}
              >
                {title}
              </h2>

              <div
                className="pl-3 border-l-2 py-0.5"
                style={{ borderColor: palette.primary }}
              >
                <p
                  className="text-xs sm:text-[13px] leading-relaxed italic font-serif"
                  style={{ color: isDark ? "rgba(248, 250, 252, 0.94)" : "#27272A" }}
                >
                  &ldquo;{displayQuote}&rdquo;
                </p>
              </div>
            </div>

            {/* Bottom Metadata */}
            <div
              className="pt-3 border-t flex items-center justify-between text-[10px]"
              style={{
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
                color: isDark ? "rgba(220, 225, 235, 0.85)" : "#4B5563",
              }}
            >
              {showDate && formattedDate ? (
                <span className="font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 opacity-80" />
                  {formattedDate}
                </span>
              ) : (
                <span className="font-semibold">Recorded Memory</span>
              )}
              <span className="font-mono text-[9px] uppercase tracking-widest font-medium opacity-80">
                Memories Worth Remembering
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* COMPOSITION 3: JOURNAL (Luxury Stationery Page)                   */}
        {/* ================================================================= */}
        {style === "journal" && (
          <div
            className="flex flex-col h-full justify-between rounded-2xl p-4 sm:p-5 relative"
            style={{
              border: `1px solid ${
                isMidnightCitrus
                  ? "rgba(245, 158, 11, 0.35)"
                  : isDark
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(0, 0, 0, 0.08)"
              }`,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(250, 250, 248, 0.8)",
            }}
          >
            {/* Header: Subtle Quote icon & Category */}
            <div className="flex items-center justify-between">
              <Quote
                className="w-5 h-5 opacity-70"
                style={{ color: palette.primary }}
              />
              {showCategory && categoryName && (
                <span
                  className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    color: isDark ? "#FFFFFF" : "#334155",
                  }}
                >
                  {categoryName}
                </span>
              )}
            </div>

            {/* Reflection as Central Keepsake */}
            <div className="my-auto py-4 space-y-3">
              {coverPhoto && (
                <div
                  className="w-full aspect-[2/1] rounded-xl overflow-hidden shadow-xs mb-3"
                  style={{
                    border: `1px solid ${
                      isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)"
                    }`,
                  }}
                >
                  <img
                    src={coverPhoto}
                    alt={title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              <p
                className="text-sm sm:text-base leading-relaxed font-serif italic font-normal"
                style={{ color: isDark ? "#F8FAFC" : "#18181B" }}
              >
                &ldquo;{displayQuote}&rdquo;
              </p>

              <div className="pt-2">
                <div
                  className="w-8 h-0.5 rounded-full mb-2 opacity-70"
                  style={{ backgroundColor: palette.primary }}
                />
                <h4
                  className="text-base sm:text-lg font-bold tracking-tight font-serif-heading"
                  style={{ color: isDark ? "#FFFFFF" : "#18181B" }}
                >
                  {title}
                </h4>
              </div>
            </div>

            {/* Footer with Seal */}
            <div
              className="pt-3 border-t flex items-center justify-between text-[10px]"
              style={{
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
                color: isDark ? "rgba(220, 225, 235, 0.85)" : "#4B5563",
              }}
            >
              {showDate && formattedDate ? (
                <span className="font-semibold">Captured · {formattedDate}</span>
              ) : (
                <span className="font-semibold">DayDream Journal</span>
              )}
              <div className="flex items-center gap-1 font-bold">
                <DayDreamLogo size={13} />
                <span>DayDream</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MemoryPostcard.displayName = "MemoryPostcard";
