"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import {
  DEFAULT_CATEGORY_COLORS,
  CORE_TODO_CATEGORIES,
  ResolvedCategoryStyle,
  getCategoryStyle as resolveCategoryStyle,
  resolveItemStyle,
  resolveItemColor,
  getDefaultColorForCategory,
  normalizeHexColor,
} from "@/lib/utils/categoryColors";

interface CategoryColorContextType {
  colors: Record<string, string>;
  isLoading: boolean;
  getCategoryStyle: (
    categoryName: string,
    customColorOverride?: string | null
  ) => ResolvedCategoryStyle;
  getItemStyle: (
    category?: string | null,
    itemColorOverride?: string | null
  ) => ResolvedCategoryStyle;
  getCategoryColor: (categoryName: string) => string;
  getItemColor: (
    category?: string | null,
    itemColorOverride?: string | null
  ) => string;
  setCategoryColor: (categoryName: string, color: string) => Promise<boolean>;
  resetCategoryColor: (categoryName: string) => Promise<boolean>;
  refreshColors: () => Promise<void>;
  allCategories: string[];
}

const STORAGE_KEY = "daydream_category_colors";

const CategoryColorContext = createContext<CategoryColorContextType | undefined>(
  undefined
);

export function CategoryColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [colors, setColors] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_CATEGORY_COLORS, ...JSON.parse(stored) };
        }
      } catch {
        // Ignore JSON error
      }
    }
    return { ...DEFAULT_CATEGORY_COLORS };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch category colors from API when user logs in
  const refreshColors = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories/colors");
      if (res.ok) {
        const data = await res.json();
        if (data.colors) {
          setColors((prev) => {
            const merged = { ...prev, ...data.colors };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {
              // Ignore localStorage quota
            }
            return merged;
          });
        }
      }
    } catch (err) {
      console.error("Failed to load category colors:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshColors();
    }
  }, [user, refreshColors]);

  // Set category color (optimistic + server sync)
  const setCategoryColor = useCallback(
    async (categoryName: string, newColor: string): Promise<boolean> => {
      const normalized = normalizeHexColor(newColor);

      // Optimistic update
      setColors((prev) => {
        const updated = { ...prev, [categoryName]: normalized };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });

      if (!user) return true;

      try {
        const res = await fetch("/api/categories/colors", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryName, color: normalized }),
        });
        if (!res.ok) {
          console.error("Failed to save category color to server");
          return false;
        }
        return true;
      } catch (err) {
        console.error("Network error saving category color:", err);
        return false;
      }
    },
    [user]
  );

  // Reset category color to its default
  const resetCategoryColor = useCallback(
    async (categoryName: string): Promise<boolean> => {
      const defaultColor = getDefaultColorForCategory(categoryName);

      // Optimistic reset
      setColors((prev) => {
        const updated = { ...prev, [categoryName]: defaultColor };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });

      if (!user) return true;

      try {
        const res = await fetch("/api/categories/colors", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryName, reset: true }),
        });
        if (!res.ok) {
          console.error("Failed to reset category color on server");
          return false;
        }
        return true;
      } catch (err) {
        console.error("Network error resetting category color:", err);
        return false;
      }
    },
    [user]
  );

  // Get active color for a category
  const getCategoryColor = useCallback(
    (categoryName: string): string => {
      if (colors[categoryName]) {
        return colors[categoryName];
      }
      return getDefaultColorForCategory(categoryName);
    },
    [colors]
  );

  // Get style object for a category
  const getCategoryStyle = useCallback(
    (
      categoryName: string,
      customColorOverride?: string | null
    ): ResolvedCategoryStyle => {
      if (customColorOverride) {
        return resolveCategoryStyle(categoryName, isDark, {
          [categoryName]: customColorOverride,
        });
      }
      return resolveCategoryStyle(categoryName, isDark, colors);
    },
    [isDark, colors]
  );

  // Get style object for an individual item (with optional color override)
  const getItemStyle = useCallback(
    (
      category?: string | null,
      itemColorOverride?: string | null
    ): ResolvedCategoryStyle => {
      return resolveItemStyle(category, itemColorOverride, isDark, colors);
    },
    [isDark, colors]
  );

  // Get active hex color for an individual item
  const getItemColor = useCallback(
    (
      category?: string | null,
      itemColorOverride?: string | null
    ): string => {
      return resolveItemColor(category, itemColorOverride, colors);
    },
    [colors]
  );

  // Ordered list of all categories
  const allCategories = useMemo(() => {
    const list: string[] = [...CORE_TODO_CATEGORIES];
    for (const key of Object.keys(colors)) {
      if (!list.includes(key)) {
        list.push(key);
      }
    }
    return list;
  }, [colors]);

  const value = useMemo(
    () => ({
      colors,
      isLoading,
      getCategoryStyle,
      getItemStyle,
      getCategoryColor,
      getItemColor,
      setCategoryColor,
      resetCategoryColor,
      refreshColors,
      allCategories,
    }),
    [
      colors,
      isLoading,
      getCategoryStyle,
      getItemStyle,
      getCategoryColor,
      getItemColor,
      setCategoryColor,
      resetCategoryColor,
      refreshColors,
      allCategories,
    ]
  );

  return (
    <CategoryColorContext.Provider value={value}>
      {children}
    </CategoryColorContext.Provider>
  );
}

// Custom hook with safe fallback if used outside provider
export function useCategoryColors(): CategoryColorContextType {
  const context = useContext(CategoryColorContext);
  if (!context) {
    // Safe fallback if rendered without provider
    return {
      colors: DEFAULT_CATEGORY_COLORS,
      isLoading: false,
      getCategoryStyle: (categoryName: string) =>
        resolveCategoryStyle(categoryName, false, DEFAULT_CATEGORY_COLORS),
      getItemStyle: (category?: string | null, itemColorOverride?: string | null) =>
        resolveItemStyle(category, itemColorOverride, false, DEFAULT_CATEGORY_COLORS),
      getCategoryColor: (categoryName: string) =>
        getDefaultColorForCategory(categoryName),
      getItemColor: (category?: string | null, itemColorOverride?: string | null) =>
        resolveItemColor(category, itemColorOverride, DEFAULT_CATEGORY_COLORS),
      setCategoryColor: async () => false,
      resetCategoryColor: async () => false,
      refreshColors: async () => {},
      allCategories: [...CORE_TODO_CATEGORIES],
    };
  }
  return context;
}

