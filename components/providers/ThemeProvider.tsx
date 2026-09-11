"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type ThemeId =
  | "indigo"
  | "slate"
  | "aurora"
  | "forest"
  | "ocean"
  | "crimson"
  | "deep-aqua"
  | "royal-indigo"
  | "sunset-coral"
  | "emerald"
  | "ruby"
  | "midnight-citrus";

export type ThemeMode = "light" | "dark";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  description: string;
  palette: {
    background: string;
    surface: string;
    primary: string;
    primarySoft: string;
    secondary: string;
    accent?: string;
    text: string;
    mutedText: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  previewSwatches: [string, string, string, string];
}

export const THEMES: ThemeMeta[] = [
  // ==========================================
  // ☀️ LIGHT THEMES (6)
  // ==========================================
  {
    id: "indigo",
    name: "DayDream Indigo",
    mode: "light",
    description: "Calm, focused, and timeless",
    palette: {
      background: "#FAFAF8",
      surface: "#FFFFFF",
      primary: "#4F5FD7",
      primarySoft: "#EEF0FF",
      secondary: "#7C6FE8",
      accent: "#7C6FE8",
      text: "#20242C",
      mutedText: "#737780",
      border: "#E7E7E5",
      success: "#35A879",
      warning: "#D89A18",
      danger: "#D9655A",
    },
    previewSwatches: ["#FAFAF8", "#4F5FD7", "#7C6FE8", "#35A879"],
  },
  {
    id: "crimson",
    name: "Crimson Red",
    mode: "light",
    description: "Bold, energetic, and expressive",
    palette: {
      background: "#FAF7F7",
      surface: "#FFFFFF",
      primary: "#B23A48",
      primarySoft: "#F8E8EB",
      secondary: "#8E2F3A",
      accent: "#D77A86",
      text: "#2A2022",
      mutedText: "#7C6B6F",
      border: "#E8DCDD",
      success: "#4C9A74",
      warning: "#D6A23A",
      danger: "#C0394B",
    },
    previewSwatches: ["#FAF7F7", "#B23A48", "#8E2F3A", "#D77A86"],
  },
  {
    id: "deep-aqua",
    name: "Deep Aqua",
    mode: "light",
    description: "Crisp, refreshing, and modern",
    palette: {
      background: "#F0F9FF",
      surface: "#FFFFFF",
      primary: "#0E7490",
      primarySoft: "#ECFEFF",
      secondary: "#06B6D4",
      accent: "#14B8A6",
      text: "#164E63",
      mutedText: "#64748B",
      border: "#CFFAFE",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
    previewSwatches: ["#F0F9FF", "#0E7490", "#06B6D4", "#14B8A6"],
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    mode: "light",
    description: "Regal, creative, and deep",
    palette: {
      background: "#F8F7FF",
      surface: "#FFFFFF",
      primary: "#4338CA",
      primarySoft: "#EEF2FF",
      secondary: "#6366F1",
      accent: "#8B5CF6",
      text: "#1E1B4B",
      mutedText: "#6B7280",
      border: "#E0E7FF",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
    previewSwatches: ["#F8F7FF", "#4338CA", "#6366F1", "#8B5CF6"],
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral",
    mode: "light",
    description: "Warm, inviting, and radiant",
    palette: {
      background: "#FFFBF7",
      surface: "#FFFFFF",
      primary: "#C2410C",
      primarySoft: "#FFF7ED",
      secondary: "#EA580C",
      accent: "#F43F5E",
      text: "#431407",
      mutedText: "#78716C",
      border: "#FFEDD5",
      success: "#10B981",
      warning: "#D97706",
      danger: "#E11D48",
    },
    previewSwatches: ["#FFFBF7", "#C2410C", "#EA580C", "#F43F5E"],
  },
  {
    id: "emerald",
    name: "Vibrant Emerald",
    mode: "light",
    description: "Lush, balanced, and rejuvenating",
    palette: {
      background: "#F2FBF7",
      surface: "#FFFFFF",
      primary: "#047857",
      primarySoft: "#ECFDF5",
      secondary: "#10B981",
      accent: "#0D9488",
      text: "#064E3B",
      mutedText: "#64748B",
      border: "#D1FAE5",
      success: "#059669",
      warning: "#D97706",
      danger: "#E11D48",
    },
    previewSwatches: ["#F2FBF7", "#047857", "#10B981", "#0D9488"],
  },

  // ==========================================
  // 🌙 DARK THEMES (6)
  // ==========================================
  {
    id: "slate",
    name: "Slate Blue",
    mode: "dark",
    description: "Minimal, cool, and architectural",
    palette: {
      background: "#0D1117",
      surface: "#161B22",
      primary: "#38BDF8",
      primarySoft: "rgba(56, 189, 248, 0.15)",
      secondary: "#5B8FB9",
      accent: "#7DD3FC",
      text: "#F8FAFC",
      mutedText: "#8B9BAE",
      border: "#232D3B",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#F43F5E",
    },
    previewSwatches: ["#0D1117", "#38BDF8", "#5B8FB9", "#7DD3FC"],
  },
  {
    id: "aurora",
    name: "Dreamy Aurora",
    mode: "dark",
    description: "Celestial, creative, and immersive",
    palette: {
      background: "#0F0D1A",
      surface: "#181528",
      primary: "#A78BFA",
      primarySoft: "rgba(167, 139, 250, 0.16)",
      secondary: "#38BDF8",
      accent: "#F472B6",
      text: "#FAF8FF",
      mutedText: "#998FB8",
      border: "#282341",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#FB7185",
    },
    previewSwatches: ["#0F0D1A", "#A78BFA", "#38BDF8", "#F472B6"],
  },
  {
    id: "forest",
    name: "Forest Noir",
    mode: "dark",
    description: "Nocturnal, organic, and grounded",
    palette: {
      background: "#0B130E",
      surface: "#121E17",
      primary: "#34D399",
      primarySoft: "rgba(52, 211, 153, 0.15)",
      secondary: "#10B981",
      accent: "#6EE7B7",
      text: "#F4FAF6",
      mutedText: "#83A092",
      border: "#1F3129",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#F43F5E",
    },
    previewSwatches: ["#0B130E", "#34D399", "#10B981", "#6EE7B7"],
  },
  {
    id: "ocean",
    name: "Ocean Mist",
    mode: "dark",
    description: "Abyssal, serene, and crystal clear",
    palette: {
      background: "#08121A",
      surface: "#0E1B26",
      primary: "#38BDF8",
      primarySoft: "rgba(56, 189, 248, 0.15)",
      secondary: "#06B6D4",
      accent: "#22D3EE",
      text: "#F4F9FD",
      mutedText: "#7798B5",
      border: "#1A2C3C",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#F43F5E",
    },
    previewSwatches: ["#08121A", "#38BDF8", "#06B6D4", "#22D3EE"],
  },
  {
    id: "ruby",
    name: "Imperial Ruby",
    mode: "dark",
    description: "Prestige, velvet, and gemstone wine",
    palette: {
      background: "#160A0E",
      surface: "#221017",
      primary: "#FB7185",
      primarySoft: "rgba(251, 113, 133, 0.15)",
      secondary: "#F43F5E",
      accent: "#FDA4AF",
      text: "#FAF3F5",
      mutedText: "#A16F82",
      border: "#331B25",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#E11D48",
    },
    previewSwatches: ["#160A0E", "#FB7185", "#F43F5E", "#FDA4AF"],
  },
  {
    id: "midnight-citrus",
    name: "Midnight Citrus",
    mode: "dark",
    description: "Midnight luxury & radiant citrus",
    palette: {
      background: "#12151D",
      surface: "#1D2330",
      primary: "#F59E0B",
      primarySoft: "rgba(245, 158, 11, 0.15)",
      secondary: "#FB923C",
      accent: "#FBBF24",
      text: "#F8FAFC",
      mutedText: "#8E9CAE",
      border: "#252C3A",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#F43F5E",
    },
    previewSwatches: ["#12151D", "#F59E0B", "#FB923C", "#FBBF24"],
  },
];

const VALID_THEME_IDS: ThemeId[] = [
  "indigo",
  "crimson",
  "deep-aqua",
  "royal-indigo",
  "sunset-coral",
  "emerald",
  "slate",
  "aurora",
  "forest",
  "ocean",
  "ruby",
  "midnight-citrus",
];

export const DARK_THEME_IDS: ThemeId[] = [
  "slate",
  "aurora",
  "forest",
  "ocean",
  "ruby",
  "midnight-citrus",
];

export function isDarkTheme(themeId: ThemeId): boolean {
  return DARK_THEME_IDS.includes(themeId);
}

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeMeta[];
  currentThemeMeta: ThemeMeta;
  isDark: boolean;
}

const THEME_STORAGE_KEY = "daydream_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("indigo");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or document
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      const activeId: ThemeId =
        stored && VALID_THEME_IDS.includes(stored) ? stored : "indigo";
      setThemeState(activeId);
      const meta = THEMES.find((t) => t.id === activeId) || THEMES[0];
      document.documentElement.setAttribute("data-theme", activeId);
      document.documentElement.setAttribute("data-theme-mode", meta.mode);
    } catch {
      // localStorage may be unavailable in private browsing
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
    const meta = THEMES.find((t) => t.id === newTheme) || THEMES[0];
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.setAttribute("data-theme-mode", meta.mode);
  };

  const currentThemeMeta = useMemo(() => {
    return THEMES.find((t) => t.id === theme) || THEMES[0];
  }, [theme]);

  const isDark = useMemo(() => {
    return currentThemeMeta.mode === "dark";
  }, [currentThemeMeta]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
      currentThemeMeta,
      isDark,
    }),
    [theme, currentThemeMeta, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
