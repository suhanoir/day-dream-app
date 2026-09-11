"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Calendar as CalendarIcon,
  ListTodo,
  Receipt,
  Sparkles,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import { BucketIcon } from "@/components/ui/BucketIcon";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";

interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    name: "Home",
    href: "/home",
    icon: HomeIcon,
    isActive: (pathname: string) => pathname === "/home",
  },
  {
    name: "BucketList",
    href: "/dashboard",
    icon: BucketIcon,
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarIcon,
    isActive: (pathname: string) => pathname === "/calendar",
  },
  {
    name: "To-Do",
    href: "/todo",
    icon: ListTodo,
    isActive: (pathname: string) =>
      pathname === "/todo" || pathname === "/to-do-list",
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
    isActive: (pathname: string) => pathname === "/expenses",
  },
  {
    name: "Memories",
    href: "/memories",
    icon: Sparkles,
    isActive: (pathname: string) => pathname === "/memories",
  },
];

export function FloatingNav() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  // Identify current section
  const currentSection = NAV_ITEMS.find((item) => item.isActive(pathname));
  const isHome = pathname === "/home";

  // Automatically close expanded menu when user navigates
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Escape key to collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  const CurrentSectionIcon = currentSection?.icon || Menu;

  return (
    <div
      ref={containerRef}
      role="navigation"
      aria-label="Floating Navigation"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] inset-x-0 mx-auto w-fit z-40 max-w-[calc(100vw-1.5rem)] select-none"
    >
      <div
        className={cn(
          "liquid-glass-dock rounded-full p-1.5 flex items-center transition-all duration-300 ease-out overflow-x-auto no-scrollbar",
          isExpanded ? "gap-1 sm:gap-1.5 shadow-2xl" : "gap-1.5 shadow-lg"
        )}
      >
        {/* ========================================================= */}
        {/* COLLAPSED STATE: Exactly Two Items                        */}
        {/* ========================================================= */}
        {!isExpanded ? (
          <>
            {/* Button 1: Home (Always present) */}
            <Link
              href="/home"
              aria-label="Home"
              onClick={() => {
                if (!isHome) playSound("navigation");
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer active:scale-95",
                isHome
                  ? "glass-tab-active"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 border border-transparent"
              )}
            >
              <HomeIcon className="w-4 h-4 shrink-0" />
              <span>Home</span>
            </Link>

            {/* Button 2: Dynamic Trigger */}
            {isHome ? (
              // On Home: Show clean "Menu / ☰" button
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(true);
                  playSound("ui-click");
                }}
                aria-label="Open navigation menu"
                aria-expanded={isExpanded}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100/70 border border-transparent transition-all cursor-pointer active:scale-95"
              >
                <Menu className="w-4 h-4 text-stone-500" />
                <span>Menu</span>
              </button>
            ) : (
              // On Non-Home: Show Current Section with expand indicator
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(true);
                  playSound("ui-click");
                }}
                aria-label={`Open navigation menu. Currently on ${currentSection?.name || "section"}`}
                aria-expanded={isExpanded}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold glass-tab-active transition-all cursor-pointer group active:scale-95"
              >
                <CurrentSectionIcon className="w-4 h-4 shrink-0" />
                <span>{currentSection?.name}</span>
                <ChevronUp className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform shrink-0" />
              </button>
            )}
          </>
        ) : (
          /* ========================================================= */
          /* EXPANDED STATE: All 5 Sections + Close Button             */
          /* ========================================================= */
          <>
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              const ItemIcon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setIsExpanded(false);
                    if (!active) playSound("navigation");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-xs transition-all shrink-0 cursor-pointer active:scale-95",
                    active
                      ? "glass-tab-active"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 border border-transparent font-medium"
                  )}
                  title={item.name}
                >
                  <ItemIcon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}

            {/* Dedicated Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                playSound("ui-click");
              }}
              aria-label="Close navigation menu"
              title="Close menu"
              className="flex items-center justify-center w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100/90 transition-all cursor-pointer ml-0.5 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

