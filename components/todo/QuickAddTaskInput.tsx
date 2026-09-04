"use client";

import React, { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";

interface QuickAddTaskInputProps {
  onAddTask: (title: string) => Promise<boolean>;
  disabled?: boolean;
}

export function QuickAddTaskInput({
  onAddTask,
  disabled = false,
}: QuickAddTaskInputProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const success = await onAddTask(cleanTitle);
      if (success) {
        setTitle("");
        // Keep focus on the input for rapid-fire task entry
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center bg-white rounded-2xl border border-stone-200/90 shadow-2xs transition-all duration-200 focus-within:border-stone-400 focus-within:shadow-xs group"
    >
      <div className="pl-4 pr-2 text-stone-400 group-focus-within:text-stone-700 transition-colors flex items-center">
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin text-stone-500" />
        ) : (
          <Plus className="w-5 h-5 transition-transform group-focus-within:rotate-90 group-focus-within:text-stone-800" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task... (Press Enter to save)"
        disabled={disabled || isSubmitting}
        className="w-full py-3.5 pr-14 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none disabled:opacity-50"
      />

      {title.trim().length > 0 && (
        <div className="absolute right-3 flex items-center gap-1.5 animate-fade-in">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </form>
  );
}
