"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { MemoryPostcard, PostcardStyle } from "./MemoryPostcard";
import { shareOrDownloadPostcard } from "@/lib/utils/imageExport";
import {
  Download,
  Share2,
  Pencil,
  Quote,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

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
  const postcardRef = useRef<HTMLDivElement>(null);

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

  const formattedCompletedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Completed";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {item.category && (
              <CategoryBadge
                name={item.category.name}
                color={item.category.color}
                size="md"
              />
            )}
            <span className="text-xs text-stone-400 font-medium">
              Achieved on {formattedCompletedDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEditPostcard(item);
              }}
              className="gap-1 text-xs"
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
              className="gap-1 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Image</span>
            </Button>
          </div>
        </div>

        {/* Center Grid: Postcard + Full Reflection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Postcard Presentation */}
          <div className="md:col-span-6 flex justify-center py-2">
            <MemoryPostcard
              ref={postcardRef}
              title={item.title}
              completedAt={item.completedAt}
              reflection={item.reflection}
              coverPhoto={item.memoryPhoto}
              categoryName={item.category?.name}
              categoryColor={item.category?.color}
              style={(item.postcardStyle as PostcardStyle) || "polaroid"}
            />
          </div>

          {/* Full Memory Reflection Details */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Completed Dream
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-stone-900 font-serif-heading leading-snug">
                {item.title}
              </h3>
            </div>

            {/* Reflection Journal Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/90 dark:bg-stone-800/40 border border-stone-200/70 relative">
              <Quote className="w-6 h-6 text-stone-300 dark:text-stone-600 absolute top-3 right-3 pointer-events-none" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Personal Memory Journal
              </span>
              {item.reflection ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap italic font-serif text-stone-700 dark:text-stone-300">
                  &ldquo;{item.reflection}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  No written reflection was captured for this dream. You can add one anytime by customizing this memory.
                </p>
              )}
            </div>

            {/* Description if present */}
            {item.description && (
              <div className="text-xs text-stone-500 leading-relaxed">
                <span className="font-semibold text-stone-700 dark:text-stone-400 block mb-0.5">
                  Original Goal Description:
                </span>
                <p className="whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {/* Link to view on BucketList */}
            <div className="pt-2">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
              >
                <span>View on Bucket List Dashboard</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
