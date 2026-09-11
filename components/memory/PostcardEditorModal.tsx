"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { BucketListItemData } from "@/components/bucket-list/BucketListItemCard";
import { MemoryPostcard, PostcardStyle } from "./MemoryPostcard";
import {
  compressImageFile,
  shareOrDownloadPostcard,
} from "@/lib/utils/imageExport";
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  Download,
  Save,
  Layers,
  Sparkles,
  Plus,
  Star,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface PostcardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BucketListItemData | null;
  onSaved?: (updatedItem: BucketListItemData) => void;
}

const STYLES: Array<{ id: PostcardStyle; label: string; desc: string }> = [
  { id: "polaroid", label: "Polaroid", desc: "Photo-first keepsake" },
  { id: "editorial", label: "Editorial", desc: "Gallery museum print" },
  { id: "journal", label: "Journal", desc: "Luxury stationery" },
];

export function PostcardEditorModal({
  isOpen,
  onClose,
  item,
  onSaved,
}: PostcardEditorModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [style, setStyle] = useState<PostcardStyle>("polaroid");
  const [photos, setPhotos] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [showCategory, setShowCategory] = useState(true);
  const [showDate, setShowDate] = useState(true);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const postcardRef = useRef<HTMLDivElement>(null);

  // Sync state when item opens
  useEffect(() => {
    if (item) {
      setStyle((item.postcardStyle as PostcardStyle) || "polaroid");

      let initialPhotos: string[] = [];
      if (item.memoryPhotos) {
        try {
          const parsed = JSON.parse(item.memoryPhotos);
          if (Array.isArray(parsed)) {
            initialPhotos = parsed.filter((p) => typeof p === "string" && p.trim());
          }
        } catch {
          // ignore parsing error
        }
      }

      if (initialPhotos.length === 0 && item.memoryPhoto) {
        initialPhotos = [item.memoryPhoto];
      }

      setPhotos(initialPhotos);
      setCoverPhoto(item.memoryPhoto || initialPhotos[0] || null);
      setReflectionText(item.reflection || "");
      setShowCategory(true);
      setShowDate(true);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    if (photos.length >= 10) {
      toastError("You can add up to 10 memories to a Keepsake.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const availableSlots = 10 - photos.length;
    const filesToProcess = rawFiles.slice(0, availableSlots);
    const hadExcess = rawFiles.length > availableSlots;

    try {
      setIsUploadingPhoto(true);
      const newPhotos: string[] = [];
      for (const file of filesToProcess) {
        const dataUrl = await compressImageFile(file);
        newPhotos.push(dataUrl);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);

      // If no cover photo existed, set first newly added photo as cover
      if (!coverPhoto && updatedPhotos.length > 0) {
        setCoverPhoto(updatedPhotos[0]);
      }

      playSound("memory.photoAdded");
      if (hadExcess) {
        toastError("You can add up to 10 memories to a Keepsake.");
      } else {
        success(
          filesToProcess.length === 1
            ? "Memory photo added!"
            : `${filesToProcess.length} memory photos added!`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process photos.";
      toastError(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetCover = (photo: string) => {
    setCoverPhoto(photo);
    playSound("memory.coverChanged");
    success("Cover photo updated!");
  };

  const handleMovePhoto = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPhotos(updated);
  };

  const handleRemovePhoto = (index: number) => {
    const removedPhoto = photos[index];
    const updated = photos.filter((_, idx) => idx !== index);
    setPhotos(updated);

    // If removed photo was cover, promote next photo or reset
    if (coverPhoto === removedPhoto) {
      setCoverPhoto(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleSaveToScrapbook = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/bucket-list/${item.id}/postcard`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryPhoto: coverPhoto,
          memoryPhotos: photos,
          postcardStyle: style,
          reflection: reflectionText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "Failed to save memory postcard.");
        return;
      }

      playSound("keepsake.saved");
      success("Memory postcard saved to your Scrapbook! ✨");
      if (onSaved) {
        onSaved(data.item);
      }
      onClose();
    } catch {
      toastError("Failed to save memory postcard.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!postcardRef.current) return;
    try {
      setIsExporting(true);
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const action = await shareOrDownloadPostcard(
        postcardRef.current,
        item.title,
        slug
      );

      playSound("keepsake.saved");
      if (action === "shared") {
        success("Postcard shared successfully!");
      } else {
        success("Postcard image downloaded!");
      }
    } catch (err) {
      console.error("Export error:", err);
      toastError("Failed to export postcard image.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Modal Header */}
        <div className="border-b border-stone-200/60 dark:border-stone-800/80 pb-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-primary">
                Memory Keepsake Album
              </h2>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Turn this milestone into an authentic keepsake with your favorite memories.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Live Postcard Preview (Dominant & Centered) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 shadow-inner">
            <div className="w-full flex justify-center py-2">
              <MemoryPostcard
                ref={postcardRef}
                title={item.title}
                completedAt={item.completedAt || new Date()}
                reflection={reflectionText}
                coverPhoto={coverPhoto}
                categoryName={item.category?.name}
                categoryColor={item.category?.color}
                style={style}
                showCategory={showCategory}
                showDate={showDate}
              />
            </div>
            <p className="text-[11px] text-muted mt-3 text-center font-medium">
              Live Preview · Adapts automatically to your DayDream theme
            </p>
          </div>

          {/* RIGHT: Editor Controls */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Postcard Composition / Style */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-muted" />
                Postcard Composition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStyle(s.id);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      style === s.id
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/15 text-primary font-semibold shadow-xs ring-1 ring-[var(--theme-primary)]"
                        : "border-stone-200/80 dark:border-stone-700/80 hover:border-stone-300 bg-white dark:bg-stone-800/60 text-secondary"
                    )}
                  >
                    <span className="text-xs block font-bold text-primary">{s.label}</span>
                    <span className="text-[10px] text-muted leading-tight block mt-0.5">
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Keepsake Photo Album & Cover Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-muted" />
                  Keepsake Photos & Cover
                </label>
                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (photos.length >= 10) {
                        toastError("You can add up to 10 memories to a Keepsake.");
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    disabled={isUploadingPhoto}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:text-accent cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Photos</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />

              {photos.length > 0 ? (
                <div className="space-y-2.5">
                  {/* Photo Thumbnails List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {photos.map((photo, idx) => {
                      const isCover = photo === coverPhoto;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-xl border transition-all",
                            isCover
                              ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-600/50"
                              : "bg-white dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/80"
                          )}
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                            <img
                              src={photo}
                              alt={`Memory ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isCover && (
                              <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-[8.5px] font-bold text-white text-center py-0.2 uppercase tracking-tight">
                                Cover
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            {isCover ? (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-800 dark:text-amber-300">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                <span>Cover Image</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetCover(photo)}
                                className="text-[10px] font-semibold text-secondary hover:text-primary underline cursor-pointer"
                              >
                                Set as Cover
                              </button>
                            )}

                            {/* Reorder arrows */}
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded text-muted hover:text-primary disabled:opacity-30 cursor-pointer"
                                title="Move Earlier"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, 1)}
                                disabled={idx === photos.length - 1}
                                className="p-1 rounded text-muted hover:text-primary disabled:opacity-30 cursor-pointer"
                                title="Move Later"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-auto cursor-pointer"
                                title="Remove Photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="w-full py-4 px-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 bg-white dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-white/10 text-secondary flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-xs font-medium"
                >
                  <ImageIcon className="w-5 h-5 text-muted" />
                  <span className="font-semibold text-primary">
                    {isUploadingPhoto
                      ? "Optimizing photos..."
                      : "Add memories to this Keepsake"}
                  </span>
                  <span className="text-[10px] text-muted">
                    Upload from your device (first photo will be the cover)
                  </span>
                </button>
              )}
            </div>

            {/* 3. Personal Reflection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center justify-between mb-1.5">
                <span>Personal Reflection</span>
                <span className="text-[10px] text-muted font-normal">
                  {reflectionText.length}/180 chars
                </span>
              </label>
              <Textarea
                rows={3}
                placeholder="How did it feel? What made this milestone unforgettable?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="text-xs leading-relaxed text-primary"
              />
            </div>

            {/* 4. Display Options */}
            <div className="flex items-center gap-4 text-xs text-secondary pt-1 font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCategory}
                  onChange={(e) => setShowCategory(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-600"
                />
                <span>Show Category</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-600"
                />
                <span>Show Date</span>
              </label>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                isLoading={isExporting}
                className="gap-1.5 text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Postcard (PNG)</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveToScrapbook}
                  isLoading={isSaving}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Scrapbook</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
