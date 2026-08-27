"use client";

import React from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Target, CheckCircle2, Clock, Sparkles } from "lucide-react";

export interface StatsData {
  totalGoals: number;
  completedGoals: number;
  remainingGoals: number;
  completionRate: number;
}

export interface StatsOverviewProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function StatsOverview({ stats, isLoading = false }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/60 border border-stone-200/60 rounded-2xl p-4 sm:p-5 animate-pulse-subtle h-24"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 my-6">
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Goals */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Goals
            </span>
            <Target className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            {stats.totalGoals}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
            {stats.completedGoals}
            {stats.completedGoals > 0 && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Remaining
            </span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            {stats.remainingGoals}
          </div>
        </div>

        {/* Completion % */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Progress
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            {stats.completionRate}%
          </div>
        </div>
      </div>

      {/* Sleek Minimal Progress Bar */}
      {stats.totalGoals > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-2xl px-5 py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-medium text-stone-600">
            Overall Milestone Completion
          </span>
          <div className="w-full sm:w-80">
            <ProgressBar value={stats.completionRate} size="sm" showLabel={true} />
          </div>
        </div>
      )}
    </div>
  );
}

