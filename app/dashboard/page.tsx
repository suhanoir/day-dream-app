"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview, StatsData } from "@/components/dashboard/StatsOverview";
import { FilterBar, StatusFilter } from "@/components/dashboard/FilterBar";
import { CategorySection } from "@/components/categories/CategorySection";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { BucketListItemCard, BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { BucketListItemDetailModal } from "@/components/bucket-list/BucketListItemDetailModal";
import { AddBucketListItemModal } from "@/components/bucket-list/AddBucketListItemModal";
import { EditBucketListItemModal } from "@/components/bucket-list/EditBucketListItemModal";
import { AddCategoryModal, CategoryData } from "@/components/categories/AddCategoryModal";
import { EditCategoryModal } from "@/components/categories/EditCategoryModal";
import { useToast } from "@/components/providers/ToastProvider";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [items, setItems] = useState<BucketListItemData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalGoals: 0,
    completedGoals: 0,
    remainingGoals: 0,
    completionRate: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal States
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<BucketListItemData | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [defaultCategoryForAdd, setDefaultCategoryForAdd] = useState<string | undefined>(undefined);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<BucketListItemData | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryData | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [catRes, itemsRes, statsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/bucket-list"),
        fetch("/api/stats"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData.items || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) {
          setStats({
            totalGoals: statsData.stats.totalGoals,
            completedGoals: statsData.stats.completedGoals,
            remainingGoals: statsData.stats.remainingGoals,
            completionRate: statsData.stats.completionRate,
          });
        }
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
      toastError("Failed to load your bucket list data.");
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Recalculate stats whenever items array changes
  const updateStatsFromItems = useCallback((currentItems: BucketListItemData[]) => {
    const total = currentItems.length;
    const completed = currentItems.filter((i) => i.completed).length;
    const remaining = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats({
      totalGoals: total,
      completedGoals: completed,
      remainingGoals: remaining,
      completionRate: rate,
    });
  }, []);

  // Handlers for Bucket List Item state
  const handleItemUpdated = (updated: BucketListItemData) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      updateStatsFromItems(next);
      return next;
    });

    // If modal is open for this item, keep it synced
    if (selectedItemForDetail?.id === updated.id) {
      setSelectedItemForDetail(updated);
    }
  };

  const handleItemDeleted = (itemId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      updateStatsFromItems(next);
      return next;
    });
    if (selectedItemForDetail?.id === itemId) {
      setSelectedItemForDetail(null);
    }
  };

  const handleItemAdded = (newItem: BucketListItemData) => {
    setItems((prev) => {
      const next = [newItem, ...prev];
      updateStatsFromItems(next);
      return next;
    });
  };

  // Handlers for Categories
  const handleCategoryAdded = (newCat: CategoryData) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleCategoryUpdated = (updatedCat: CategoryData) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCat.id ? { ...cat, ...updatedCat } : cat))
    );
  };

  const handleCategoryDeleted = (catId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== catId));
    setItems((prev) => {
      const next = prev.filter((item) => item.categoryId !== catId);
      updateStatsFromItems(next);
      return next;
    });
    if (selectedCategory === catId) {
      setSelectedCategory("all");
    }
  };

  const handleOpenAddItemForCategory = (catId: string) => {
    setDefaultCategoryForAdd(catId);
    setIsAddGoalOpen(true);
  };

  // Filter items based on search and status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }

      // Status filter
      if (status === "active" && item.completed) return false;
      if (status === "completed" && !item.completed) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesRefl = item.reflection?.toLowerCase().includes(query);
        const matchesCat = item.category?.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesRefl && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, status, search]);

  // Group filtered items by category
  const categoriesToDisplay = useMemo(() => {
    // If a specific category is selected in the filter dropdown
    if (selectedCategory !== "all") {
      return categories.filter((c) => c.id === selectedCategory);
    }
    return categories;
  }, [categories, selectedCategory]);

  const isFilterActive = search.trim().length > 0 || status !== "all" || selectedCategory !== "all";

  if (authLoading || (isLoading && items.length === 0 && categories.length === 0)) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-medium">
          Loading your bucket list...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col selection:bg-stone-900 selection:text-stone-50">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 sm:pb-24 flex-1">
        {/* Welcome motivational title banner */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-stone-950 font-serif-heading leading-tight">
            Make memories worth remembering.
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track your milestones, record your reflections, and live life with purpose.
          </p>
        </div>

        {/* Dashboard Statistics Overview */}
        <StatsOverview stats={stats} isLoading={isLoading} />

        {/* Search, Status Filter & Actions Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onOpenAddItem={() => {
            setDefaultCategoryForAdd(undefined);
            setIsAddGoalOpen(true);
          }}
          onOpenAddCategory={() => setIsAddCategoryOpen(true)}
        />

        {/* Dashboard Content */}
        {items.length === 0 && !isFilterActive ? (
          /* Entire Account Empty State */
          <DashboardEmptyState
            onOpenAddItem={() => {
              setDefaultCategoryForAdd(undefined);
              setIsAddGoalOpen(true);
            }}
          />
        ) : filteredItems.length === 0 && isFilterActive ? (
          /* Search or Filter No Match State */
          <DashboardEmptyState
            isSearchOrFilter={true}
            onOpenAddItem={() => {
              setDefaultCategoryForAdd(undefined);
              setIsAddGoalOpen(true);
            }}
            onClearFilter={() => {
              setSearch("");
              setStatus("all");
              setSelectedCategory("all");
            }}
          />
        ) : (
          /* Category-Based Organization Layout */
          <div className="space-y-6">
            {categoriesToDisplay.map((category) => {
              const categoryItems = filteredItems.filter(
                (item) => item.categoryId === category.id
              );

              // If searching or filtering and this category has no matching items, hide unless selected specifically
              if (isFilterActive && categoryItems.length === 0 && selectedCategory === "all") {
                return null;
              }

              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  onItemClick={(item) => setSelectedItemForDetail(item)}
                  onAddItemClick={handleOpenAddItemForCategory}
                  onEditCategoryClick={(cat) => setSelectedCategoryForEdit(cat)}
                  onCategoryDeleted={handleCategoryDeleted}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Add Goal Button on Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            setDefaultCategoryForAdd(undefined);
            setIsAddGoalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-[var(--theme-primary,#4F5FD7)] text-white shadow-xl flex items-center justify-center text-2xl font-light hover:bg-[var(--theme-primary-hover,#4351C2)] active:scale-95 transition-transform"
          aria-label="Add Bucket List Goal"
        >
          +
        </button>
      </div>

      {/* Modals */}
      {/* 1. Item Detail & Reflection Modal */}
      <BucketListItemDetailModal
        item={selectedItemForDetail}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={() => setSelectedItemForDetail(null)}
        onUpdate={handleItemUpdated}
        onDelete={handleItemDeleted}
        onEditClick={(item) => setSelectedItemForEdit(item)}
      />

      {/* 2. Add Item Modal */}
      <AddBucketListItemModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        categories={categories}
        defaultCategoryId={defaultCategoryForAdd}
        onItemAdded={handleItemAdded}
        onOpenAddCategory={() => setIsAddCategoryOpen(true)}
      />

      {/* 3. Edit Item Modal */}
      <EditBucketListItemModal
        item={selectedItemForEdit}
        isOpen={Boolean(selectedItemForEdit)}
        onClose={() => setSelectedItemForEdit(null)}
        categories={categories}
        onItemUpdated={handleItemUpdated}
      />

      {/* 4. Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      {/* 5. Edit Category Modal */}
      <EditCategoryModal
        category={selectedCategoryForEdit}
        isOpen={Boolean(selectedCategoryForEdit)}
        onClose={() => setSelectedCategoryForEdit(null)}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </div>
  );
}

