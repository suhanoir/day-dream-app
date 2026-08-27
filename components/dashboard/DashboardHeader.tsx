"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Compass, LogOut, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Slogan */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-stone-900">
              BucketList
            </span>
            <span className="hidden md:inline-block ml-3 text-xs text-stone-500 font-normal italic">
              — Make memories worth remembering.
            </span>
          </div>
        </div>

        {/* User profile / Logout menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-100/80 transition-colors border border-transparent hover:border-stone-200 text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-stone-200/90 text-stone-700 flex items-center justify-center text-xs font-semibold">
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200/90 rounded-2xl shadow-xl z-30 p-2 text-xs animate-fade-in">
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="font-semibold text-stone-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

