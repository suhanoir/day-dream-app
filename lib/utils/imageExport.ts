"use client";

import { toPng, toBlob } from "html-to-image";

/**
 * Compresses and resizes an uploaded user image file to an optimized base64 Data URL.
 * Bounded to max dimensions (1200x1600) with 82% quality to ensure lightweight storage (<200KB).
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file (JPEG, PNG, WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generates a high-DPI (2x Retina) PNG Blob from an HTML Element.
 */
export async function exportElementToBlob(element: HTMLElement): Promise<Blob> {
  // Ensure all fonts and images are ready
  if (document.fonts) {
    await document.fonts.ready;
  }

  const blob = await toBlob(element, {
    pixelRatio: 2,
    cacheBust: true,
    quality: 0.95,
    filter: (node) => {
      if (node instanceof HTMLElement && node.classList.contains("no-export")) {
        return false;
      }
      return true;
    },
  });

  if (!blob) {
    throw new Error("Failed to render postcard to image.");
  }

  return blob;
}

/**
 * Triggers a direct browser file download for a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Attempts to share the image using native Web Share API if supported.
 * Falls back gracefully to direct file download if sharing is unavailable or cancelled.
 */
export async function shareOrDownloadPostcard(
  element: HTMLElement,
  title: string,
  slugTitle: string
): Promise<"shared" | "downloaded"> {
  const blob = await exportElementToBlob(element);
  const filename = `daydream-${slugTitle || "memory"}.png`;

  const file = new File([blob], filename, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: `DayDream: ${title}`,
        text: `A memory from DayDream — ${title}`,
        files: [file],
      });
      return "shared";
    } catch (err: unknown) {
      // If user dismissed share sheet (AbortError), don't force download
      if (err instanceof Error && err.name === "AbortError") {
        return "shared";
      }
      // Otherwise fall through to download
    }
  }

  // Fallback: direct download
  downloadBlob(blob, filename);
  return "downloaded";
}
