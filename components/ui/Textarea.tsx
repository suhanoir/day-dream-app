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
            className="text-xs font-semibold text-stone-700 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white text-stone-900 border border-stone-200/90 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/50 focus:border-stone-400 transition-all duration-150 resize-y min-h-[80px] disabled:bg-stone-50 disabled:text-stone-400",
            error && "border-rose-400 focus:ring-rose-200 focus:border-rose-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-stone-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

