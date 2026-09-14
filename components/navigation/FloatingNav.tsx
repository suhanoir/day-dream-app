"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Moon,
  Sun,
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
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] inset-x-0 mx-auto w-fit z-40 max-w-[calc(100vw-1.25rem)] select-none lg:hidden"
    >
      <div className="liquid-glass-dock rounded-full p-1.5 flex items-center gap-1 sm:gap-1.5 shadow-xl transition-all duration-300 ease-out overflow-x-auto no-scrollbar">
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
                "flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs transition-all shrink-0 cursor-pointer active:scale-95",
                active
                  ? "glass-tab-active font-semibold shadow-xs"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-white/10 border border-transparent font-medium"
              )}
            >
              <ItemIcon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform",
                  active && "scale-110 text-[var(--theme-primary)]"
                )}
              />
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default FloatingNav;
