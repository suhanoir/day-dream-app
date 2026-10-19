import React from "react";

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export const STANDARD_ACCENT_PALETTE: PaletteColor[] = [
  { id: "rose", name: "Rose", hex: "#E85D75" },
  { id: "tangerine", name: "Tangerine", hex: "#F28C45" },
  { id: "marigold", name: "Marigold", hex: "#E6B93F" },
  { id: "mint", name: "Mint", hex: "#43A987" },
  { id: "lagoon", name: "Lagoon", hex: "#269FAD" },
  { id: "sky", name: "Sky", hex: "#4387E8" },
  { id: "indigo", name: "Indigo", hex: "#6467D9" },
  { id: "orchid", name: "Orchid", hex: "#9868D9" },
  { id: "blossom", name: "Blossom", hex: "#D96CB1" },
  { id: "terracotta", name: "Terracotta", hex: "#B76E4D" },
  { id: "slate", name: "Slate", hex: "#718096" },
  { id: "dusty-blush", name: "Dusty Blush", hex: "#C9A9A6" },
];

export const PRESET_PALETTE = STANDARD_ACCENT_PALETTE;

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  Personal: "#6467D9", // Indigo
  College: "#4387E8", // Sky
  Work: "#43A987", // Mint
  Health: "#269FAD", // Lagoon
  Study: "#9868D9", // Orchid
  Other: "#718096", // Slate
  Travel: "#F28C45", // Tangerine
  Important: "#E85D75", // Rose
  Social: "#269FAD", // Lagoon
  Experiences: "#E6B93F", // Marigold
  Life: "#D96CB1", // Blossom
  Skills: "#6467D9", // Indigo
  Career: "#43A987", // Mint
  Fitness: "#269FAD", // Lagoon
  Money: "#E6B93F", // Marigold
};

export const CORE_TODO_CATEGORIES = [
  "Personal",
  "College",
  "Work",
  "Health",
  "Study",
  "Other",
] as const;

export const NAMED_COLORS: Record<string, string> = {
  rose: "#E85D75",
  tangerine: "#F28C45",
  marigold: "#E6B93F",
  mint: "#43A987",
  lagoon: "#269FAD",
  sky: "#4387E8",
  indigo: "#6467D9",
  orchid: "#9868D9",
  blossom: "#D96CB1",
  terracotta: "#B76E4D",
  slate: "#718096",
  "dusty-blush": "#C9A9A6",
  "dusty blush": "#C9A9A6",
  dustyblush: "#C9A9A6",
  // Legacy aliases
  emerald: "#43A987",
  amber: "#F28C45",
  violet: "#6467D9",
  teal: "#269FAD",
  yellow: "#E6B93F",
  purple: "#9868D9",
  blue: "#4387E8",
  cyan: "#269FAD",
  lime: "#43A987",
  orange: "#F28C45",
  coral: "#E85D75",
  red: "#E85D75",
  pink: "#D96CB1",
  stone: "#718096",
  neutral: "#718096",
  gray: "#718096",
};

export interface ResolvedCategoryStyle {
  label: string;
  color: string; // The active hex color, e.g. "#8B5CF6"
  style: React.CSSProperties; // { backgroundColor, color, borderColor }
  dotStyle: React.CSSProperties; // { backgroundColor }
  badgeStyle: React.CSSProperties; // { backgroundColor, color, borderColor }
  textStyle: React.CSSProperties; // { color }
  // Legacy Tailwind class names for backward compatibility
  bg: string;
  text: string;
  border: string;
  dot: string;
  badge: string;
}

/**
 * Converts a hex string (#RGB, #RRGGBB) to RGB numbers.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== "string") return null;
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  return { h, s, l };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else if (h >= 300 && h < 360) {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * Normalizes any color representation (named token like "emerald", 3/6 char hex, etc.) to valid #RRGGBB.
 */
export function normalizeHexColor(input?: string | null): string {
  if (!input || typeof input !== "string") {
    return "#78716C";
  }
  const trimmed = input.trim().toLowerCase();
  if (NAMED_COLORS[trimmed]) {
    return NAMED_COLORS[trimmed];
  }
  const cleanHex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const rgb = hexToRgb(cleanHex);
  if (rgb) {
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  return "#78716C";
}

/**
 * Computes a deterministic default color for any category name.
 */
export function getDefaultColorForCategory(name: string): string {
  if (!name) return "#78716C";
  if (DEFAULT_CATEGORY_COLORS[name]) {
    return DEFAULT_CATEGORY_COLORS[name];
  }
  // Check case-insensitive match
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(DEFAULT_CATEGORY_COLORS)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }
  // Deterministic fallback based on string hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESET_PALETTE.length;
  return PRESET_PALETTE[index].hex;
}

/**
 * Calculates a high-contrast, comfortable text color for light or dark mode.
 */
export function getContrastTextColor(hex: string, isDark: boolean): string {
  const rgb = hexToRgb(hex) || { r: 120, g: 113, b: 108 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (isDark) {
    // In dark mode, ensure text is lightened to be luminous and readable against dark cards
    const targetL = Math.max(0.72, Math.min(0.85, hsl.l < 0.5 ? 0.76 : hsl.l));
    const targetS = Math.min(hsl.s, 0.85);
    const textRgb = hslToRgb(hsl.h, targetS, targetL);
    return rgbToHex(textRgb.r, textRgb.g, textRgb.b);
  } else {
    // In light mode, clamp lightness between 0.24 and 0.34 to ensure sharp, dark text contrast
    const targetL = hsl.s < 0.15 ? 0.22 : 0.28;
    const targetS = Math.min(hsl.s, 0.85);
    const textRgb = hslToRgb(hsl.h, targetS, targetL);
    return rgbToHex(textRgb.r, textRgb.g, textRgb.b);
  }
}

/**
 * Generates translucent background color.
 */
export function getTranslucentBg(hex: string, isDark: boolean): string {
  const rgb = hexToRgb(hex) || { r: 120, g: 113, b: 108 };
  const alpha = isDark ? 0.20 : 0.12;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Generates translucent border color.
 */
export function getTranslucentBorder(hex: string, isDark: boolean): string {
  const rgb = hexToRgb(hex) || { r: 120, g: 113, b: 108 };
  const alpha = isDark ? 0.38 : 0.26;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Centralized Category Style Resolver
 * Given a category name and optional custom colors map, returns complete style tokens.
 */
export function getCategoryStyle(
  category: string,
  isDark: boolean = false,
  customColorsMap?: Record<string, string> | null
): ResolvedCategoryStyle {
  const label = category || "General";
  let activeHex = customColorsMap ? customColorsMap[label] : undefined;

  if (!activeHex && customColorsMap) {
    // Check case-insensitive match
    const lower = label.toLowerCase();
    for (const [key, val] of Object.entries(customColorsMap)) {
      if (key.toLowerCase() === lower) {
        activeHex = val;
        break;
      }
    }
  }

  if (!activeHex) {
    activeHex = getDefaultColorForCategory(label);
  }

  const normalized = normalizeHexColor(activeHex);
  const textColor = getContrastTextColor(normalized, isDark);
  const bgColor = getTranslucentBg(normalized, isDark);
  const borderColor = getTranslucentBorder(normalized, isDark);

  return {
    label,
    color: normalized,
    style: {
      backgroundColor: bgColor,
      color: textColor,
      borderColor: borderColor,
    },
    dotStyle: {
      backgroundColor: normalized,
    },
    badgeStyle: {
      backgroundColor: bgColor,
      color: textColor,
      borderColor: borderColor,
    },
    textStyle: {
      color: textColor,
    },
    // Safe fallbacks for className strings
    bg: isDark ? "bg-stone-800/60" : "bg-stone-100/80",
    text: isDark ? "text-stone-200" : "text-stone-800",
    border: isDark ? "border-white/10" : "border-stone-200/80",
    dot: "bg-[var(--theme-primary)]",
    badge: isDark
      ? "bg-stone-800/80 text-stone-200 border-white/10"
      : "bg-stone-100/90 text-stone-800 border-stone-200/80",
  };
}

/**
 * Resolves styles for an individual item (event, task, etc.).
 * If an itemColorOverride is provided and non-empty, it overrides the category color.
 * Otherwise, falls back to the category's customized or default color.
 */
export function resolveItemStyle(
  category?: string | null,
  itemColorOverride?: string | null,
  isDark: boolean = false,
  customColorsMap?: Record<string, string> | null
): ResolvedCategoryStyle {
  const cat = category || "General";
  if (itemColorOverride && itemColorOverride.trim()) {
    const hex = normalizeHexColor(itemColorOverride);
    return getCategoryStyle(cat, isDark, { [cat]: hex });
  }
  return getCategoryStyle(cat, isDark, customColorsMap);
}

/**
 * Resolves active hex color for an individual item.
 */
export function resolveItemColor(
  category?: string | null,
  itemColorOverride?: string | null,
  customColorsMap?: Record<string, string> | null
): string {
  if (itemColorOverride && itemColorOverride.trim()) {
    return normalizeHexColor(itemColorOverride);
  }
  const cat = category || "General";
  if (customColorsMap && customColorsMap[cat]) {
    return normalizeHexColor(customColorsMap[cat]);
  }
  return getDefaultColorForCategory(cat);
}


