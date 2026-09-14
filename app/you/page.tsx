"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { APP_VERSION } from "@/lib/config/version";
import {
  User,
  Mail,
  Calendar,
  Sparkles,
  Palette,
  Volume2,
  VolumeX,
  Volume1,
  Moon,
  Sun,
  Waves,
  Check,
  LogOut,
  Info,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function YouPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
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

  const [activeTab, setActiveTab] = useState<"profile" | "themes" | "sounds" | "about">("profile");

  const [stats, setStats] = useState<{
    totalGoals: number;
    completedGoals: number;
    totalEvents: number;
  }>({
    totalGoals: 0,
    completedGoals: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    if (user) {
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
        .catch((err) => console.error("You stats error:", err));
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <AppShell title="You">
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 text-muted animate-spin mb-3" />
          <p className="text-xs text-muted font-medium">Loading preferences...</p>
        </div>
      </AppShell>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  // Filter 6 light + 6 dark themes
  const lightThemes = themes.filter((t) => t.mode === "light");
  const darkThemes = themes.filter((t) => t.mode === "dark");

  return (
    <AppShell title="You">
      <div className="space-y-6 max-w-3xl">
        {/* Page Top Header */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary font-serif-heading leading-tight">
            You & Settings
          </h1>
          <p className="text-xs sm:text-sm text-secondary">
            Personalize DayDream to feel, look, and sound exactly how you want.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-stone-200/60 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
          {(
            [
              { key: "profile", label: "Profile", icon: User },
              { key: "themes", label: "Appearance", icon: Palette },
              { key: "sounds", label: "Audio & Sounds", icon: Volume2 },
              { key: "about", label: "About", icon: Info },
            ] as const
          ).map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0",
                  isActive
                    ? "glass-tab-active shadow-xs font-bold text-primary"
                    : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/5"
                )}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in">
            {/* User Identity Card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div
                className="w-18 h-18 rounded-full text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0"
                style={{ backgroundColor: currentThemeMeta.palette.primary }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-xl font-bold text-primary truncate">
                  {user.name}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-secondary">
                  <Mail className="w-3.5 h-3.5 text-muted" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted pt-1">
                  <Calendar className="w-3.5 h-3.5 text-muted" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Life Milestone Statistics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="glass-card rounded-2xl p-4">
                <span className="text-2xl font-bold text-primary block">
                  {stats.totalGoals}
                </span>
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Total Dreams
                </span>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
                  {stats.completedGoals}
                </span>
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Memories Lived
                </span>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <span className="text-2xl font-bold text-primary block">
                  {stats.totalEvents}
                </span>
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Scheduled Events
                </span>
              </div>
            </div>

            {/* Account & Sign Out */}
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">Sign Out</span>
                <span className="text-xs text-muted">
                  End your current session on this device
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: APPEARANCE / THEMES */}
        {activeTab === "themes" && (
          <div className="space-y-6 animate-fade-in">
            {/* Light Themes */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Themes (6)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lightThemes.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        playSound("theme.changed");
                        toast(`Theme changed to ${t.name}`);
                      }}
                      className={cn(
                        "p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between h-24 active:scale-98",
                        isSelected
                          ? "ring-2 ring-[var(--theme-primary)] shadow-md bg-white dark:bg-stone-900 border-transparent"
                          : "glass-card-interactive border-stone-200/70 dark:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-primary">{t.name}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Palette Swatches */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full shadow-2xs"
                          style={{ backgroundColor: t.palette.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full shadow-2xs"
                          style={{ backgroundColor: t.palette.secondary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full shadow-2xs"
                          style={{ backgroundColor: t.palette.accent }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dark Themes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark Themes (6)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {darkThemes.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        playSound("theme.changed");
                        toast(`Theme changed to ${t.name}`);
                      }}
                      className={cn(
                        "p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between h-24 active:scale-98",
                        isSelected
                          ? "ring-2 ring-[var(--theme-primary)] shadow-md bg-stone-900 text-white border-transparent"
                          : "glass-card-interactive border-stone-200/70 dark:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-primary">{t.name}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Palette Swatches */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full shadow-2xs"
                          style={{ backgroundColor: t.palette.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full shadow-2xs"
                          style={{ backgroundColor: t.palette.secondary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full shadow-2xs"
                          style={{ backgroundColor: t.palette.accent }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO & SOUNDS */}
        {activeTab === "sounds" && (
          <div className="space-y-5 animate-fade-in">
            {/* Sound Effects Toggle */}
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-primary block">
                  Sound Effects
                </span>
                <p className="text-xs text-muted">
                  Calm, tactile audio feedback on completion and meaningful milestones
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  playSound("ui-click");
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  soundEnabled ? "bg-[var(--theme-primary)]" : "bg-stone-300 dark:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    soundEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Ambient Sound Mode */}
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-muted" />
                  <span className="text-xs font-bold text-primary">
                    Atmospheric Ambient Pad
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Gentle, continuous background soundscape for calm contemplation
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAmbientEnabled(!ambientEnabled);
                  playSound("ui-click");
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  ambientEnabled ? "bg-[var(--theme-primary)]" : "bg-stone-300 dark:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    ambientEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="glass-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">Master Volume</span>
                <span className="font-semibold text-muted">
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
              />
            </div>

            {/* Sound Library Preview */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary block">
                Sound Library Preview
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { name: "Dream Created", event: "dream.created" as const },
                    { name: "Dream Achieved", event: "dream.completed" as const },
                    { name: "Memory Sealed", event: "keepsake.saved" as const },
                    { name: "Memory Shutter", event: "memory.photoAdded" as const },
                    { name: "Acoustic Journal", event: "memory.journalSaved" as const },
                    { name: "Glass Shimmer", event: "theme.changed" as const },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => playSound(s.event)}
                    className="p-2.5 rounded-xl glass-card-interactive font-medium text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>{s.name}</span>
                    <Volume2 className="w-3 h-3 text-muted" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT */}
        {activeTab === "about" && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-primary font-serif-heading">
                  DayDream
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md glass-card text-secondary border border-stone-200/70 dark:border-white/10">
                  {APP_VERSION}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                A calm, personal application structured around the life journey:
              </p>

              <div className="p-3 rounded-xl bg-stone-50/60 dark:bg-white/5 border border-stone-200/50 dark:border-white/10 text-xs font-bold text-primary tracking-widest text-center">
                DREAM → PLAN → DO → LIVE → REMEMBER
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Designed and engineered with Liquid Glass aesthetics, 12 handcrafted color themes,
                harmonically synthesized acoustics, and privacy-first data isolation.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
