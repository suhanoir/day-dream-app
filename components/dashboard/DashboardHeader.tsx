"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { User, LogOut, Palette, Volume2, VolumeX, Sparkles } from "lucide-react";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { FloatingNav } from "@/components/navigation/FloatingNav";
import { APP_VERSION } from "@/lib/config/version";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { currentThemeMeta } = useTheme();

  const { enabled: soundEnabled, volume: soundVolume } = useSound();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalView, setProfileModalView] = useState<
    "profile" | "settings" | "theme" | "sound"
  >("profile");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="w-full glass-panel sticky top-0 z-40 border-b border-stone-200/60 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Version */}
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="group-hover:scale-105 transition-transform">
              <DayDreamLogo size={36} className="w-9 h-9 shadow-xs" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-primary">
                DayDream
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md glass-card text-secondary border border-stone-200/70 dark:border-white/10">
                {APP_VERSION}
              </span>
            </div>
          </Link>

          {/* User profile / Logout menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-100/60 dark:hover:bg-white/10 transition-all border border-transparent hover:border-stone-200/80 dark:hover:border-white/10 text-left cursor-pointer active:scale-98"
              >
                <div
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-2xs transition-colors"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-secondary max-w-[120px] truncate">
                  {user?.name || "My Account"}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 glass-dropdown z-30 p-2 text-xs animate-fade-in shadow-lg">
                    {/* User Information */}
                    <div className="px-3 py-2 border-b border-stone-200/50 dark:border-stone-800/80 mb-1">
                      <p className="font-semibold text-primary truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Main Actions: Profile, Theme, Sounds */}
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setProfileModalView("profile");
                          setShowProfileModal(true);
                        }}
                        className="w-full px-3 py-2 text-left text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer active:scale-98"
                      >
                        <User className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setProfileModalView("theme");
                          setShowProfileModal(true);
                        }}
                        className="w-full px-3 py-2 text-left text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10 rounded-xl flex items-center justify-between font-medium transition-colors cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span>Theme</span>
                        </div>
                        <span className="text-[10px] font-semibold text-secondary bg-stone-100/90 dark:bg-white/10 border border-stone-200/50 dark:border-white/10 px-1.5 py-0.5 rounded">
                          {currentThemeMeta.name.split(" ")[0]}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setProfileModalView("sound");
                          setShowProfileModal(true);
                        }}
                        className="w-full px-3 py-2 text-left text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10 rounded-xl flex items-center justify-between font-medium transition-colors cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          {soundEnabled ? (
                            <Volume2 className="w-3.5 h-3.5 text-muted shrink-0" />
                          ) : (
                            <VolumeX className="w-3.5 h-3.5 text-muted shrink-0" />
                          )}
                          <span>Sounds</span>
                        </div>
                        <span className="text-[10px] font-semibold text-secondary bg-stone-100/90 dark:bg-white/10 border border-stone-200/50 dark:border-white/10 px-1.5 py-0.5 rounded">
                          {soundEnabled ? `${Math.round(soundVolume * 100)}%` : "Off"}
                        </span>
                      </button>

                      <Link
                        href="/memories"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full px-3 py-2 text-left text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10 rounded-xl flex items-center justify-between font-medium transition-colors cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Scrapbook</span>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          Memories
                        </span>
                      </Link>
                    </div>

                    {/* Separator */}
                    <div className="my-1 border-t border-stone-200/50 dark:border-stone-800/80" />

                    {/* Account / Danger Action */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer active:scale-98"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating Liquid-Glass Bottom Navigation */}
      <FloatingNav />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialView={profileModalView}
      />
    </>
  );
}
