"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { APP_VERSION } from "@/lib/config/version";
import {
  User,
  Mail,
  Calendar,
  Target,
  CheckCircle2,
  LogOut,
  Palette,
  ChevronRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "profile" | "settings" | "theme";
}

export function ProfileModal({
  isOpen,
  onClose,
  initialView = "profile",
}: ProfileModalProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes, currentThemeMeta } = useTheme();

  const [currentView, setCurrentView] = useState<"profile" | "settings" | "theme">(
    initialView
  );

  const [stats, setStats] = useState<{
    totalGoals: number;
    completedGoals: number;
    totalEvents: number;
  }>({
    totalGoals: 0,
    completedGoals: 0,
    totalEvents: 0,
  });

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch stats
      Promise.all([
        fetch("/api/stats").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/events?filter=all").then((r) => (r.ok ? r.json() : null)),
      ])
        .then(([statsData, eventsData]) => {
          setStats({
            totalGoals: statsData?.stats?.totalGoals || 0,
            completedGoals: statsData?.stats?.completedGoals || 0,
            totalEvents: eventsData?.events?.length || 0,
          });
        })
        .catch((err) => console.error("Profile stats error:", err));
    }
  }, [isOpen, user]);

  if (!user) return null;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton={true}>
      {/* VIEW 1: PROFILE OVERVIEW */}
      {currentView === "profile" && (
        <div className="space-y-5 text-center pt-2 pb-1 animate-fade-in">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full text-white flex items-center justify-center text-xl font-bold mb-3 shadow-md transition-colors"
              style={{ backgroundColor: currentThemeMeta.palette.primary }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3 className="text-lg font-bold text-stone-900">{user.name}</h3>
            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Member since {joinDate}
            </p>
          </div>

          {/* User Stats Grid */}
          <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 text-center">
            <div className="p-2">
              <span className="text-xs text-stone-400 font-medium block mb-1">
                Goals
              </span>
              <span className="text-lg font-bold text-stone-900">
                {stats.totalGoals}
              </span>
            </div>

            <div className="p-2 border-x border-stone-200/60">
              <span className="text-xs text-stone-400 font-medium block mb-1">
                Completed
              </span>
              <span className="text-lg font-bold text-emerald-600">
                {stats.completedGoals}
              </span>
            </div>

            <div className="p-2">
              <span className="text-xs text-stone-400 font-medium block mb-1">
                Events
              </span>
              <span className="text-lg font-bold text-stone-900">
                {stats.totalEvents}
              </span>
            </div>
          </div>

          {/* Settings Entry Button */}
          <button
            type="button"
            onClick={() => setCurrentView("settings")}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/90 border border-stone-200/80 transition-all cursor-pointer group shadow-2xs text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors"
                style={{ backgroundColor: currentThemeMeta.palette.primary }}
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Settings</p>
                <p className="text-[11px] text-stone-500">Theme and appearance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-600">
                {currentThemeMeta.name}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Actions */}
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full justify-center font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <p className="text-[10px] text-stone-400 font-medium pt-1">
              DayDream {APP_VERSION}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: SETTINGS PANEL */}
      {currentView === "settings" && (
        <div className="space-y-4 pt-1 pb-1 animate-fade-in text-left">
          {/* Navigation Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <button
              type="button"
              onClick={() => setCurrentView("profile")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <h3 className="text-sm font-bold text-stone-900">Settings</h3>
            <div className="w-14" />
          </div>

          {/* Settings Options */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
              Appearance
            </span>

            <button
              type="button"
              onClick={() => setCurrentView("theme")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-300 hover:shadow-2xs transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  <Palette className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Theme</p>
                  <p className="text-[11px] text-stone-500">
                    Choose how DayDream looks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Visual Swatch Preview */}
                <div className="flex items-center -space-x-1.5">
                  {currentThemeMeta.previewSwatches.slice(1, 3).map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border-2 border-white shadow-2xs"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-stone-700">
                  {currentThemeMeta.name}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="pt-6 border-t border-stone-100 text-center">
            <p className="text-[10px] text-stone-400 font-medium">
              DayDream {APP_VERSION}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: THEME SELECTOR PANEL */}
      {currentView === "theme" && (
        <div className="space-y-4 pt-1 pb-1 animate-fade-in text-left">
          {/* Navigation Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <button
              type="button"
              onClick={() => setCurrentView("settings")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <h3 className="text-sm font-bold text-stone-900">Theme</h3>
            <div className="w-14" />
          </div>

          {/* Theme Headline */}
          <div className="pt-0.5 px-0.5">
            <h4 className="text-sm font-bold text-stone-900">
              Choose how DayDream looks.
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Select a theme to personalize your workspace. Applied across all sections.
            </p>
          </div>

          {/* Theme Selection Cards */}
          <div className="space-y-2.5 pt-1">
            {themes.map((t) => {
              const isSelected = theme === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative",
                    isSelected
                      ? "bg-white shadow-sm border-2"
                      : "bg-stone-50/70 hover:bg-white border-stone-200/80 hover:border-stone-300"
                  )}
                  style={{
                    borderColor: isSelected ? t.palette.primary : undefined,
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* 4-color palette swatch preview */}
                    <div className="flex items-center gap-1 p-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs shrink-0">
                      {t.previewSwatches.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full shadow-2xs border border-black/10 shrink-0"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-stone-900 whitespace-nowrap">
                          {t.name}
                        </p>
                        {t.id === "indigo" && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200/60 uppercase tracking-wider shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {/* Selected indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    {isSelected ? (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: t.palette.primary }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-stone-300 group-hover:border-stone-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              Theme is applied immediately and persists across visits.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
