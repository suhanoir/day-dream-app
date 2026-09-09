"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "subtle" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-soft-border,#D5D9FB)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
          // Variants
          variant === "primary" &&
            "bg-[var(--theme-primary,#4F5FD7)] text-white hover:bg-[var(--theme-primary-hover,#4351C2)] shadow-sm active:scale-[0.98]",
          variant === "secondary" &&
            "bg-[var(--theme-primary-soft,#EEF0FF)] text-[var(--theme-primary,#4F5FD7)] hover:opacity-90 active:scale-[0.98]",
          variant === "outline" &&
            "border border-stone-200/90 text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98]",
          variant === "subtle" &&
            "bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 active:scale-[0.98]",
          variant === "danger" &&
            "bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 active:scale-[0.98]",
          variant === "ghost" &&
            "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70",
          // Sizes
          size === "sm" && "text-xs px-3 py-1.5 gap-1.5 h-8",
          size === "md" && "text-sm px-4 py-2 gap-2 h-10",
          size === "lg" && "text-base px-5 py-2.5 gap-2.5 h-12",
          size === "icon" && "p-2 w-9 h-9",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

