"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Compass, Calendar as CalendarIcon, Target, User, LogOut, ListTodo } from "lucide-react";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { cn } from "@/lib/utils/cn";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isDashboard = pathname === "/dashboard";
  const isCalendar = pathname === "/calendar";
  const isTodo = pathname === "/todo" || pathname === "/to-do-list";

  return (
    <>
      <header className="w-full bg-white/85 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Main Navigation */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-stone-900">
                  BucketList
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200/80">
                  v1.3.2
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60 text-xs font-medium">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                  isDashboard
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <Target className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              <Link
                href="/calendar"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                  isCalendar
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </Link>

              <Link
                href="/todo"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                  isTodo
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <ListTodo className="w-3.5 h-3.5" />
                To-Do List
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
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50 rounded-xl flex items-center gap-2 font-medium transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      View Profile
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

        {/* Mobile Sub-Navigation Bar */}
        <div className="sm:hidden border-t border-stone-100 px-4 py-2 flex items-center justify-around bg-stone-50/60 text-xs">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium",
              isDashboard ? "text-stone-900 font-semibold bg-stone-200/60" : "text-stone-500"
            )}
          >
            <Target className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/calendar"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium",
              isCalendar ? "text-stone-900 font-semibold bg-stone-200/60" : "text-stone-500"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar
          </Link>
          <Link
            href="/todo"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium",
              isTodo ? "text-stone-900 font-semibold bg-stone-200/60" : "text-stone-500"
            )}
          >
            <ListTodo className="w-3.5 h-3.5" />
            To-Do List
          </Link>
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium text-stone-500 hover:text-stone-900"
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
