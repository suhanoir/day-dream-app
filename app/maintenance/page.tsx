"use client";

import React, { useState } from "react";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { APP_VERSION } from "@/lib/config/version";
import { RotateCw, ShieldCheck, Sparkles, Clock } from "lucide-react";

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = () => {
    setIsChecking(true);
    // Hard refresh to check if maintenance mode has been turned off
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-stone-900 selection:text-stone-50">
      {/* Top Brand Marker */}
      <header className="w-full max-w-4xl flex items-center justify-center pt-2">
        <div className="flex items-center gap-2.5">
          <DayDreamLogo size={32} className="w-8 h-8 shadow-xs" />
          <span className="text-lg font-bold tracking-tight text-stone-900">
            DayDream
          </span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-lg my-auto py-8">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-stone-900/5 text-center flex flex-col items-center">
          {/* Logo Hero */}
          <div className="mb-6 relative">
            <DayDreamLogo size={64} className="w-16 h-16 shadow-md" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
            </span>
          </div>

          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold mb-5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Under Scheduled Maintenance
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-3 leading-snug">
            We’ll be back soon!
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-8 max-w-sm">
            DayDream is currently undergoing routine maintenance and upgrades.
            Service will resume automatically once updates are complete.
          </p>

          {/* Reassurance Feature List */}
          <div className="w-full bg-stone-50/80 border border-stone-200/60 rounded-2xl p-4 mb-8 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your account, bucket list, and data are safe.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-700">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>We’re rolling out performance improvements.</span>
            </div>
          </div>

          {/* Check Status Button */}
          <button
            onClick={handleRefresh}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-stone-50 text-sm font-semibold hover:bg-stone-800 active:scale-[0.98] transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RotateCw
              className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
            />
            {isChecking ? "Checking Status..." : "Check Status / Refresh"}
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full text-center text-xs text-stone-400 py-4">
        <p>DayDream {APP_VERSION} · We appreciate your patience.</p>
      </footer>
    </div>
  );
}
