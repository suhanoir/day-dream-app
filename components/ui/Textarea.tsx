"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-secondary tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "w-full px-3.5 py-2.5 glass-input text-primary rounded-xl text-base sm:text-sm placeholder:text-muted focus:outline-none transition-all duration-150 resize-y min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-muted">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

