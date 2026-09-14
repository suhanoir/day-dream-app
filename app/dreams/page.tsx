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
  ArrowDownUp,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StatusJourneyFilter = "all" | "active" | "planning" | "in-progress" | "completed";
export type DreamSortOption = "recent" | "target" | "progress";

export default function DreamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [items, setItems] = useState<BucketListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusJourneyFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState<DreamSortOption>("recent");

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

  // Deep-link auto-open from query param (e.g. /dreams?id=...)
  useEffect(() => {
    if (typeof window !== "undefined" && items.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const dreamId = params.get("id");
      if (dreamId) {
        const target = items.find((i) => i.id === dreamId);
        if (target) {
          setSelectedItemForDetail(target);
        }
      }
    }
  }, [items]);

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

  // Filter items based on search, category, and status
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }

      // Journey Status filter
      const itemStatus = getDreamStatus(item);
      if (statusFilter === "active" && item.completed) return false;
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

    // Sort items
    return filtered.sort((a, b) => {
      if (sortOption === "target") {
        if (!a.targetDate && !b.targetDate) return 0;
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      if (sortOption === "progress") {
        const aTotal = a.todos?.length || 0;
        const aComp = a.todos?.filter((t) => t.completed).length || 0;
        const aRatio = aTotal > 0 ? aComp / aTotal : 0;

        const bTotal = b.todos?.length || 0;
        const bComp = b.todos?.filter((t) => t.completed).length || 0;
        const bRatio = bTotal > 0 ? bComp / bTotal : 0;

        return bRatio - aRatio;
      }
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, selectedCategory, statusFilter, search, sortOption]);

  // Statistics calculation
  const totalDreams = items.length;
  const activeCount = items.filter((i) => !i.completed).length;
  const completedCount = items.filter((i) => i.completed).length;
  const inProgressCount = items.filter((i) => getDreamStatus(i) === "In Progress").length;
  const planningCount = items.filter((i) => getDreamStatus(i) === "Planning").length;
  const dreamingCount = items.filter((i) => getDreamStatus(i) === "Dreaming").length;
  const completionRate = totalDreams > 0 ? Math.round((completedCount / totalDreams) * 100) : 0;

  // Contextual Suggestion (Section 4.12)
  const contextualSuggestion = useMemo(() => {
    const activeDreams = items.filter((i) => !i.completed);
    if (activeDreams.length === 0) return null;

    // Check if any dream has only 1 task remaining to complete
    const almostDone = activeDreams.find((d) => {
      const total = d.todos?.length || 0;
      const completed = d.todos?.filter((t) => t.completed).length || 0;
      return total > 1 && total - completed === 1;
    });
    if (almostDone) {
      return {
        message: `"${almostDone.title}" is just 1 action step away from completion!`,
        action: () => setSelectedItemForDetail(almostDone),
        cta: "View Dream",
      };
    }

    // Check if any in-progress dream has no next action
    const noActionDream = activeDreams.find((d) => !d.todos || d.todos.length === 0);
    if (noActionDream) {
      return {
        message: `"${noActionDream.title}" has no action scheduled yet.`,
        action: () => setSelectedItemForDetail(noActionDream),
        cta: "Add First Action",
      };
    }

    return null;
  }, [items]);

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
                variant="outline"
                size="md"
                className="font-semibold gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Memories</span>
              </Button>
            </Link>

            <Button
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

        {/* Contextual Suggestion Banner (Section 4.12) */}
        {contextualSuggestion && (
          <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-amber-950 dark:text-amber-200 font-medium truncate">
                {contextualSuggestion.message}
              </span>
            </div>
            {contextualSuggestion.action && contextualSuggestion.cta && (
              <button
                type="button"
                onClick={contextualSuggestion.action}
                className="font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0 cursor-pointer"
              >
                {contextualSuggestion.cta} →
              </button>
            )}
          </div>
        )}

        {/* Search, Status Tabs & Sorting Row */}
        <div className="space-y-3">
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

            {/* Journey Status Filter Tabs + Sort Dropdown */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
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

              {/* Lightweight Sort Selector (Section 4.10) */}
              <div className="border-l border-stone-200/60 dark:border-white/10 pl-2 shrink-0">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as DreamSortOption)}
                  className="glass-input text-xs font-medium rounded-xl px-2.5 py-1.5 text-secondary cursor-pointer focus:outline-none"
                  aria-label="Sort dreams by"
                >
                  <option value="recent">Recently Added</option>
                  <option value="target">Target Date</option>
                  <option value="progress">Progress</option>
                </select>
              </div>
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

        {/* Dream List / Empty States (Section 4.11) */}
        {items.length === 0 ? (
          /* Global Empty State */
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-stone-100/80 dark:bg-white/10 text-stone-500 flex items-center justify-center mx-auto border border-stone-200/50 dark:border-white/10 shadow-2xs">
              <Compass className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-primary font-serif-heading">
              Your next adventure starts here.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Every journey begins with a single aspiration. Write down what you want to experience, achieve, or see.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddDreamOpen(true)}
                className="font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Dream</span>
              </Button>
            </div>
          </div>
        ) : activeCount === 0 && statusFilter === "active" ? (
          /* All Active Completed Empty State */
          <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-primary font-serif-heading">
              You&apos;ve lived some beautiful ones.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              All of your current dreams are accomplished. What comes next on your horizon?
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddDreamOpen(true)}
                className="font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create a Dream</span>
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
          /* Dream Cards Stack */
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <BucketListItemCard
                key={item.id}
                item={item}
                onClick={(clicked) => setSelectedItemForDetail(clicked)}
                showCategoryBadge={selectedCategory === "all"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dream Detail Modal */}
      <BucketListItemDetailModal
        item={selectedItemForDetail}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={() => setSelectedItemForDetail(null)}
        onUpdate={handleItemUpdated}
        onDelete={handleItemDeleted}
        onEditClick={(itemToEdit) => setSelectedItemForEdit(itemToEdit)}
      />

      {/* Add Dream Modal */}
      <AddBucketListItemModal
        isOpen={isAddDreamOpen}
        onClose={() => setIsAddDreamOpen(false)}
        categories={categories}
        defaultCategoryId={defaultCategoryForAdd}
        onItemAdded={handleItemAdded}
      />

      {/* Edit Dream Modal */}
      <EditBucketListItemModal
        isOpen={Boolean(selectedItemForEdit)}
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
