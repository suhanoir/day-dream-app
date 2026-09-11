"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { useTheme, THEMES, ThemeId } from "@/components/providers/ThemeProvider";
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
  Share2,
  Download,
  Save,
  Check,
  Palette,
  Layers,
  Sparkles,
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
  const { theme } = useTheme();
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [style, setStyle] = useState<PostcardStyle>("polaroid");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(theme);
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
      setCoverPhoto(item.memoryPhoto || null);
      setReflectionText(item.reflection || "");
      setSelectedTheme(theme);
      setShowCategory(true);
      setShowDate(true);
    }
  }, [item, theme, isOpen]);

  if (!item) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const dataUrl = await compressImageFile(file);
      setCoverPhoto(dataUrl);
      playSound("ui-click");
      success("Cover photo added!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process photo.";
      toastError(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setCoverPhoto(null);
    playSound("ui-click");
  };

  const handleSaveToScrapbook = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/bucket-list/${item.id}/postcard`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryPhoto: coverPhoto,
          postcardStyle: style,
          reflection: reflectionText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "Failed to save memory postcard.");
        return;
      }

      playSound("success");
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
      playSound("ui-click");
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const action = await shareOrDownloadPostcard(
        postcardRef.current,
        item.title,
        slug
      );

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
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-stone-900">
                Memory Postcard
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Turn this milestone into an authentic keepsake you can keep and share.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Live Postcard Preview (Dominant & Centered) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-stone-100/50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/60 shadow-inner">
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
                themeId={selectedTheme}
                showCategory={showCategory}
                showDate={showDate}
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-3 text-center">
              Live Preview · Updates instantly with your choices
            </p>
          </div>

          {/* RIGHT: Editor Controls */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Postcard Composition / Style */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-stone-400" />
                Postcard Composition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStyle(s.id);
                      playSound("ui-click");
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      style === s.id
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-stone-950 font-semibold shadow-2xs"
                        : "border-stone-200 hover:border-stone-300 bg-white dark:bg-stone-800/40 text-stone-600"
                    )}
                  >
                    <span className="text-xs block font-bold">{s.label}</span>
                    <span className="text-[10px] text-stone-400 leading-tight block mt-0.5">
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Cover Photo Section */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-stone-400" />
                Cover Photo (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              {coverPhoto ? (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-stone-800/40 border border-stone-200">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={coverPhoto}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      Custom Cover Photo
                    </p>
                    <p className="text-[10px] text-stone-400">
                      Optimized for private storage
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="Replace Photo"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="w-full py-3 px-4 rounded-2xl border border-dashed border-stone-300 hover:border-stone-400 bg-white dark:bg-stone-800/20 hover:bg-stone-50 text-stone-600 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs font-medium"
                >
                  <ImageIcon className="w-4 h-4 text-stone-400" />
                  <span>{isUploadingPhoto ? "Processing photo..." : "Add a cover photo from your device"}</span>
                </button>
              )}
            </div>

            {/* 3. Theme Palette */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-stone-400" />
                Color Atmosphere
              </label>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(th.id);
                      playSound("ui-click");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
                      selectedTheme === th.id
                        ? "border-stone-900 dark:border-stone-100 font-semibold bg-stone-100 dark:bg-stone-800"
                        : "border-stone-200/70 hover:border-stone-300 text-stone-600 bg-white dark:bg-stone-900/50"
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: th.palette.primary }}
                    />
                    <span>{th.name.replace("DayDream ", "")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Reflection Quote */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between mb-1.5">
                <span>Personal Reflection</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {reflectionText.length}/180 chars
                </span>
              </label>
              <Textarea
                rows={3}
                placeholder="How did it feel? What made this milestone unforgettable?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            {/* 5. Toggles */}
            <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCategory}
                  onChange={(e) => setShowCategory(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span>Show Category</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span>Show Date</span>
              </label>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                isLoading={isExporting}
                className="gap-1.5"
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
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveToScrapbook}
                  isLoading={isSaving}
                  className="gap-1.5 font-semibold"
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
