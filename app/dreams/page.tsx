"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import {
  BucketListItemCard,
  BucketListItemData,
  getDreamStatus,
  DreamStatus,
} from "@/components/bucket-list/BucketListItemCard";
import { BucketListItemDetailModal } from "@/components/bucket-list/BucketListItemDetailModal";
import { AddBucketListItemModal } from "@/components/bucket-list/AddBucketListItemModal";
import { EditBucketListItemModal } from "@/components/bucket-list/EditBucketListItemModal";
import { AddCategoryModal, CategoryData } from "@/components/categories/AddCategoryModal";
import { EditCategoryModal } from "@/components/categories/EditCategoryModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Loader2,
  Plus,
  Sparkles,
  Calendar as CalendarIcon,
  Search,
  X,
  Target,
  Compass,
  ArrowRight,
  TrendingUp,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StatusJourneyFilter = "all" | "dreaming" | "planning" | "in-progress" | "completed";

export default function DreamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [items, setItems] = useState<BucketListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusJourneyFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals
  const [selectedItemForDetail, setSelectedItemForDetail] =
    useState<BucketListItemData | null>(null);
  const [isAddDreamOpen, setIsAddDreamOpen] = useState(false);
  const [defaultCategoryForAdd, setDefaultCategoryForAdd] = useState<string | undefined>(undefined);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<BucketListItemData | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryData | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [catRes, itemsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/bucket-list"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData.items || []);
      }
    } catch (err) {
      console.error("Fetch dreams error:", err);
      toastError("Failed to load your dreams.");
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Handlers for Dream items
  const handleItemUpdated = (updated: BucketListItemData) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedItemForDetail?.id === updated.id) {
      setSelectedItemForDetail(updated);
    }
  };

  const handleItemDeleted = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    if (selectedItemForDetail?.id === itemId) {
      setSelectedItemForDetail(null);
    }
  };

  const handleItemAdded = (newItem: BucketListItemData) => {
    setItems((prev) => [newItem, ...prev]);
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
    setItems((prev) => prev.filter((item) => item.categoryId !== catId));
    if (selectedCategory === catId) {
      setSelectedCategory("all");
    }
  };

  // Filter items based on search, category, and journey status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }

      // Journey Status filter
      const itemStatus = getDreamStatus(item);
      if (statusFilter === "dreaming" && itemStatus !== "Dreaming") return false;
      if (statusFilter === "planning" && itemStatus !== "Planning") return false;
      if (statusFilter === "in-progress" && itemStatus !== "In Progress") return false;
      if (statusFilter === "completed" && itemStatus !== "Completed") return false;

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
  }, [items, selectedCategory, statusFilter, search]);

  // Statistics calculation
  const totalDreams = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const inProgressCount = items.filter((i) => getDreamStatus(i) === "In Progress").length;
  const planningCount = items.filter((i) => getDreamStatus(i) === "Planning").length;
  const dreamingCount = items.filter((i) => getDreamStatus(i) === "Dreaming").length;
  const completionRate = totalDreams > 0 ? Math.round((completedCount / totalDreams) * 100) : 0;

  // Find nearest upcoming milestone
  const upcomingDream = useMemo(() => {
    const uncompletedWithTarget = items.filter((i) => !i.completed && i.targetDate);
    if (uncompletedWithTarget.length === 0) return null;
    return uncompletedWithTarget.sort(
      (a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime()
    )[0];
  }, [items]);

  // Desktop side panel
  const sidePanelContent = (
    <div className="space-y-5">
      {/* Journey Stats Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-white/10 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-muted" />
            Journey Snapshot
          </span>
          <span className="text-xs font-bold text-primary">{completionRate}% lived</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10">
            <span className="text-[10.5px] text-muted block">In Progress</span>
            <span className="text-lg font-bold text-primary">{inProgressCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10">
            <span className="text-[10.5px] text-muted block">Planning</span>
            <span className="text-lg font-bold text-primary">{planningCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10">
            <span className="text-[10.5px] text-muted block">Dreaming</span>
            <span className="text-lg font-bold text-primary">{dreamingCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10">
            <span className="text-[10.5px] text-muted block">Completed</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Milestone */}
      {upcomingDream && (
        <div className="glass-card rounded-2xl p-5 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-muted" />
            Next Milestone
          </span>
          <div
            onClick={() => setSelectedItemForDetail(upcomingDream)}
            className="p-3 rounded-xl glass-card-interactive cursor-pointer select-none space-y-1"
          >
            <p className="text-xs font-bold text-primary truncate">{upcomingDream.title}</p>
            <p className="text-[11px] text-muted">
              Target:{" "}
              {new Date(upcomingDream.targetDate!).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Planning Link */}
      <div className="glass-card rounded-2xl p-5 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-muted" />
          Calendar Planning
        </span>
        <p className="text-xs text-muted leading-relaxed">
          Schedule target milestone dates and view timeline commitments.
        </p>
        <div className="pt-1">
          <Link
            href="/calendar"
            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
          >
            <span>Open Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  if (authLoading || (isLoading && items.length === 0 && categories.length === 0)) {
    return (
      <AppShell title="My Dreams">
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-muted animate-spin mb-3" />
          <p className="text-xs text-muted font-medium">Gathering your dreams...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="My Dreams" sidePanel={sidePanelContent}>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary font-serif-heading leading-tight">
                My Dreams
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/10 text-secondary border border-stone-200/70 dark:border-white/10">
                {totalDreams} {totalDreams === 1 ? "Dream" : "Dreams"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-secondary">
              The experiences, places, goals and moments you want to make real.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
            <Link href="/memories">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="font-semibold gap-1.5 border-amber-500/30 hover:border-amber-500/50 text-amber-900 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Memories</span>
              </Button>
            </Link>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                setDefaultCategoryForAdd(undefined);
                setIsAddDreamOpen(true);
              }}
              className="font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dream</span>
            </Button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="space-y-3">
          {/* Search bar + Status filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your dreams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 glass-input rounded-xl text-xs sm:text-sm placeholder:text-stone-400 text-primary focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Journey Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "dreaming", label: "Dreaming" },
                  { key: "planning", label: "Planning" },
                  { key: "in-progress", label: "In Progress" },
                  { key: "completed", label: "Completed" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer",
                    statusFilter === tab.key
                      ? "glass-tab-active font-semibold shadow-2xs"
                      : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                selectedCategory === "all"
                  ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-2xs"
                  : "text-secondary hover:text-primary bg-stone-100/80 dark:bg-white/10"
              )}
            >
              All Categories ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                    selectedCategory === cat.id
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 font-semibold shadow-2xs"
                      : "text-secondary hover:text-primary bg-stone-100/80 dark:bg-white/10"
                  )}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              className="px-2 py-1 rounded-lg text-xs text-muted hover:text-primary bg-stone-100/50 dark:bg-white/5 hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 shrink-0 cursor-pointer"
              title="Add Category"
            >
              <FolderPlus className="w-3 h-3" />
              <span>New Category</span>
            </button>
          </div>
        </div>

        {/* Dream List / Empty State */}
        {items.length === 0 ? (
          /* Global Empty State */
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100/80 dark:bg-white/10 text-stone-500 flex items-center justify-center mx-auto border border-stone-200/50 dark:border-white/10 shadow-2xs">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-primary font-serif-heading">
              Your next dream starts here.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Add something you have always wanted to experience, achieve, or see in this lifetime.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddDreamOpen(true)}
                className="font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Your First Dream</span>
              </Button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Filter Empty State */
          <div className="py-16 text-center space-y-2">
            <p className="text-sm text-muted">
              No dreams match your current filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Dream Cards Grid / Stack */
          <div className="space-y-2.5">
            {filteredItems.map((dream) => (
              <BucketListItemCard
                key={dream.id}
                item={dream}
                onClick={(clicked) => setSelectedItemForDetail(clicked)}
                showCategoryBadge={selectedCategory === "all"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dream Container Modal */}
      <BucketListItemDetailModal
        item={selectedItemForDetail}
        isOpen={!!selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onUpdate={handleItemUpdated}
        onDelete={handleItemDeleted}
        onEditClick={(itemToEdit) => setSelectedItemForEdit(itemToEdit)}
      />

      {/* Add Dream Modal */}
      <AddBucketListItemModal
        isOpen={isAddDreamOpen}
        onClose={() => setIsAddDreamOpen(false)}
        onItemAdded={handleItemAdded}
        categories={categories}
        defaultCategoryId={defaultCategoryForAdd}
      />

      {/* Edit Dream Modal */}
      <EditBucketListItemModal
        isOpen={!!selectedItemForEdit}
        onClose={() => setSelectedItemForEdit(null)}
        item={selectedItemForEdit}
        categories={categories}
        onItemUpdated={handleItemUpdated}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={!!selectedCategoryForEdit}
        onClose={() => setSelectedCategoryForEdit(null)}
        category={selectedCategoryForEdit}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </AppShell>
  );
}
