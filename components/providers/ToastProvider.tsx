"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, Calendar, Sparkles, Receipt, Sun, Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "task"
  | "calendar"
  | "bucket"
  | "expense"
  | "daily"
  | "system";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  task: (message: string) => void;
  calendar: (message: string) => void;
  bucket: (message: string) => void;
  expense: (message: string) => void;
  daily: (message: string) => void;
  system: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { playSound } = useSound();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      if (type === "error") {
        playSound("error.soft");
      } else if (type === "bucket") {
        playSound("dream.completed");
      } else if (type === "info" || type === "system" || type === "calendar") {
        playSound("notification.received");
      }

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast, playSound]
  );

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    info: (msg: string) => addToast(msg, "info"),
    task: (msg: string) => addToast(msg, "task"),
    calendar: (msg: string) => addToast(msg, "calendar"),
    bucket: (msg: string) => addToast(msg, "bucket"),
    expense: (msg: string) => addToast(msg, "expense"),
    daily: (msg: string) => addToast(msg, "daily"),
    system: (msg: string) => addToast(msg, "system"),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Global Toast Container */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 mx-auto z-[60] flex flex-col items-center gap-2 w-full max-w-[min(calc(100vw-2rem),24rem)] sm:bottom-5 sm:right-5 sm:left-auto sm:mx-0 sm:items-end sm:w-auto sm:max-w-sm px-0 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass-toast text-sm transition-all duration-300 animate-fade-in shadow-lg",
              "w-auto max-w-full min-w-0 sm:min-w-[280px]",
              t.type === "success" && "border-emerald-500/40 shadow-emerald-500/10",
              t.type === "error" && "border-rose-500/40 shadow-rose-500/10",
              t.type === "info" && "border-stone-200/80",
              t.type === "task" && "border-emerald-500/40 shadow-emerald-500/10",
              t.type === "calendar" && "border-blue-500/40 shadow-blue-500/10",
              t.type === "bucket" && "border-amber-500/40 shadow-amber-500/10",
              t.type === "expense" && "border-violet-500/40 shadow-violet-500/10",
              t.type === "daily" && "border-amber-500/40 shadow-amber-500/10",
              t.type === "system" && "border-indigo-500/40 shadow-indigo-500/10"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {t.type === "info" && <Info className="w-4 h-4 text-sky-600 shrink-0" />}
              {t.type === "task" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {t.type === "calendar" && <Calendar className="w-4 h-4 text-blue-600 shrink-0" />}
              {t.type === "bucket" && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
              {t.type === "expense" && <Receipt className="w-4 h-4 text-violet-600 shrink-0" />}
              {t.type === "daily" && <Sun className="w-4 h-4 text-amber-500 shrink-0" />}
              {t.type === "system" && <Bell className="w-4 h-4 text-indigo-600 shrink-0" />}
              <span className="font-medium text-stone-900 text-[13px] leading-snug break-words">
                {t.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-lg cursor-pointer active:scale-95 shrink-0 ml-0.5 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

