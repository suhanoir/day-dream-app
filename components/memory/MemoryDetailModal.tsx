"use client";

import React, { useState, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { MemoryPostcard, PostcardStyle } from "./MemoryPostcard";
import { MemoryLightbox } from "./MemoryLightbox";
import { shareOrDownloadPostcard } from "@/lib/utils/imageExport";
import {
  Download,
  Pencil,
  Quote,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Maximize2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { cn } from "@/lib/utils/cn";

export interface MemoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BucketListItemData | null;
  onEditPostcard: (item: BucketListItemData) => void;
}

export function MemoryDetailModal({
  isOpen,
  onClose,
  item,
  onEditPostcard,
}: MemoryDetailModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();
  const [isExporting, setIsExporting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const postcardRef = useRef<HTMLDivElement>(null);

  // Parse photos array safely
  const photos: string[] = useMemo(() => {
    if (!item) return [];
    if (item.memoryPhotos) {
      try {
        const parsed = JSON.parse(item.memoryPhotos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p) => typeof p === "string" && p.trim());
        }
      } catch {
        // fallback
      }
    }
    return item.memoryPhoto ? [item.memoryPhoto] : [];
  }, [item]);

  const coverPhoto = item?.memoryPhoto || photos[0] || null;
  const coverIndex = coverPhoto ? Math.max(0, photos.indexOf(coverPhoto)) : 0;

  if (!item) return null;

  const handleExport = async () => {
    if (!postcardRef.current) return;
    try {
      setIsExporting(true);
      playSound("ui-click");
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const action = await shareOrDownloadPostcard(
        postcardRef.current,
        item.title,
        slug
      );

      if (action === "shared") {
        success("Memory shared successfully!");
      } else {
        success("Memory postcard downloaded!");
      }
    } catch (err) {
      console.error("Export error:", err);
      toastError("Failed to export postcard image.");
    } finally {
      setIsExporting(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    playSound("ui-click");
  };

  const formattedCompletedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Completed";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="2xl"
        showCloseButton={true}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-stone-200/80 dark:border-stone-800/80 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {item.category && (
                <CategoryBadge
                  name={item.category.name}
                  color={item.category.color}
                  size="md"
                />
              )}
              <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold tracking-wide">
                Achieved on {formattedCompletedDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditPostcard(item);
                }}
                className="gap-1.5 text-xs text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Customize</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExport}
                isLoading={isExporting}
                className="gap-1.5 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Image</span>
              </Button>
            </div>
          </div>

          {/* Center Grid: Postcard Presentation + Full Reflection Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Postcard Presentation & Gallery */}
            <div className="md:col-span-6 flex flex-col items-center justify-center py-2">
              <div className="relative group">
                <MemoryPostcard
                  ref={postcardRef}
                  title={item.title}
                  completedAt={item.completedAt}
                  reflection={item.reflection}
                  coverPhoto={coverPhoto}
                  categoryName={item.category?.name}
                  categoryColor={item.category?.color}
                  style={(item.postcardStyle as PostcardStyle) || "polaroid"}
                />

                {/* Quick Fullscreen Button over Cover Photo */}
                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(coverIndex)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                    title="View Fullscreen"
                    aria-label="View photo fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Multi-Photo Album Strip (if multiple photos) */}
              {photos.length > 1 && (
                <div className="mt-3.5 w-full max-w-[380px] sm:max-w-[420px]">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                      Album ({photos.length} photos)
                    </span>
                    <span className="text-[10.5px] text-stone-500 dark:text-stone-400 font-medium">
                      Tap photo to expand
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {photos.map((photo, idx) => {
                      const isCover = idx === coverIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openLightbox(idx)}
                          className={cn(
                            "relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer hover:scale-105 shadow-2xs",
                            isCover
                              ? "border-amber-400 ring-1 ring-amber-400/40"
                              : "border-stone-200/80 dark:border-stone-700/80 hover:border-stone-400"
                          )}
                          aria-label={`View memory photo ${idx + 1}`}
                        >
                          <img
                            src={photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {isCover && (
                            <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-[8px] font-bold text-white text-center py-0.2 uppercase">
                              Cover
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Full Memory Reflection Details */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Completed Dream
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 font-serif-heading leading-snug">
                  {item.title}
                </h3>
              </div>

              {/* Reflection Journal Section with Dedicated High-Contrast Surface */}
              <div className="p-4 sm:p-5 rounded-2xl glass-journal relative">
                <Quote className="w-6 h-6 text-stone-400 dark:text-stone-500 absolute top-3.5 right-3.5 pointer-events-none opacity-40" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
                  Personal Memory Journal
                </span>
                {item.reflection ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap italic font-serif text-stone-800 dark:text-stone-100 font-normal">
                    &ldquo;{item.reflection}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                    No written reflection was captured for this dream. You can add one anytime by customizing this memory.
                  </p>
                )}
              </div>

              {/* Description if present */}
              {item.description && (
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Original Goal Description:
                  </span>
                  <p className="whitespace-pre-wrap text-stone-600 dark:text-stone-400">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Link to view on BucketList Dashboard */}
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-primary)] transition-colors cursor-pointer"
                >
                  <span>View on Bucket List Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Full-Screen Lightbox Image Viewer */}
      <MemoryLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={photos}
        initialIndex={lightboxIndex}
        coverPhotoIndex={coverIndex}
        title={item.title}
      />
    </>
  );
}
