"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { CategoryData } from "@/components/categories/AddCategoryModal";
import { ScrapbookCard } from "@/components/memory/ScrapbookCard";
import { MemoryDetailModal } from "@/components/memory/MemoryDetailModal";
import { PostcardEditorModal } from "@/components/memory/PostcardEditorModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Sparkles,
  Search,
  X,
  Compass,
  ArrowRight,
  Loader2,
  BookOpen,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function MemoriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { error: toastError } = useToast();

  const [items, setItems] = useState<BucketListItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal states
  const [selectedItemForDetail, setSelectedItemForDetail] =
    useState<BucketListItemData | null>(null);
  const [selectedItemForEditor, setSelectedItemForEditor] =
    useState<BucketListItemData | null>(null);

  // Fetch completed items and categories
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        fetch("/api/bucket-list?status=completed"),
        fetch("/api/categories"),
      ]);

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData.items || []);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error("Fetch memories error:", err);
      toastError("Failed to load your memory scrapbook.");
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Update item in local list after editing postcard
  const handleItemUpdated = (updated: BucketListItemData) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    if (selectedItemForDetail?.id === updated.id) {
      setSelectedItemForDetail(updated);
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inRefl = item.reflection?.toLowerCase().includes(q);
        const inCat = item.category?.name.toLowerCase().includes(q);
        if (!inTitle && !inRefl && !inCat) return false;
      }
      return true;
    });
  }, [items, selectedCategory, search]);

  const photosCount = useMemo(() => {
    return items.filter((i) => {
      if (i.memoryPhoto) return true;
      if (i.memoryPhotos) {
        try {
          const parsed = JSON.parse(i.memoryPhotos);
          return Array.isArray(parsed) && parsed.length > 0;
        } catch {
          return false;
        }
      }
      return false;
    }).length;
  }, [items]);

  const reflectionsCount = useMemo(() => {
    return items.filter((i) => i.reflection && i.reflection.trim().length > 0).length;
  }, [items]);

  // Contextual side panel for desktop
  const sidePanelContent = (
    <div className="space-y-6">
      {/* Scrapbook Archive Stats */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Archive Summary
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10">
            <span className="text-[10.5px] text-muted block">Keepsakes</span>
            <span className="text-lg font-bold text-primary">{items.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10">
            <span className="text-[10.5px] text-muted block">Photos</span>
            <span className="text-lg font-bold text-primary">{photosCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 col-span-2">
            <span className="text-[10.5px] text-muted block">Reflections Written</span>
            <span className="text-lg font-bold text-primary">{reflectionsCount}</span>
          </div>
        </div>
      </div>

      {/* Meaningful Philosophy */}
      <div className="glass-card rounded-2xl p-5 space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          Philosophy
        </span>
        <p className="text-xs text-secondary leading-relaxed italic font-serif">
          &ldquo;One day, your dreams become your memories. Live them fully so you have beautiful stories to look back upon.&rdquo;
        </p>
      </div>

      {/* Dreams Shortcut */}
      <div className="glass-card rounded-2xl p-5 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-muted" />
          Keep Dreaming
        </span>
        <p className="text-xs text-muted leading-relaxed">
          Ready for your next milestone? Return to your active dreams list.
        </p>
        <div className="pt-1">
          <Link
            href="/dreams"
            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
          >
            <span>Go to My Dreams</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  if (authLoading || (isLoading && items.length === 0)) {
    return (
      <AppShell title="Memories">
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-muted animate-spin mb-3" />
          <p className="text-xs text-muted font-medium">Gathering your memory scrapbook...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Memories" sidePanel={sidePanelContent}>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary font-serif-heading leading-tight">
                Memories & Scrapbook
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/25 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{items.length} {items.length === 1 ? "Keepsake" : "Keepsakes"}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-secondary">
              A living gallery of milestones lived, reflections written, and moments preserved.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <Link href="/dreams">
              <Button variant="outline" size="md" className="font-semibold gap-1.5">
                <span>View My Dreams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar if items exist */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search memories & reflections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 glass-input rounded-2xl text-xs sm:text-sm placeholder:text-stone-400 text-primary focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer",
                  selectedCategory === "all"
                    ? "glass-tab-active shadow-2xs font-semibold"
                    : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10"
                )}
              >
                All ({items.length})
              </button>
              {categories.map((cat) => {
                const count = items.filter((i) => i.categoryId === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer",
                      selectedCategory === cat.id
                        ? "glass-tab-active shadow-2xs font-semibold"
                        : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10"
                    )}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content View */}
        {items.length === 0 ? (
          /* Empty Scrapbook State */
          <div className="max-w-md mx-auto py-16 sm:py-20 text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-primary font-serif-heading mb-2">
              Your scrapbook is waiting.
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-6">
              Complete your first dream and the memory will live here. Every milestone
              you accomplish becomes an authentic keepsake you can treasure forever.
            </p>
            <Link href="/dreams">
              <Button variant="primary" size="md" className="font-semibold shadow-sm">
                <span>View My Dreams</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          /* No filter match */
          <div className="py-16 text-center">
            <p className="text-xs sm:text-sm text-muted mb-3">
              No memories match &ldquo;{search}&rdquo;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Responsive Keepsake Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <ScrapbookCard
                key={item.id}
                item={item}
                onClick={(clicked) => setSelectedItemForDetail(clicked)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        isOpen={!!selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        item={selectedItemForDetail}
        onEditPostcard={(itemToEdit) => {
          setSelectedItemForEditor(itemToEdit);
        }}
      />

      {/* Postcard Editor Modal */}
      <PostcardEditorModal
        isOpen={!!selectedItemForEditor}
        onClose={() => setSelectedItemForEditor(null)}
        item={selectedItemForEditor}
        onSaved={handleItemUpdated}
      />
    </AppShell>
  );
}
