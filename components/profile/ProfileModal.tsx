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
  Bell,
  BellOff,
  Clock,
  Moon,
  Sun,
  ShieldCheck,
  CheckSquare,
  Receipt,
  AlertTriangle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";
import { useToast } from "@/components/providers/ToastProvider";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
} from "@/lib/notifications/clientPush";

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "profile" | "settings" | "theme" | "sound" | "notifications";
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
    playSound,
  } = useSound();

  const [currentView, setCurrentView] = useState<
    "profile" | "settings" | "theme" | "sound" | "notifications"
  >(initialView);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    notificationsEnabled: false,
    notifyTasks: true,
    notifyCalendar: true,
    notifyBucketList: true,
    notifyExpenses: true,
    notifyDaily: true,
    taskReminderTiming: "15m_before",
    eventReminderTiming: "30m_before",
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });
  const [activeSubCount, setActiveSubCount] = useState<number>(0);
  const [browserPerm, setBrowserPerm] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

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

  // Fetch notification preferences & check browser permission
  useEffect(() => {
    if (isOpen && user) {
      setBrowserPerm(getNotificationPermission());
      fetch("/api/user/preferences")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.preferences) {
            setNotifPrefs((prev) => ({
              ...prev,
              ...data.preferences,
            }));
            setActiveSubCount(data.activeSubscriptionCount || 0);
          }
        })
        .catch((err) => console.error("Notification preferences fetch error:", err));
    }
  }, [isOpen, user]);

  const updatePreference = async (updates: Partial<typeof notifPrefs>) => {
    setNotifPrefs((prev) => ({ ...prev, ...updates }));
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to update notification preferences:", err);
    }
  };

  const handleToggleMasterNotifications = async () => {
    const nextVal = !notifPrefs.notificationsEnabled;
    if (nextVal) {
      setIsSubscribing(true);
      try {
        if (isPushSupported()) {
          const subResult = await subscribeToPush();
          const perm = getNotificationPermission();
          setBrowserPerm(perm);

          if (subResult.success) {
            updatePreference({ notificationsEnabled: true });
            setActiveSubCount((c) => Math.max(1, c + 1));
            toast("Notifications enabled! You'll receive timely alerts.", "system");
          } else {
            if (perm === "denied") {
              toast("Notifications are blocked in your browser settings.", "error");
            } else {
              updatePreference({ notificationsEnabled: true });
              toast("In-app notifications enabled.", "info");
            }
          }
        } else {
          updatePreference({ notificationsEnabled: true });
          toast("In-app notifications enabled.", "info");
        }
      } catch (err) {
        console.error("Master notification toggle error:", err);
      } finally {
        setIsSubscribing(false);
      }
    } else {
      setIsSubscribing(true);
      try {
        await unsubscribeFromPush();
        updatePreference({ notificationsEnabled: false });
        setActiveSubCount(0);
        toast("Notifications paused.", "info");
      } catch (err) {
        console.error("Unsubscribe error:", err);
      } finally {
        setIsSubscribing(false);
      }
    }
  };

  const handleRequestPushPermission = async () => {
    setIsSubscribing(true);
    try {
      const subResult = await subscribeToPush();
      setBrowserPerm(getNotificationPermission());
      if (subResult.success) {
        updatePreference({ notificationsEnabled: true });
        setActiveSubCount((c) => Math.max(1, c + 1));
        toast("Device push notifications successfully enabled!", "system");
      } else {
        toast(subResult.error || "Permission request failed.", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to enable push.", "error");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestNotification = async () => {
    setIsTesting(true);
    setTestResult(null);

    // 1. In-app toast feedback
    toast("DayDream notification system is active & operational!", "system");

    // 2. Dispatch real Web Push
    try {
      const res = await sendTestPush();
      if (res.success) {
        setTestResult({
          success: true,
          message: "Test push sent! Check your device notification tray or desktop alerts.",
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || "Could not dispatch push. Please check device subscription.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error while sending test notification.",
      });
    } finally {
      setIsTesting(false);
    }
  };

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
      maxWidth={currentView === "theme" ? "xl" : currentView === "notifications" ? "lg" : "md"}
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

            <button
              type="button"
              onClick={() => setCurrentView("notifications")}
              className="w-full flex items-center justify-between p-3 rounded-2xl glass-card-interactive transition-all cursor-pointer group shadow-2xs text-left active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors shrink-0"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Notifications</p>
                  <p className="text-[11px] text-stone-500">Push, in-app alerts & reminders</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-600">
                  {notifPrefs.notificationsEnabled ? "Enabled" : "Disabled"}
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
                        onClick={() => setTheme(t.id)}
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
                        onClick={() => setTheme(t.id)}
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
              Calm, minimal audio feedback.
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Subtle, handcrafted acoustic details for key interactions.
            </p>
          </div>

          {/* Sound Controls */}
          <div className="space-y-3 pt-1">
            {/* Toggle Card */}
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
                    Play soft sounds on key actions
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
                Preview Sounds
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("ui-click")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">UI Click</p>
                    <p className="text-[10px] text-stone-400">Soft tactile</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("navigation")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Navigation</p>
                    <p className="text-[10px] text-stone-400">Gentle swell</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("success")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Success</p>
                    <p className="text-[10px] text-stone-400">Warm triad</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("dream-complete")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Dream Complete</p>
                    <p className="text-[10px] text-stone-400">Harmonic shimmer</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("delete")}
                  className="flex items-center gap-2 p-2.5 rounded-xl glass-card-interactive text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-95"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">Delete</p>
                    <p className="text-[10px] text-stone-400">Muted wood tap</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound("notification")}
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

      {/* VIEW 5: NOTIFICATIONS SETTINGS */}
      {currentView === "notifications" && (
        <div className="space-y-4 pt-1 pb-1 animate-fade-in text-left">
          {/* Navigation Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <button
              type="button"
              onClick={() => setCurrentView("profile")}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Profile</span>
            </button>
            <span className="text-xs font-bold text-stone-900">Notifications</span>
          </div>

          {/* 1. Master Switch Card */}
          <div className="p-3.5 rounded-2xl glass-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors shrink-0"
                style={{ backgroundColor: currentThemeMeta.palette.primary }}
              >
                {notifPrefs.notificationsEnabled ? (
                  <Bell className="w-4.5 h-4.5" />
                ) : (
                  <BellOff className="w-4.5 h-4.5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-stone-900">
                    Push & In-App Notifications
                  </p>
                  {activeSubCount > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                      {activeSubCount} {activeSubCount === 1 ? "device" : "devices"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">
                  Global alerts for tasks, events & dreams
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifPrefs.notificationsEnabled}
              disabled={isSubscribing}
              onClick={handleToggleMasterNotifications}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
                notifPrefs.notificationsEnabled ? "bg-stone-900" : "bg-stone-200"
              )}
              style={{
                backgroundColor: notifPrefs.notificationsEnabled
                  ? currentThemeMeta.palette.primary
                  : undefined,
              }}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  notifPrefs.notificationsEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* 2. Browser Permission Status & Advisory */}
          {browserPerm === "denied" && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-stone-700 leading-snug">
                <p className="font-semibold text-stone-900">Notifications are blocked by your browser</p>
                <p className="text-stone-500 mt-0.5">
                  To receive background push alerts on this device, click the lock/settings icon in your browser URL bar and change Notifications to <strong className="text-stone-800">Allow</strong>.
                </p>
              </div>
            </div>
          )}

          {browserPerm === "default" && notifPrefs.notificationsEnabled && (
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-[11px] font-medium text-stone-700">
                  Allow browser push for this device
                </span>
              </div>
              <button
                type="button"
                disabled={isSubscribing}
                onClick={handleRequestPushPermission}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer active:scale-95 transition-transform shrink-0"
                style={{ backgroundColor: currentThemeMeta.palette.primary }}
              >
                {isSubscribing ? "Authorizing..." : "Enable Push"}
              </button>
            </div>
          )}

          {browserPerm === "granted" && notifPrefs.notificationsEnabled && (
            <div className="flex items-center gap-1.5 px-1 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Browser push permissions granted on this device.</span>
            </div>
          )}

          {/* 3. Category Toggles */}
          <div
            className={cn(
              "p-3.5 rounded-2xl glass-card space-y-3 transition-opacity",
              !notifPrefs.notificationsEnabled && "opacity-45 pointer-events-none"
            )}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block px-0.5">
              Notification Categories
            </span>

            <div className="space-y-2.5">
              {/* Tasks */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">To-Do & Tasks</p>
                    <p className="text-[10px] text-stone-400">Due dates, upcoming tasks, overdue task alerts</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifPrefs.notifyTasks}
                  onClick={() => updatePreference({ notifyTasks: !notifPrefs.notifyTasks })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    notifPrefs.notifyTasks ? "bg-stone-900" : "bg-stone-200"
                  )}
                  style={{
                    backgroundColor: notifPrefs.notifyTasks
                      ? currentThemeMeta.palette.primary
                      : undefined,
                  }}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      notifPrefs.notifyTasks ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Calendar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Calendar & Events</p>
                    <p className="text-[10px] text-stone-400">Event reminders and upcoming schedule notices</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifPrefs.notifyCalendar}
                  onClick={() => updatePreference({ notifyCalendar: !notifPrefs.notifyCalendar })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    notifPrefs.notifyCalendar ? "bg-stone-900" : "bg-stone-200"
                  )}
                  style={{
                    backgroundColor: notifPrefs.notifyCalendar
                      ? currentThemeMeta.palette.primary
                      : undefined,
                  }}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      notifPrefs.notifyCalendar ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Bucket List */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Bucket List & Dreams</p>
                    <p className="text-[10px] text-stone-400">Milestone achievements and dream target reminders</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifPrefs.notifyBucketList}
                  onClick={() => updatePreference({ notifyBucketList: !notifPrefs.notifyBucketList })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    notifPrefs.notifyBucketList ? "bg-stone-900" : "bg-stone-200"
                  )}
                  style={{
                    backgroundColor: notifPrefs.notifyBucketList
                      ? currentThemeMeta.palette.primary
                      : undefined,
                  }}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      notifPrefs.notifyBucketList ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Expenses */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Expenses & Finances</p>
                    <p className="text-[10px] text-stone-400">Budget thresholds and financial check-in reminders</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifPrefs.notifyExpenses}
                  onClick={() => updatePreference({ notifyExpenses: !notifPrefs.notifyExpenses })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    notifPrefs.notifyExpenses ? "bg-stone-900" : "bg-stone-200"
                  )}
                  style={{
                    backgroundColor: notifPrefs.notifyExpenses
                      ? currentThemeMeta.palette.primary
                      : undefined,
                  }}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      notifPrefs.notifyExpenses ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Daily DayDream */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-stone-800">Daily DayDream</p>
                    <p className="text-[10px] text-stone-400">Morning focus inspiration and calm daily check-ins</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifPrefs.notifyDaily}
                  onClick={() => updatePreference({ notifyDaily: !notifPrefs.notifyDaily })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    notifPrefs.notifyDaily ? "bg-stone-900" : "bg-stone-200"
                  )}
                  style={{
                    backgroundColor: notifPrefs.notifyDaily
                      ? currentThemeMeta.palette.primary
                      : undefined,
                  }}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                      notifPrefs.notifyDaily ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Reminder Timing Selectors */}
          <div
            className={cn(
              "p-3.5 rounded-2xl glass-card space-y-3 transition-opacity",
              !notifPrefs.notificationsEnabled && "opacity-45 pointer-events-none"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Reminder Timing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">
                  Task Reminders
                </label>
                <select
                  value={notifPrefs.taskReminderTiming}
                  onChange={(e) => updatePreference({ taskReminderTiming: e.target.value })}
                  className="w-full bg-stone-100/90 border border-stone-200/80 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  <option value="at_time">At time of task</option>
                  <option value="5m_before">5 minutes before</option>
                  <option value="15m_before">15 minutes before (Default)</option>
                  <option value="30m_before">30 minutes before</option>
                  <option value="1h_before">1 hour before</option>
                  <option value="morning_of">Morning of (9:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 block mb-1">
                  Calendar Event Reminders
                </label>
                <select
                  value={notifPrefs.eventReminderTiming}
                  onChange={(e) => updatePreference({ eventReminderTiming: e.target.value })}
                  className="w-full bg-stone-100/90 border border-stone-200/80 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  <option value="at_time">At event start</option>
                  <option value="15m_before">15 minutes before</option>
                  <option value="30m_before">30 minutes before (Default)</option>
                  <option value="1h_before">1 hour before</option>
                  <option value="2h_before">2 hours before</option>
                  <option value="1d_before">1 day before</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Quiet Hours */}
          <div
            className={cn(
              "p-3.5 rounded-2xl glass-card space-y-3 transition-opacity",
              !notifPrefs.notificationsEnabled && "opacity-45 pointer-events-none"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-stone-400" />
                <div>
                  <p className="text-xs font-semibold text-stone-800">Quiet Hours</p>
                  <p className="text-[10px] text-stone-400">Pause push alerts while resting or sleeping</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifPrefs.quietHoursEnabled}
                onClick={() => updatePreference({ quietHoursEnabled: !notifPrefs.quietHoursEnabled })}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  notifPrefs.quietHoursEnabled ? "bg-stone-900" : "bg-stone-200"
                )}
                style={{
                  backgroundColor: notifPrefs.quietHoursEnabled
                    ? currentThemeMeta.palette.primary
                    : undefined,
                }}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200",
                    notifPrefs.quietHoursEnabled ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {notifPrefs.quietHoursEnabled && (
              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">From</span>
                  <input
                    type="time"
                    value={notifPrefs.quietHoursStart}
                    onChange={(e) => updatePreference({ quietHoursStart: e.target.value })}
                    className="bg-stone-100/90 border border-stone-200/80 rounded-xl px-2.5 py-1 text-xs font-medium text-stone-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">To</span>
                  <input
                    type="time"
                    value={notifPrefs.quietHoursEnd}
                    onChange={(e) => updatePreference({ quietHoursEnd: e.target.value })}
                    className="bg-stone-100/90 border border-stone-200/80 rounded-xl px-2.5 py-1 text-xs font-medium text-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Test Notification Trigger */}
          <div className="p-3.5 rounded-2xl glass-card space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900">Notification Test</p>
                <p className="text-[11px] text-stone-500">
                  Verify in-app toast alerts & background Web Push
                </p>
              </div>
              <button
                type="button"
                disabled={isTesting}
                onClick={handleSendTestNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: currentThemeMeta.palette.primary }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTesting ? "Sending..." : "Send Test Alert"}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={cn(
                  "p-2.5 rounded-xl text-[11px] font-medium leading-snug mt-1",
                  testResult.success
                    ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                )}
              >
                {testResult.success ? "✓ " : "⚠ "}
                {testResult.message}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              Notification preferences sync seamlessly across your account.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
