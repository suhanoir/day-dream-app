"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type ThemeId = "indigo" | "slate" | "aurora" | "forest" | "ocean" | "crimson";

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
];

const VALID_THEME_IDS: ThemeId[] = [
  "indigo",
  "slate",
  "aurora",
  "forest",
  "ocean",
  "crimson",
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
