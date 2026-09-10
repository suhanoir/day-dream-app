"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { User, LogOut, Palette } from "lucide-react";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { FloatingNav } from "@/components/navigation/FloatingNav";
import { APP_VERSION } from "@/lib/config/version";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { currentThemeMeta } = useTheme();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalView, setProfileModalView] = useState<
    "profile" | "settings" | "theme"
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
              <span className="text-base font-bold tracking-tight text-stone-900">
                DayDream
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md glass-card text-stone-600 border border-stone-200/70">
                {APP_VERSION}
              </span>
            </div>
          </Link>

          {/* User profile / Logout menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-100/60 transition-all border border-transparent hover:border-stone-200/80 text-left cursor-pointer active:scale-98"
              >
                <div
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-2xs transition-colors"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-stone-800 max-w-[120px] truncate">
                  {user?.name || "My Account"}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 glass-dropdown z-30 p-2 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-stone-200/50 mb-1">
                      <p className="font-semibold text-stone-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setProfileModalView("profile");
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-100/70 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer active:scale-98"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setProfileModalView("settings");
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-100/70 rounded-xl flex items-center justify-between font-medium transition-colors cursor-pointer active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-stone-400" />
                        <span>Settings & Theme</span>
                      </div>
                      <span className="text-[10px] font-semibold text-stone-600 bg-stone-100/90 border border-stone-200/50 px-1.5 py-0.5 rounded">
                        {currentThemeMeta.name.split(" ")[0]}
                      </span>
                    </button>

                    <div className="my-1 border-t border-stone-200/50" />

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer active:scale-98"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
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
