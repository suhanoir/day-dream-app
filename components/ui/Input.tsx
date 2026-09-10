"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
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
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-2.5 glass-input text-stone-900 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200",
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

Input.displayName = "Input";

