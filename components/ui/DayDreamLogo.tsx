import React from "react";
import { cn } from "@/lib/utils/cn";

export type DayDreamLogoVariant =
  | "default"
  | "icon"
  | "light"
  | "dark"
  | "monochrome";

export interface DayDreamLogoProps {
  className?: string;
  size?: number;
  variant?: DayDreamLogoVariant;
  withWordmark?: boolean;
  wordmarkClassName?: string;
  wordmarkPosition?: "horizontal" | "stacked";
}

export function DayDreamLogo({
  className,
  size = 32,
  variant = "default",
  withWordmark = false,
  wordmarkClassName,
  wordmarkPosition = "horizontal",
}: DayDreamLogoProps) {
  // Brand color palette constants
  const CHARCOAL = "#17191C";
  const WARM_IVORY = "#F7F3EA";

  // Master Abstract Geometry: "The Threshold" (viewBox 0 0 256 256)
  // Positive Space = DAY (Grounded action / reality)
  // Negative Space = DREAM (Ascending aperture / vision)
  // Subtly conceals the dual 'DD' (DayDream) relationship.
  const glyphPath =
    "M 70 70 C 70 52, 86 40, 108 40 C 168 40, 212 79, 212 128 C 212 177, 168 216, 108 216 C 86 216, 70 204, 70 186 Z M 106 82 C 138 82, 166 102, 166 128 C 166 154, 138 174, 106 174 C 100 174, 96 170, 96 164 L 96 92 C 96 86, 100 82, 106 82 Z";

  const renderSvgMark = () => {
    if (variant === "icon") {
      // Mobile native squircle app icon
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          width={size}
          height={size}
          className={cn("shrink-0 select-none overflow-hidden rounded-2xl", className)}
          shapeRendering="geometricPrecision"
          aria-label="DayDream App Icon"
          role="img"
        >
          <rect width="256" height="256" rx="56" fill={CHARCOAL} />
          <g transform="translate(128, 128) scale(0.80) translate(-128, -128)">
            <path d={glyphPath} fill={WARM_IVORY} fillRule="evenodd" />
          </g>
        </svg>
      );
    }

    if (variant === "light") {
      // Dark glyph on transparent ground (for light backgrounds/paper)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          width={size}
          height={size}
          className={cn("shrink-0 select-none", className)}
          shapeRendering="geometricPrecision"
          aria-label="DayDream"
          role="img"
        >
          <path d={glyphPath} fill={CHARCOAL} fillRule="evenodd" />
        </svg>
      );
    }

    if (variant === "dark") {
      // Warm ivory glyph on transparent ground (for dark headers/cards)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          width={size}
          height={size}
          className={cn("shrink-0 select-none", className)}
          shapeRendering="geometricPrecision"
          aria-label="DayDream"
          role="img"
        >
          <path d={glyphPath} fill={WARM_IVORY} fillRule="evenodd" />
        </svg>
      );
    }

    if (variant === "monochrome") {
      // Contextual tint using currentColor
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          width={size}
          height={size}
          className={cn("rounded-full shrink-0 select-none overflow-hidden", className)}
          shapeRendering="geometricPrecision"
          aria-label="DayDream"
          role="img"
        >
          <circle cx="128" cy="128" r="128" fill="currentColor" />
          <path d={glyphPath} fill="#FFFFFF" fillRule="evenodd" />
        </svg>
      );
    }

    // Default: Signature circular dark emblem with warm ivory symbol
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width={size}
        height={size}
        className={cn("rounded-full shrink-0 select-none overflow-hidden", className)}
        shapeRendering="geometricPrecision"
        aria-label="DayDream Logo"
        role="img"
      >
        <circle cx="128" cy="128" r="128" fill={CHARCOAL} />
        <path d={glyphPath} fill={WARM_IVORY} fillRule="evenodd" />
      </svg>
    );
  };

  if (!withWordmark) {
    return renderSvgMark();
  }

  const isStacked = wordmarkPosition === "stacked";

  return (
    <div
      className={cn(
        "inline-flex items-center select-none",
        isStacked ? "flex-col gap-2.5 text-center" : "gap-3",
      )}
    >
      {renderSvgMark()}
      <span
        className={cn(
          "font-semibold tracking-[0.2em] uppercase text-sm",
          variant === "light" ? "text-[#17191C]" : "text-[#F7F3EA]",
          wordmarkClassName,
        )}
      >
        DAYDREAM
      </span>
    </div>
  );
}

export default DayDreamLogo;

