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

export interface ThemeMeta {
  id: ThemeId;
  name: string;
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
  {
    id: "indigo",
    name: "DayDream Indigo",
    description: "Professional and calm",
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
    id: "slate",
    name: "Slate Blue",
    description: "Clean and sophisticated",
    palette: {
      background: "#F5F7FA",
      surface: "#FFFFFF",
      primary: "#456B8C",
      primarySoft: "#EAF1F6",
      secondary: "#708AA0",
      accent: "#708AA0",
      text: "#202A33",
      mutedText: "#727C85",
      border: "#DDE3E8",
      success: "#3C9B78",
      warning: "#C99527",
      danger: "#D4635A",
    },
    previewSwatches: ["#F5F7FA", "#456B8C", "#708AA0", "#3C9B78"],
  },
  {
    id: "aurora",
    name: "Dreamy Aurora",
    description: "Creative and expressive",
    palette: {
      background: "#F8F7FC",
      surface: "#FFFFFF",
      primary: "#7567D9",
      primarySoft: "#F0EDFF",
      secondary: "#5FA7B5",
      accent: "#E7A85C",
      text: "#29283A",
      mutedText: "#77758A",
      border: "#E5E2EF",
      success: "#54A982",
      warning: "#D99A45",
      danger: "#D86670",
    },
    previewSwatches: ["#F8F7FC", "#7567D9", "#5FA7B5", "#E7A85C"],
  },
  {
    id: "forest",
    name: "Forest Noir",
    description: "Elegant green workspace",
    palette: {
      background: "#F6F7F4",
      surface: "#FFFFFF",
      primary: "#2F6B57",
      primarySoft: "#E7F1EC",
      secondary: "#557A6B",
      accent: "#A3B18A",
      text: "#1E2A24",
      mutedText: "#6F7C75",
      border: "#DDE5DF",
      success: "#3FA76F",
      warning: "#C89B3C",
      danger: "#C85C5C",
    },
    previewSwatches: ["#F6F7F4", "#2F6B57", "#557A6B", "#A3B18A"],
  },
  {
    id: "ocean",
    name: "Ocean Mist",
    description: "Refreshing modern blue",
    palette: {
      background: "#F4F8FA",
      surface: "#FFFFFF",
      primary: "#2F7F95",
      primarySoft: "#E5F3F7",
      secondary: "#5FA8B8",
      accent: "#8CCAD8",
      text: "#1F2D33",
      mutedText: "#708087",
      border: "#D9E5E8",
      success: "#4DAA88",
      warning: "#D6A84A",
      danger: "#CF6B6B",
    },
    previewSwatches: ["#F4F8FA", "#2F7F95", "#5FA8B8", "#8CCAD8"],
  },
  {
    id: "crimson",
    name: "Crimson Red",
    description: "Bold luxury productivity",
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
    description: "Vibrant ocean cyan & teal",
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
    description: "Regal violet & electric indigo",
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
    description: "Warm sunset coral & burnt amber",
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
    description: "Luminous jewel emerald & jade",
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
  {
    id: "ruby",
    name: "Imperial Ruby",
    description: "Gemstone ruby & rich wine",
    palette: {
      background: "#FFF5F6",
      surface: "#FFFFFF",
      primary: "#BE123C",
      primarySoft: "#FFF1F2",
      secondary: "#E11D48",
      accent: "#881337",
      text: "#4C0519",
      mutedText: "#706568",
      border: "#FFE4E6",
      success: "#10B981",
      warning: "#D97706",
      danger: "#9F1239",
    },
    previewSwatches: ["#FFF5F6", "#BE123C", "#E11D48", "#881337"],
  },
  {
    id: "midnight-citrus",
    name: "Midnight Citrus",
    description: "Midnight luxury & vibrant golden citrus",
    palette: {
      background: "#12151D",
      surface: "#1D2330",
      primary: "#F59E0B",
      primarySoft: "#282218",
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
  "slate",
  "aurora",
  "forest",
  "ocean",
  "crimson",
  "deep-aqua",
  "royal-indigo",
  "sunset-coral",
  "emerald",
  "ruby",
  "midnight-citrus",
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeMeta[];
  currentThemeMeta: ThemeMeta;
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
      if (stored && VALID_THEME_IDS.includes(stored)) {
        setThemeState(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        document.documentElement.setAttribute("data-theme", "indigo");
      }
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
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const currentThemeMeta = useMemo(() => {
    return THEMES.find((t) => t.id === theme) || THEMES[0];
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
      currentThemeMeta,
    }),
    [theme, currentThemeMeta]
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
