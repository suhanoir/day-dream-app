"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Star, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface MemoryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  initialIndex?: number;
  coverPhotoIndex?: number;
  title?: string;
}

export function MemoryLightbox({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  coverPhotoIndex = 0,
  title,
}: MemoryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);

  // Sync index when opened or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, photos.length - 1)));
    }
  }, [isOpen, initialIndex, photos.length]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const isCover = currentIndex === coverPhotoIndex;

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} photo album` : "Photo album lightbox"}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto z-10 text-white">
        <div className="flex items-center gap-3">
          {/* Photo Counter */}
          <span className="text-xs sm:text-sm font-mono font-medium px-3 py-1 rounded-full bg-white/10 border border-white/15 text-stone-200">
            {currentIndex + 1} of {photos.length}
          </span>

          {/* Cover Photo Badge */}
          {isCover && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Cover Photo</span>
            </span>
          )}

          {title && (
            <span className="hidden md:inline-block text-xs font-medium text-stone-300 truncate max-w-sm">
              {title}
            </span>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 hover:text-white transition-all cursor-pointer"
          aria-label="Close lightbox"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center Image Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center my-auto w-full max-w-5xl mx-auto overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button (Desktop) */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-xs shadow-lg"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Active Photo */}
        <div className="relative max-h-[72vh] max-w-full flex items-center justify-center">
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={title ? `${title} photo ${currentIndex + 1}` : `Memory photo ${currentIndex + 1}`}
            className="max-h-[72vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10 animate-fade-in"
          />
        </div>

        {/* Next Button (Desktop) */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-xs shadow-lg"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip (if multiple photos) */}
      {photos.length > 1 && (
        <div className="w-full max-w-4xl mx-auto z-10 pt-2">
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar">
            {photos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer border-2",
                  idx === currentIndex
                    ? "border-amber-400 scale-105 shadow-md shadow-amber-500/20"
                    : "border-transparent opacity-50 hover:opacity-100 hover:border-white/30"
                )}
                aria-label={`Jump to photo ${idx + 1}`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === coverPhotoIndex && (
                  <span className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-black/70 text-amber-300">
                    <Star className="w-2.5 h-2.5 fill-amber-300" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

