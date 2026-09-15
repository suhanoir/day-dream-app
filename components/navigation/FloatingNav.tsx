"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Moon,
  Sun,
  Receipt,
  Calendar as CalendarIcon,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
}

export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    name: "Home",
    href: "/home",
    icon: HomeIcon,
    isActive: (pathname: string) => pathname === "/home",
  },
  {
    name: "Dreams",
    href: "/dreams",
    icon: Moon,
    isActive: (pathname: string) =>
      pathname === "/dreams" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dreams/"),
  },
  {
    name: "Today",
    href: "/today",
    icon: Sun,
    isActive: (pathname: string) =>
      pathname === "/today" ||
      pathname === "/todo" ||
      pathname === "/to-do-list",
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
    isActive: (pathname: string) =>
      pathname === "/expenses" || pathname.startsWith("/expenses/"),
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarIcon,
    isActive: (pathname: string) =>
      pathname === "/calendar" || pathname.startsWith("/calendar/"),
  },
  {
    name: "Memories",
    href: "/memories",
    icon: Sparkles,
    isActive: (pathname: string) =>
      pathname === "/memories" || pathname.startsWith("/memories/"),
  },
  {
    name: "You",
    href: "/you",
    icon: UserIcon,
    isActive: (pathname: string) =>
      pathname === "/you" || pathname.startsWith("/you/"),
  },
];

export function FloatingNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Primary Navigation"
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-0 mx-auto w-[calc(100vw-1rem)] max-w-lg z-40 select-none lg:hidden"
    >
      <div className="liquid-glass-dock rounded-2xl sm:rounded-full p-1 sm:p-1.5 flex items-center justify-between gap-0.5 sm:gap-1 shadow-2xl transition-all duration-300 ease-out">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const ItemIcon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-xl sm:rounded-full transition-all flex-1 min-w-0 cursor-pointer active:scale-95",
                active
                  ? "glass-tab-active font-semibold shadow-xs text-primary"
                  : "text-muted hover:text-primary hover:bg-stone-100/60 dark:hover:bg-white/10 font-medium"
              )}
            >
              <ItemIcon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform",
                  active && "scale-110 text-[var(--theme-primary)]"
                )}
              />
              <span className="text-[10px] sm:text-xs leading-none tracking-tight truncate max-w-full text-center">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default FloatingNav;
