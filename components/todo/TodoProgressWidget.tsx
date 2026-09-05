"use client";

import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TodoProgressWidgetProps {
  totalCount: number;
  completedCount: number;
}

export function TodoProgressWidget({
  totalCount,
  completedCount,
}: TodoProgressWidgetProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllDone = totalCount > 0 && completedCount === totalCount;
  const prevIsAllDoneRef = useRef(false);

  useEffect(() => {
    // Only fire confetti on the transition from not-all-done to all-done
    if (isAllDone && !prevIsAllDoneRef.current) {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
      });
    }
    prevIsAllDoneRef.current = isAllDone;
  }, [isAllDone]);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Progress Bar & Counter Card */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-700 tracking-tight">
            Daily Progress
          </span>
          <span className="font-semibold text-stone-900">
            {completedCount} / {totalCount} completed{" "}
            <span className="text-stone-400 font-normal">({percentage}%)</span>
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isAllDone ? "bg-emerald-500" : "bg-stone-800"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Congratulatory message when all done */}
      {isAllDone && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              Everything is done!
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              You completed everything on your list today.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

