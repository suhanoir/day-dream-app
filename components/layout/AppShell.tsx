"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Moon,
  Sun,
  Sparkles,
  Calendar as CalendarIcon,
  Receipt,
  User as UserIcon,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { FloatingNav } from "@/components/navigation/FloatingNav";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { APP_VERSION } from "@/lib/config/version";
import { cn } from "@/lib/utils/cn";

export interface AppShellProps {
  children: ReactNode;
  /** Optional breadcrumbs or page title override */
  title?: string;
  /** Optional secondary contextual side panel on large screens */
  sidePanel?: ReactNode;
}

export function AppShell({ children, title, sidePanel }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { currentThemeMeta } = useTheme();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileDrawerOpen]);

  const isCurrent = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const primaryNav = [
    {
      name: "Home",
      href: "/home",
      icon: HomeIcon,
      active: pathname === "/home",
      description: "What is happening today",
    },
    {
      name: "Dreams",
      href: "/dreams",
      icon: Moon,
      active:
        pathname === "/dreams" ||
        pathname === "/dashboard" ||
        pathname.startsWith("/dreams/"),
      description: "Aspirations & milestones",
    },
    {
      name: "Today",
      href: "/today",
      icon: Sun,
      active:
        pathname === "/today" ||
        pathname === "/todo" ||
        pathname === "/to-do-list",
      description: "Actionable tasks",
    },
    {
      name: "Memories",
      href: "/memories",
      icon: Sparkles,
      active: pathname === "/memories" || pathname.startsWith("/memories/"),
      description: "Lived experiences & scrapbook",
    },
  ];

  const secondaryTools = [
    {
      name: "Expenses",
      href: "/expenses",
      icon: Receipt,
      active: pathname === "/expenses",
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: CalendarIcon,
      active: pathname === "/calendar",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-bg,#FAFAF8)] text-[var(--theme-text,#20242C)] flex flex-col selection:bg-[var(--theme-primary,#4F5FD7)] selection:text-white">
      {/* ============================================================= */}
      {/* DESKTOP SIDEBAR (lg:flex)                                     */}
      {/* ============================================================= */}
      <aside
        aria-label="Desktop Sidebar"
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-40 glass-panel border-r border-stone-200/70 dark:border-white/10 select-none"
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-stone-200/50 dark:border-white/10">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="group-hover:scale-105 transition-transform">
              <DayDreamLogo size={32} className="w-8 h-8 shadow-2xs" />
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
        </div>

        {/* Navigation list */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3.5 py-4 space-y-6 no-scrollbar">
          <div className="space-y-6">
            {/* Primary Destinations */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Destinations
              </span>
              {primaryNav.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer active:scale-98",
                      item.active
                        ? "glass-tab-active font-semibold shadow-xs"
                        : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/5"
                    )}
                  >
                    <ItemIcon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        item.active
                          ? "text-[var(--theme-primary)]"
                          : "text-muted group-hover:text-primary"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Planning & Secondary Tools */}
            <div className="space-y-1 pt-2 border-t border-stone-200/50 dark:border-white/5">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Planning Tools
              </span>
              {secondaryTools.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer active:scale-98",
                      item.active
                        ? "glass-tab-active font-semibold shadow-xs"
                        : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/5"
                    )}
                  >
                    <ItemIcon
                      className={cn(
                        "w-3.5 h-3.5 shrink-0 transition-colors",
                        item.active
                          ? "text-[var(--theme-primary)]"
                          : "text-muted group-hover:text-primary"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Anchor ("You") */}
          <div className="pt-3 border-t border-stone-200/50 dark:border-white/10 space-y-1">
            <Link
              href="/you"
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl transition-all group cursor-pointer active:scale-98",
                isCurrent("/you")
                  ? "glass-tab-active font-semibold shadow-xs"
                  : "hover:bg-stone-100/70 dark:hover:bg-white/5 text-secondary hover:text-primary"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs transition-colors"
                  style={{ backgroundColor: currentThemeMeta.palette.primary }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-primary truncate">
                    {user?.name || "You"}
                  </p>
                  <p className="text-[10.5px] text-muted truncate">
                    {currentThemeMeta.name.split(" ")[0]} theme
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ============================================================= */}
      {/* MOBILE TOP BAR (lg:hidden)                                    */}
      {/* ============================================================= */}
      <header className="lg:hidden w-full glass-panel sticky top-0 z-30 border-b border-stone-200/60 dark:border-white/10 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 -ml-1 text-muted hover:text-primary rounded-xl hover:bg-stone-100/70 dark:hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/home" className="flex items-center gap-2">
            <DayDreamLogo size={28} className="w-7 h-7" />
            <span className="text-sm font-bold tracking-tight text-primary">
              DayDream
            </span>
          </Link>
        </div>

        {title && (
          <span className="text-xs font-semibold text-secondary truncate max-w-[130px]">
            {title}
          </span>
        )}

        <Link
          href="/you"
          className="flex items-center gap-1.5 p-1 rounded-full cursor-pointer"
          aria-label="Your Profile"
        >
          <div
            className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-2xs"
            style={{ backgroundColor: currentThemeMeta.palette.primary }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </Link>
      </header>

      {/* ============================================================= */}
      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER (lg:hidden)              */}
      {/* ============================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] glass-panel border-r border-stone-200/70 dark:border-white/10 shadow-2xl flex flex-col justify-between p-5 z-10 animate-fade-in overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-white/10 pb-3">
                <Link
                  href="/home"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <DayDreamLogo size={28} className="w-7 h-7" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-primary">DayDream</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md glass-card text-secondary border border-stone-200/70 dark:border-white/10">
                      {APP_VERSION}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-muted hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/10 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Banner */}
              <Link
                href="/you"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-3 rounded-2xl glass-card-interactive flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                    style={{ backgroundColor: currentThemeMeta.palette.primary }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">
                      {user?.name || "Your Profile"}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {user?.email || "View Settings"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted shrink-0" />
              </Link>

              {/* Destinations */}
              <div className="space-y-1">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Destinations
                </span>
                {primaryNav.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-98",
                        item.active
                          ? "glass-tab-active font-semibold shadow-xs"
                          : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/5"
                      )}
                    >
                      <ItemIcon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          item.active
                            ? "text-[var(--theme-primary)]"
                            : "text-muted"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Planning Tools */}
              <div className="space-y-1 pt-2 border-t border-stone-200/50 dark:border-white/10">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Planning Tools
                </span>
                {secondaryTools.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-98",
                        item.active
                          ? "glass-tab-active font-semibold shadow-xs"
                          : "text-secondary hover:text-primary hover:bg-stone-100/70 dark:hover:bg-white/5"
                      )}
                    >
                      <ItemIcon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          item.active
                            ? "text-[var(--theme-primary)]"
                            : "text-muted"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-stone-200/50 dark:border-white/10 space-y-2">
              <Link
                href="/you"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-stone-100/60 dark:hover:bg-white/5"
              >
                <span>Theme & Settings</span>
                <span className="text-[11px] text-muted font-normal">
                  {currentThemeMeta.name.split(" ")[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MAIN VIEWPORT CONTAINER                                       */}
      {/* ============================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col xl:flex-row gap-6 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 sm:pb-28">
          {/* Central Main View */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {children}
          </main>

          {/* Optional Desktop Contextual Side Panel */}
          {sidePanel && (
            <aside
              aria-label="Context Panel"
              className="hidden xl:block w-80 shrink-0 space-y-6"
            >
              {sidePanel}
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <FloatingNav />
    </div>
  );
}

export default AppShell;

