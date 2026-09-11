"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  Heart,
  Globe,
  Quote,
  Bell,
  Volume2,
  Palette,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Plane,
  Briefcase,
  Layers,
  Star,
  MapPin,
  CalendarPlus,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DayDreamLogo } from "@/components/ui/DayDreamLogo";
import { APP_VERSION } from "@/lib/config/version";
import { cn } from "@/lib/utils/cn";

// 6 Representative Theme Presets for Landing Showcase (3 Light + 3 Dark)
const THEME_SHOWCASE = [
  {
    id: "indigo",
    name: "DayDream Indigo",
    mode: "light",
    accent: "#4F5FD7",
    bg: "#FAFAF8",
    cardBg: "#FFFFFF",
    textColor: "#20242C",
    mutedColor: "#737780",
    swatches: ["#FAFAF8", "#4F5FD7", "#7C6FE8", "#35A879"],
    description: "Calm, focused, and timeless",
  },
  {
    id: "deep-aqua",
    name: "Deep Aqua",
    mode: "light",
    accent: "#0E7490",
    bg: "#F0F9FF",
    cardBg: "#FFFFFF",
    textColor: "#164E63",
    mutedColor: "#64748B",
    swatches: ["#F0F9FF", "#0E7490", "#06B6D4", "#14B8A6"],
    description: "Crisp, refreshing, and modern",
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    mode: "light",
    accent: "#4338CA",
    bg: "#F8F7FF",
    cardBg: "#FFFFFF",
    textColor: "#1E1B4B",
    mutedColor: "#6B7280",
    swatches: ["#F8F7FF", "#4338CA", "#6366F1", "#8B5CF6"],
    description: "Regal, creative, and deep",
  },
  {
    id: "midnight-citrus",
    name: "Midnight Citrus",
    mode: "dark",
    accent: "#F59E0B",
    bg: "#12151D",
    cardBg: "#1D2330",
    textColor: "#F8FAFC",
    mutedColor: "#8E9CAE",
    swatches: ["#12151D", "#F59E0B", "#FB923C", "#FBBF24"],
    description: "Midnight luxury & radiant citrus",
  },
  {
    id: "forest",
    name: "Forest Noir",
    mode: "dark",
    accent: "#34D399",
    bg: "#0B130E",
    cardBg: "#121E17",
    textColor: "#F4FAF6",
    mutedColor: "#83A092",
    swatches: ["#0B130E", "#34D399", "#10B981", "#6EE7B7"],
    description: "Nocturnal, organic, and grounded",
  },
  {
    id: "ruby",
    name: "Imperial Ruby",
    mode: "dark",
    accent: "#FB7185",
    bg: "#160A0E",
    cardBg: "#221017",
    textColor: "#FAF3F5",
    mutedColor: "#A16F82",
    swatches: ["#160A0E", "#FB7185", "#F43F5E", "#FDA4AF"],
    description: "Prestige, velvet, and gemstone wine",
  },
];

// Interactive Category Showcase Data
const CATEGORIES = [
  {
    id: "travel",
    name: "Travel",
    icon: Plane,
    color: "text-sky-600 bg-sky-50 border-sky-200/70",
    badge: "5 Destinations",
    sample: "Watch the Northern Lights in Tromsø",
  },
  {
    id: "skills",
    name: "Skills",
    icon: Compass,
    color: "text-amber-600 bg-amber-50 border-amber-200/70",
    badge: "3 Disciplines",
    sample: "Learn to surf open-ocean waves in Portugal",
  },
  {
    id: "life",
    name: "Life",
    icon: Heart,
    color: "text-rose-600 bg-rose-50 border-rose-200/70",
    badge: "4 Milestones",
    sample: "Camp beneath the Milky Way at Spiti Valley",
  },
  {
    id: "career",
    name: "Career",
    icon: Briefcase,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200/70",
    badge: "2 Endeavors",
    sample: "Publish an independent collection of essays",
  },
  {
    id: "experiences",
    name: "Experiences",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50 border-purple-200/70",
    badge: "6 Moments",
    sample: "Hot air balloon at dawn over Cappadocia",
  },
  {
    id: "custom",
    name: "Custom",
    icon: Layers,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200/70",
    badge: "Unlimited",
    sample: "Create personal categories tailored to your journey",
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState("indigo");
  const [activeCategoryId, setActiveCategoryId] = useState("travel");

  // If already logged in, redirect to home
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/home");
    }
  }, [user, isLoading, router]);

  const activeTheme =
    THEME_SHOWCASE.find((t) => t.id === activeThemeId) || THEME_SHOWCASE[0];
  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[var(--theme-bg,#FAFAF8)] text-stone-900 flex flex-col justify-between selection:bg-stone-900 selection:text-white">
      {/* ====================================================================
          1. NAVIGATION HEADER
          ==================================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--theme-bg,#FAFAF8)]/85 border-b border-stone-200/50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <DayDreamLogo
              size={30}
              className="w-7.5 h-7.5 shadow-2xs group-hover:scale-105 transition-transform"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
              DayDream
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a
              href="#features"
              className="hover:text-stone-950 transition-colors py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-stone-950 transition-colors py-1"
            >
              How It Works
            </a>
            <a
              href="#memories"
              className="hover:text-stone-950 transition-colors py-1"
            >
              Memories
            </a>
            <a
              href="#themes"
              className="hover:text-stone-950 transition-colors py-1"
            >
              Themes
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <Link href="/home">
                <Button variant="primary" size="sm" className="font-semibold shadow-xs">
                  Open DayDream
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-stone-700 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-semibold shadow-xs bg-stone-900 hover:bg-stone-800 text-white"
                  >
                    Start Your Bucket List
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl glass-card text-stone-700 hover:text-stone-950 cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pt-2 pb-6 border-b border-stone-200/80 bg-[var(--theme-bg,#FAFAF8)] animate-fade-in text-left space-y-4">
            <nav className="flex flex-col gap-2 pt-2">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100/80"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100/80"
              >
                How It Works
              </a>
              <a
                href="#memories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100/80"
              >
                Memories & Reflections
              </a>
              <a
                href="#themes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100/80"
              >
                12 Handcrafted Themes
              </a>
            </nav>

            <div className="pt-2 border-t border-stone-200/60 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                >
                  Start Your Bucket List
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-x-hidden">
        {/* ====================================================================
            2. HERO SECTION
            ==================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/60 border border-stone-200 text-stone-700 text-xs font-medium mb-6 animate-fade-in shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-stone-800" />
            <span>A calm space for life&apos;s greatest adventures</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-stone-950 font-serif-heading leading-[1.12] mb-6">
            Make memories <br />
            <span className="italic font-serif">worth remembering.</span>
          </h1>

          {/* Supportive Copy */}
          <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            Turn the things you dream about into experiences you can actually
            live — then keep the memories that came from them.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 font-semibold shadow-md bg-stone-900 hover:bg-stone-800 text-white rounded-2xl active:scale-98 transition-all"
              >
                Start Your Bucket List
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 font-medium rounded-2xl glass-card hover:border-stone-400 text-stone-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* ====================================================================
            3. REAL PRODUCT PREVIEW MOCKUP
            ==================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-stone-200/50 to-stone-100/30 border border-stone-200/80 shadow-xl backdrop-blur-xl">
            {/* App Window Chrome / Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 mb-3 border-b border-stone-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/70 border border-stone-200/60 text-[11px] font-medium text-stone-500 shadow-2xs">
                <DayDreamLogo size={14} className="w-3.5 h-3.5" />
                <span>daydream.app/dashboard</span>
              </div>
              <div className="w-10" />
            </div>

            {/* Inner Real DayDream Dashboard Mockup */}
            <div className="bg-white/90 rounded-2xl p-4 sm:p-7 border border-stone-200/80 shadow-xs text-left">
              {/* Dashboard Headline & Live Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                      My Bucket List
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      14 Goals
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    8 dreams realized · 6 in progress
                  </p>
                </div>

                {/* Progress Ring / Bar */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    57%
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-stone-800">
                      Life Milestones
                    </p>
                    <p className="text-[10px] text-stone-400">
                      Celebrated & Remembered
                    </p>
                  </div>
                </div>
              </div>

              {/* Realistic Goal Cards Stack */}
              <div className="space-y-3 pt-5">
                {/* Dream Item 1: Active Planning */}
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card-interactive border border-stone-200/80 hover:border-stone-400 gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1 sm:mt-0 shrink-0 shadow-2xs" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        Watch the Northern Lights in Tromsø
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60">
                          Travel
                        </span>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Target: Dec 2026
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-[11px] font-medium text-stone-500 px-2.5 py-1 rounded-lg bg-stone-100/80">
                      Planning
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>

                {/* Dream Item 2: Completed with Saved Memory */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 space-y-2">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-stone-900 line-through text-stone-400">
                          Solo journey through Kyoto & Arashiyama
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-700">
                          ✓ Completed & Celebrated
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-stone-500 border border-stone-200 shrink-0">
                      Travel
                    </span>
                  </div>

                  {/* Attached Reflection Snippet */}
                  <div className="ml-8 p-3 rounded-xl bg-white/80 border border-emerald-100 text-xs italic font-serif text-stone-700 flex items-start gap-2">
                    <Quote className="w-3.5 h-3.5 text-emerald-600/70 shrink-0 mt-0.5" />
                    <span>
                      &ldquo;The quietest bamboo groves at dawn. Made the whole
                      journey unforgettable.&rdquo;
                    </span>
                  </div>
                </div>

                {/* Dream Item 3: Skills / Aspiration */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-card-interactive border border-stone-200/80 hover:border-stone-400 gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 sm:mt-0 shrink-0 shadow-2xs" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        Learn to catch open-ocean waves in Portugal
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                          Skills
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Dreaming
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-lg">
                      <CalendarPlus className="w-3 h-3 text-stone-500" />
                      Schedule on Calendar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. "YOUR DREAMS, ORGANIZED" SECTION
            ==================================================================== */}
        <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Organization Without Clutter
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              Your dreams deserve a place to live.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Keep the places you want to go, things you want to learn,
              experiences you want to have, and moments you don&apos;t want to miss
              all in one calm space.
            </p>
          </div>

          {/* Interactive Category Chips & Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer active:scale-98",
                    isSelected
                      ? "glass-card shadow-sm border-stone-900 bg-stone-900 text-white"
                      : "glass-card-interactive hover:border-stone-300 text-stone-800"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center mb-2 shadow-2xs",
                      isSelected ? "bg-white/15 text-white" : cat.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold truncate">{cat.name}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-0.5 truncate",
                      isSelected ? "text-stone-300" : "text-stone-400"
                    )}
                  >
                    {cat.badge}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Dynamic Example Preview Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/60 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <span className="text-lg">✨</span>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {activeCategory.name} Example
                </p>
                <p className="text-xs text-stone-600 font-serif italic">
                  &ldquo;{activeCategory.sample}&rdquo;
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-stone-500 bg-white px-3 py-1 rounded-lg border border-stone-200 shrink-0 self-start sm:self-auto">
              Customizable categories & filters
            </span>
          </div>
        </section>

        {/* ====================================================================
            5. "MORE THAN A BUCKET LIST" (The 4 Pillars)
            ==================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60 text-left">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Beyond Plain Task Management
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              Not just things to do. <br />
              <span className="italic font-serif">Things worth living.</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Standard task apps are for groceries and chores. DayDream is built
              specifically for your aspirations and memories.
            </p>
          </div>

          {/* 4 Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Pillar 1: DREAM */}
            <div className="p-6 rounded-3xl glass-card border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  01 — Capture
                </span>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  Dream without deadlines
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Capture experiences you&apos;ve always wanted. No rush, no pressure,
                  no artificial anxiety.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-500 font-medium flex items-center justify-between">
                <span>&ldquo;Watch Northern Lights in Norway&rdquo;</span>
                <span className="px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200 text-[10px]">
                  Travel
                </span>
              </div>
            </div>

            {/* Pillar 2: PLAN */}
            <div className="p-6 rounded-3xl glass-card border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  02 — Schedule
                </span>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  Plan with real momentum
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Give your dreams a date and calendar presence. Convert big dreams
                  into actionable daily to-do tasks.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-700 font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  Oct 12, 2026 · Target Date
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ListTodo className="w-3 h-3" /> Linked To-Do
                </span>
              </div>
            </div>

            {/* Pillar 3: LIVE */}
            <div className="p-6 rounded-3xl glass-card border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  03 — Achieve
                </span>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  Celebrate the moment
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  When the moment finally arrives, mark it achieved with
                  celebratory acoustic feedback and confetti.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Milestone Completed!
                </span>
                <span className="text-sm">🎉</span>
              </div>
            </div>

            {/* Pillar 4: REMEMBER */}
            <div className="p-6 rounded-3xl glass-card border border-stone-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  04 — Reflect
                </span>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  Preserve the memory forever
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Record what happened, how it felt, and why it mattered in a
                  built-in personal reflection journal.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs text-stone-700 italic font-serif flex items-center gap-2">
                <Quote className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">
                  &ldquo;Still one of the most peaceful weeks of my life.&rdquo;
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. "HOW IT WORKS" TIMELINE SECTION
            ==================================================================== */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60 text-left">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Simple & Calm Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              How DayDream works.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              From the first spark of inspiration to a cherished memory you can
              revisit for years.
            </p>
          </div>

          {/* 4 Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-stone-200/80 relative">
              <span className="text-2xl font-serif text-stone-300 font-bold block mb-2">
                01
              </span>
              <h4 className="text-sm font-bold text-stone-900 mb-1">DREAM</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Add something you&apos;ve always wanted to experience. No pressure.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-stone-200/80 relative">
              <span className="text-2xl font-serif text-stone-300 font-bold block mb-2">
                02
              </span>
              <h4 className="text-sm font-bold text-stone-900 mb-1">PLAN</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Assign a category, target date, reminder, or break into daily tasks.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-stone-200/80 relative">
              <span className="text-2xl font-serif text-stone-300 font-bold block mb-2">
                03
              </span>
              <h4 className="text-sm font-bold text-stone-900 mb-1">LIVE</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Step into the experience and celebrate achievement in the real
                world.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-stone-200/80 relative">
              <span className="text-2xl font-serif text-stone-300 font-bold block mb-2">
                04
              </span>
              <h4 className="text-sm font-bold text-stone-900 mb-1">REMEMBER</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Write down what it meant to you so the memory never fades.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================================
            7. REFLECTION / MEMORY SECTION
            ==================================================================== */}
        <section id="memories" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              The Soul of DayDream
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              Because the best part comes after.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              When a dream becomes real, DayDream lets you capture the memory —
              what happened, how it felt, and why it mattered.
            </p>
          </div>

          {/* Faithful Reproduction of DayDream Reflection Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-md relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -z-0 opacity-70 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Milestone Memory
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                    Visit Kyoto & Mount Hiei
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed · Nov 14, 2025
                </span>
              </div>

              {/* Reflection Card Content */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-stone-800 relative">
                <Quote className="w-10 h-10 text-stone-200 absolute top-4 right-4 pointer-events-none" />
                <p className="text-base sm:text-lg leading-relaxed font-serif italic text-stone-800 pr-6">
                  &ldquo;One of those days I&apos;ll remember forever. The streets were
                  quiet, the food was incredible, and watching the sunset from
                  the hill made the whole trip worth it.&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400">
                  <span>Captured personal reflection</span>
                  <span>Kyoto, Japan 🇯🇵</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            8. REMINDERS & NOTIFICATIONS SECTION
            ==================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Gentle Reminders
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              Dreams shouldn&apos;t disappear into tomorrow.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Set a reminder for the moments that matter and let DayDream bring
              them back to your attention without invasive noise.
            </p>
          </div>

          {/* Realistic Liquid Glass Notification Toast UI */}
          <div className="max-w-md mx-auto">
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-stone-200 shadow-lg relative">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      DayDream Reminder
                    </span>
                    <span className="text-[10px] text-stone-400">Tonight · 8:00 PM</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                    Your dream is waiting ✨
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Book reservations for the Kyoto sunrise tour.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3 text-stone-400" />
                  Web Push & In-App Toast
                </span>
                <span className="font-semibold text-stone-800">
                  Quiet Hours Respected
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            9. PERSONALIZATION / THEMES SECTION
            ==================================================================== */}
        <section id="themes" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              12 Handcrafted Palettes (6 Light + 6 Dark)
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              Make DayDream feel like yours.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Choose a visual mood that fits you. Tested and tuned for daylight
              focus and nighttime calmness.
            </p>
          </div>

          {/* Interactive Miniature Theme Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {THEME_SHOWCASE.map((t) => {
              const isSelected = activeThemeId === t.id;
              const isDark = t.mode === "dark";

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThemeId(t.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between gap-3 active:scale-98",
                    isSelected
                      ? "glass-card shadow-md border-2"
                      : "glass-card-interactive"
                  )}
                  style={{
                    borderColor: isSelected ? t.accent : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* 4-color palette swatch preview */}
                    <div
                      className={cn(
                        "flex items-center gap-1 p-1 rounded-xl shrink-0 shadow-2xs",
                        isDark
                          ? "bg-black/40 border border-white/10"
                          : "bg-black/5 border border-stone-200/60"
                      )}
                    >
                      {t.swatches.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {t.name}
                        </p>
                        <span
                          className={cn(
                            "text-[8px] font-semibold px-1 py-0.2 rounded uppercase",
                            isDark
                              ? "bg-stone-800 text-stone-300"
                              : "bg-stone-100 text-stone-600"
                          )}
                        >
                          {t.mode}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {/* Active Radio Indicator */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-2xs"
                        style={{ backgroundColor: t.accent }}
                      >
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-stone-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Live Theme Preview Card */}
          <div
            className="p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-sm"
            style={{
              backgroundColor: activeTheme.bg,
              borderColor: activeTheme.accent,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: activeTheme.mutedColor }}
                >
                  Live Theme Preview
                </span>
                <h4
                  className="text-base sm:text-lg font-bold"
                  style={{ color: activeTheme.textColor }}
                >
                  {activeTheme.name}
                </h4>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: activeTheme.mutedColor }}
                >
                  {activeTheme.description} · Seamless across all 5 sections.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-xl text-xs font-semibold shadow-xs"
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: activeTheme.mode === "dark" ? "#0D1117" : "#FFFFFF",
                  }}
                >
                  Active Accent
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            10. MIDNIGHT CITRUS DARK MOMENT
            ==================================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-3xl p-6 sm:p-12 bg-[#12151D] text-white border border-stone-800 shadow-2xl relative overflow-hidden text-left">
            {/* Amber Ambient Radial Glow */}
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
              style={{ backgroundColor: "#F59E0B" }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-10 blur-3xl"
              style={{ backgroundColor: "#38BDF8" }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Midnight Citrus</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif-heading leading-tight mb-4 text-stone-100">
                  Your dreams don&apos;t stop when the sun goes down.
                </h2>

                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed mb-6">
                  Whether reflecting late at night or planning before bed,
                  DayDream&apos;s 6 handcrafted dark themes deliver high-contrast
                  luxury without screen glare.
                </p>

                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Deep OLED Blacks
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Specular Glass Rims
                  </span>
                </div>
              </div>

              {/* Dark DayDream UI Card Mockup */}
              <div className="p-5 rounded-2xl bg-[#1D2330]/90 border border-white/10 shadow-xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                    Nighttime Focus
                  </span>
                  <span className="text-[10px] text-stone-400">Tonight · 11:30 PM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#252D3D] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-100">
                      Stargazing in the Atacama Desert
                    </h4>
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] flex items-center justify-center">
                      ★
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Clear skies, zero light pollution, high-altitude telescope session.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px] text-amber-400 font-medium">
                    <span>Target: October 2026</span>
                    <span>·</span>
                    <span>Travel & Life</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            11. SOUND & ATMOSPHERE SECTION
            ==================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-stone-200/60 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Calm Atmosphere
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 font-serif-heading leading-tight mb-4">
              A little atmosphere goes a long way.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              DayDream incorporates handcrafted, gentle acoustic feedback —
              from tactile click taps to celebratory confetti harmonies when
              dreams come true.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-stone-200/80">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                <Volume2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Dream Celebration</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                A warm, grand harmonic shimmer when completing a milestone.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-stone-200/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Tactile Micro-Taps</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Subtle 40ms acoustic pulses on button interactions and toggles.
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-stone-200/80">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
                <Bell className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Full Audio Control</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Master toggle & volume slider in settings. Zero surprise autoplay.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================================
            12. EMOTIONAL STATEMENT SECTION
            ==================================================================== */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <div className="w-10 h-0.5 bg-stone-300 mx-auto mb-8" />
          <h2 className="text-3xl sm:text-5xl font-normal tracking-tight font-serif-heading leading-[1.2] mb-6 text-stone-950">
            &ldquo;One day, your bucket list <br />
            <span className="italic font-serif">becomes your memory.&rdquo;</span>
          </h2>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal max-w-xl mx-auto">
            DayDream isn&apos;t about checking things off a list. It&apos;s about giving the
            things you care about a place to become real.
          </p>
          <div className="w-10 h-0.5 bg-stone-300 mx-auto mt-8" />
        </section>

        {/* ====================================================================
            13. FINAL CALL TO ACTION
            ==================================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28 text-center">
          <div className="p-8 sm:p-14 rounded-3xl glass-card border border-stone-200/90 shadow-lg relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-stone-200/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-normal tracking-tight font-serif-heading text-stone-950">
                What&apos;s the next memory you&apos;re going to make?
              </h2>

              <p className="text-base text-stone-600 max-w-md mx-auto">
                Start with one dream. Keep it, plan it, live it, and remember it.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3.5 font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-2xl shadow-md active:scale-98 transition-all"
                  >
                    Start Your Bucket List
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3.5 font-medium rounded-2xl glass-card"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          14. MINIMAL FOOTER
          ==================================================================== */}
      <footer className="border-t border-stone-200/70 py-8 px-4 sm:px-6 bg-[var(--theme-bg,#FAFAF8)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2.5">
            <DayDreamLogo size={22} className="w-5.5 h-5.5" />
            <span className="font-bold text-stone-900">DayDream</span>
            <span className="text-stone-300">·</span>
            <span className="italic font-serif">Make memories worth remembering.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-stone-500">
            <a href="#features" className="hover:text-stone-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">
              How It Works
            </a>
            <a href="#memories" className="hover:text-stone-900 transition-colors">
              Memories
            </a>
            <a href="#themes" className="hover:text-stone-900 transition-colors">
              Themes
            </a>
            <Link href="/login" className="hover:text-stone-900 transition-colors">
              Sign In
            </Link>
          </div>

          <div className="text-[11px] text-stone-400">
            DayDream {APP_VERSION}
          </div>
        </div>
      </footer>
    </div>
  );
}


