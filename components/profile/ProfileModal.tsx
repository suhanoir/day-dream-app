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
  Volume2,
  VolumeX,
  Volume1,
  Moon,
  Sun,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";
import { useToast } from "@/components/providers/ToastProvider";

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "profile" | "settings" | "theme" | "sound";
}

export function ProfileModal({
  isOpen,
  onClose,
  initialView = "profile",
}: ProfileModalProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes, currentThemeMeta } = useTheme();
  const { toast } = useToast();
  const {
    enabled: soundEnabled,
    setEnabled: setSoundEnabled,
    volume: soundVolume,
    setVolume: setSoundVolume,
    ambientEnabled,
    setAmbientEnabled,
    playSound,
  } = useSound();

  const [currentView, setCurrentView] = useState<
    "profile" | "settings" | "theme" | "sound"
  >(initialView);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={currentView === "theme" ? "xl" : "md"}
      showCloseButton={true}
    >
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
          <div className="grid grid-cols-3 gap-2 glass-card p-3.5 rounded-2xl text-center">
            <div className="p-2">
              <span className="text-xs text-stone-400 font-medium block mb-1">
                Goals
              </span>
              <span className="text-lg font-bold text-stone-900">
                {stats.totalGoals}
              </span>
            </div>

            <div className="p-2 border-x border-stone-200/50">
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

          {/* Direct Customization Actions: Theme & Sounds */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => setCurrentView("theme")}
              className="w-full flex items-center justify-between p-3 rounded-2xl glass-card-interactive transition-all cursor-pointer group shadow-2xs text-left active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors shrink-0"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Theme</p>
                  <p className="text-[11px] text-stone-500">Personalize colors & appearance</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-600">
                  {currentThemeMeta.name}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("sound")}
              className="w-full flex items-center justify-between p-3 rounded-2xl glass-card-interactive transition-all cursor-pointer group shadow-2xs text-left active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors shrink-0"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Sounds</p>
                  <p className="text-[11px] text-stone-500">Audio feedback & volume</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-600">
                  {soundEnabled ? `${Math.round(soundVolume * 100)}%` : "Off"}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

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
              className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-card-interactive transition-all cursor-pointer group text-left active:scale-98"
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

            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1 pt-2 block">
              Audio
            </span>

            <button
              type="button"
              onClick={() => setCurrentView("sound")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-card-interactive transition-all cursor-pointer group text-left active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4.5 h-4.5" />
                  ) : (
                    <VolumeX className="w-4.5 h-4.5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Sound</p>
                  <p className="text-[11px] text-stone-500">
                    Audio feedback and volume
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-700">
                  {soundEnabled ? `${Math.round(soundVolume * 100)}%` : "Off"}
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
              onClick={() => setCurrentView("profile")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Profile</span>
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

          {/* Scrollable Theme Groups Container */}
          <div className="space-y-4 pt-1 max-h-[58vh] overflow-y-auto pr-1">
            {/* LIGHT THEMES SECTION */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Light Themes (6)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes
                  .filter((t) => t.mode === "light")
                  .map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (theme !== t.id) {
                            setTheme(t.id);
                            playSound("theme.changed");
                          }
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 relative active:scale-98",
                          isSelected
                            ? "glass-card shadow-sm border-2"
                            : "glass-card-interactive"
                        )}
                        style={{
                          borderColor: isSelected ? t.palette.primary : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* 4-color palette swatch preview */}
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 border border-stone-200/60 shrink-0">
                            {t.previewSwatches.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full shadow-2xs border border-black/10 shrink-0"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {t.name}
                              </p>
                              {t.id === "indigo" && (
                                <span className="text-[8px] font-semibold px-1 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200/60 uppercase tracking-wider shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                              {t.description}
                            </p>
                          </div>
                        </div>

                        {/* Selected indicator */}
                        <div className="shrink-0 flex items-center justify-center">
                          {isSelected ? (
                            <div
                              className="w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-2xs text-white"
                              style={{
                                backgroundColor: t.palette.primary,
                              }}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-stone-300 group-hover:border-stone-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* DARK THEMES SECTION */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 px-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Dark Themes (6)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes
                  .filter((t) => t.mode === "dark")
                  .map((t) => {
                    const isSelected = theme === t.id;
                    const isDarkIcon =
                      t.id === "midnight-citrus" ||
                      t.id === "slate" ||
                      t.id === "ocean" ||
                      t.id === "forest";

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (theme !== t.id) {
                            setTheme(t.id);
                            playSound("theme.changed");
                          }
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 relative active:scale-98",
                          isSelected
                            ? "glass-card shadow-sm border-2"
                            : "glass-card-interactive"
                        )}
                        style={{
                          borderColor: isSelected ? t.palette.primary : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* 4-color palette swatch preview with dark capsule */}
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 shrink-0 shadow-inner">
                            {t.previewSwatches.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full shadow-2xs border border-white/15 shrink-0"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {t.name}
                              </p>
                              {t.id === "midnight-citrus" && (
                                <span className="text-[8px] font-semibold px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider shrink-0">
                                  Classic
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                              {t.description}
                            </p>
                          </div>
                        </div>

                        {/* Selected indicator */}
                        <div className="shrink-0 flex items-center justify-center">
                          {isSelected ? (
                            <div
                              className="w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-2xs font-bold"
                              style={{
                                backgroundColor: t.palette.primary,
                                color: isDarkIcon ? "#0D1117" : "#FFFFFF",
                              }}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-stone-300 group-hover:border-stone-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              Theme is applied immediately and persists across visits.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 4: SOUND SETTINGS PANEL */}
      {currentView === "sound" && (
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
            <h3 className="text-sm font-bold text-stone-900">Sounds</h3>
            <div className="w-14" />
          </div>

          {/* Sound Headline */}
          <div className="pt-0.5 px-0.5">
            <h4 className="text-sm font-bold text-stone-900">
              Calm, emotional sound design.
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Subtle acoustic feedback for life&apos;s meaningful moments.
            </p>
          </div>

          {/* Sound Controls */}
          <div className="space-y-3 pt-1">
            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors shrink-0"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4.5 h-4.5" />
                  ) : (
                    <VolumeX className="w-4.5 h-4.5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Sound Effects</p>
                  <p className="text-[11px] text-stone-500">
                    Gentle chimes on creation, completion &amp; keepsakes
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) playSound("ui-click");
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  soundEnabled ? "bg-stone-900" : "bg-stone-200"
                )}
                style={{
                  backgroundColor: soundEnabled
                    ? currentThemeMeta.palette.primary
                    : undefined,
                }}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    soundEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Ambient Sound Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors shrink-0"
                  style={{
                    backgroundColor: ambientEnabled
                      ? currentThemeMeta.palette.primary
                      : "rgba(0, 0, 0, 0.35)",
                  }}
                >
                  <Waves className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-stone-900">Ambient Atmosphere</p>
                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-stone-100 dark:bg-white/10 text-stone-500 uppercase tracking-wider">
                      {ambientEnabled ? "Playing" : "Off"}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Gentle sanctuary room air &amp; warm harmonic pad
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={ambientEnabled}
                disabled={!soundEnabled}
                onClick={() => {
                  setAmbientEnabled(!ambientEnabled);
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed",
                  ambientEnabled && soundEnabled ? "bg-stone-900" : "bg-stone-200"
                )}
                style={{
                  backgroundColor:
                    ambientEnabled && soundEnabled
                      ? currentThemeMeta.palette.primary
                      : undefined,
                }}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    ambientEnabled && soundEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Volume Card */}
            <div className="p-3.5 rounded-2xl glass-card space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume1 className="w-4 h-4 text-stone-500" />
                  <span className="text-xs font-bold text-stone-900">Volume</span>
                </div>
                <span className="text-xs font-semibold text-stone-600">
                  {soundEnabled ? `${Math.round(soundVolume * 100)}%` : "Muted"}
                </span>
              </div>

              <div className="pt-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  disabled={!soundEnabled}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  onPointerUp={() => playSound("ui-click")}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ accentColor: currentThemeMeta.palette.primary }}
                />
              </div>
            </div>

            {/* Preview Sounds Card */}
            <div className="p-3.5 rounded-2xl glass-card space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block px-0.5">
                Sound Library Preview
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("dream.created")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Dream Added</p>
                    <p className="text-[10px] text-stone-400">Warm Rhodes pluck</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("dream.completed")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Dream Completed</p>
                    <p className="text-[10px] text-stone-400">Emotional chime</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("keepsake.saved")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Keepsake Saved</p>
                    <p className="text-[10px] text-stone-400">Reassuring tone</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("memory.journalSaved")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Journal Saved</p>
                    <p className="text-[10px] text-stone-400">Felted piano</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("theme.changed")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Theme Shimmer</p>
                    <p className="text-[10px] text-stone-400">Glass sweep</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("notification.received")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Notification</p>
                    <p className="text-[10px] text-stone-400">Celestial chime</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              Audio preferences are saved automatically to your device.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
