"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Home as HomeIcon,
  Calendar as CalendarIcon,
  User,
  LogOut,
  ListTodo,
  Receipt,
  Palette,
} from "lucide-react";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { BucketIcon } from "@/components/ui/BucketIcon";
import { APP_VERSION } from "@/lib/config/version";
import { cn } from "@/lib/utils/cn";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { currentThemeMeta } = useTheme();
  const pathname = usePathname();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalView, setProfileModalView] = useState<
    "profile" | "settings" | "theme"
  >("profile");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isHome = pathname === "/home";
  const isDashboard = pathname === "/dashboard";
  const isCalendar = pathname === "/calendar";
  const isTodo = pathname === "/todo" || pathname === "/to-do-list";
  const isExpenses = pathname === "/expenses";

  return (
    <>
      <header className="w-full bg-white/85 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Main Navigation */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/home" className="flex items-center gap-2.5 group">
              <div className="group-hover:scale-105 transition-transform">
                <DayDreamLogo size={36} className="w-9 h-9 shadow-xs" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-stone-900">
                  DayDream
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200/80">
                  {APP_VERSION}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60 text-xs font-medium">
              <Link
                href="/home"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all",
                  isHome
                    ? "bg-white text-[var(--theme-primary)] shadow-2xs font-bold border border-stone-200/60"
                    : "text-stone-600 hover:text-stone-900"
                )}
                title="Home"
              >
                <HomeIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Home</span>
              </Link>

              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all",
                  isDashboard
                    ? "bg-white text-[var(--theme-primary)] shadow-2xs font-bold border border-stone-200/60"
                    : "text-stone-600 hover:text-stone-900"
                )}
                title="BucketList"
              >
                <BucketIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">BucketList</span>
              </Link>

              <Link
                href="/calendar"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all",
                  isCalendar
                    ? "bg-white text-[var(--theme-primary)] shadow-2xs font-bold border border-stone-200/60"
                    : "text-stone-600 hover:text-stone-900"
                )}
                title="Calendar"
              >
                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Calendar</span>
              </Link>

              <Link
                href="/todo"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all",
                  isTodo
                    ? "bg-white text-[var(--theme-primary)] shadow-2xs font-bold border border-stone-200/60"
                    : "text-stone-600 hover:text-stone-900"
                )}
                title="To-Do List"
              >
                <ListTodo className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">To-Do List</span>
              </Link>

              <Link
                href="/expenses"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all",
                  isExpenses
                    ? "bg-white text-[var(--theme-primary)] shadow-2xs font-bold border border-stone-200/60"
                    : "text-stone-600 hover:text-stone-900"
                )}
                title="Expenses"
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Expenses</span>
              </Link>
            </nav>
          </div>

          {/* User profile / Logout menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-100/80 transition-colors border border-transparent hover:border-stone-200 text-left cursor-pointer"
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
                        setProfileModalView("profile");
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer"
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
                      className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50 rounded-xl flex items-center justify-between font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-stone-400" />
                        <span>Settings & Theme</span>
                      </div>
                      <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                        {currentThemeMeta.name.split(" ")[0]}
                      </span>
                    </button>

                    <div className="my-1 border-t border-stone-100" />

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
        </div>

        {/* Mobile Sub-Navigation Bar — Compact Icon-Only with Hover Tooltips */}
        <div className="sm:hidden border-t border-stone-100 px-3 py-1.5 flex items-center justify-around bg-stone-50/90 backdrop-blur-md">
          {/* Home */}
          <div className="relative group">
            <Link
              href="/home"
              aria-label="Home"
              title="Home"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                isHome
                  ? "bg-white text-[var(--theme-primary)] shadow-2xs border border-stone-200/90 font-bold"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              )}
            >
              <HomeIcon className="w-4.5 h-4.5" />
            </Link>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md z-50">
              Home
            </div>
          </div>

          {/* BucketList */}
          <div className="relative group">
            <Link
              href="/dashboard"
              aria-label="BucketList"
              title="BucketList"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                isDashboard
                  ? "bg-white text-[var(--theme-primary)] shadow-2xs border border-stone-200/90 font-bold"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              )}
            >
              <BucketIcon className="w-4.5 h-4.5" />
            </Link>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md z-50">
              BucketList
            </div>
          </div>

          {/* Calendar */}
          <div className="relative group">
            <Link
              href="/calendar"
              aria-label="Calendar"
              title="Calendar"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                isCalendar
                  ? "bg-white text-[var(--theme-primary)] shadow-2xs border border-stone-200/90 font-bold"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              )}
            >
              <CalendarIcon className="w-4.5 h-4.5" />
            </Link>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md z-50">
              Calendar
            </div>
          </div>

          {/* To-Do List */}
          <div className="relative group">
            <Link
              href="/todo"
              aria-label="To-Do List"
              title="To-Do List"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                isTodo
                  ? "bg-white text-[var(--theme-primary)] shadow-2xs border border-stone-200/90 font-bold"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              )}
            >
              <ListTodo className="w-4.5 h-4.5" />
            </Link>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md z-50">
              To-Do List
            </div>
          </div>

          {/* Expenses */}
          <div className="relative group">
            <Link
              href="/expenses"
              aria-label="Expenses"
              title="Expenses"
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                isExpenses
                  ? "bg-white text-[var(--theme-primary)] shadow-2xs border border-stone-200/90 font-bold"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              )}
            >
              <Receipt className="w-4.5 h-4.5" />
            </Link>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md z-50">
              Expenses
            </div>
          </div>

          {/* Profile */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                setProfileModalView("profile");
                setShowProfileModal(true);
              }}
              aria-label="Profile"
              title="Profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 cursor-pointer"
            >
              <User className="w-4.5 h-4.5" />
            </button>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-medium whitespace-nowrap shadow-md z-50">
              Profile
            </div>
          </div>
        </div>
      </header>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialView={profileModalView}
      />
    </>
  );
}
